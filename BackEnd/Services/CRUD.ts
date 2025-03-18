import { promises } from "dns";
import { getDB } from "../DB/Connection"    
import { error } from "console";

//#region CRUD for user table
export async function createUser(user:any) {
    try{
        const db = await getDB();
        const existingPhone = await db.get(`SELECT * FROM User WHERE phone = ?`, [user.phone]);

        if(existingPhone){
            console.error(`The Phone number already existis`)
            return
        }
        const query = `INSERT INTO User
                       (name, email, password, phone, alternative_phone, country, role_id) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`
        const values = [
            user.name,
            user.email,
            user.password,
            user.phone,
            user.alternative_phone,
            user.country,
            user.role_id
        ];
        await db.run(query, values);
        console.log('User Created Successfully');
    }catch (error){
        console.error('Cant create the user, please try again', error.message);
    }
}
export async function getAllUsers() {
    try{
        const db = await getDB();
        const query = `SELECT u. *,
                        group_concat(DISTINCT r.role_name) AS Role
                        FROM User u
                        LEFT JOIN Role r ON u.role_id = r.id
                        GROUP BY  u.id
                        `;
        const users = await db.all(query);
        return users;        
    }catch(error){
        console.error(`Cant fetch the users`, error.message);
    }
}

export async function getUserByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT u. *,
                        group_concat(DISTINCT r.role_name) AS Role
                        FROM User u 
                        LEFT JOIN Role r ON u.role_id = r.id
                        WHERE u.id = ?
                        GROUP BY  r.role_name`;
        const user = await db.get(query, [id]);
        if(!user){
            console.error(`No user found with id ${id}`);
            return null;
        }
        return user;
    }catch(error){
        console.error(`Cant find user with id ${id}`, error.message);
    }
}

export async function editUserByID(id:number, 
    updates: Partial <{
        name: string,
        email: string,
        password: string,
        phone: number,
        alternative_phone: number,
        country: string,
        role_id: number,
    }>
) {
    try{
        const db =  await getDB();
        const userExist = await db.get(`SELECT 1 FROM User WHERE id = ?`, [id]);
        if(!userExist){
            throw new Error(`User with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE User SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`User withe id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the user with id ${id}`, (error as Error).message);
    }
}

export async function deleteUserByID(id:number): Promise<void> {
        try{
            const db = await getDB();
            const userExist = await db.get(`SELECT 1 FROM User WHERE id = ?`, id);
            if(!userExist){
                throw new Error(`User with id: ${id} does not exist`);
            }
            const query = `DELETE FROM User WHERE id = ?`;
            const result  = await db.run(query, id);
            if(result.changes === 0){
                throw new Error(`Failed to delete the User with the id ${id}`);
            }
            console.log(`User deleted successfully`);
    }catch(error){
        console.error(`error deleting the User`, (error as Error).message);
        throw Error;
    }
}
//#endregion 

//#region CRUD for Status table
//Create a Status
export async function createStatus(status: any) 
         {
             try{
                 const db = await getDB();
                 const query = `
                     INSERT INTO Status
                     (payment_made, current_student, current_worker, active_candidate,applied,open_offer)
                     VALUES (?, ?, ?, ?, ?, ?);
                 `;
                 const values = Object.values(status)
                 await db.run(query, values);
                 console.log('Status added successfully');
             }catch(error){
                 console.error('Cant add this status please try again', (error as Error).message);
             }
         };

//#endregion

//#region CRUD for Role Table
export async function getAllRoles() {
    try{
        const db = await getDB();
        const query = `SELECT * FROM Role
                        GROUP BY Role.id`
        const roles = await db.all(query)
        console.log(roles)
        return roles        
    }catch(error){
        console.error(`Cant fetch the roles`, error.message);
    }
}

export async function getRoleByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT * FROM Role WHERE Role.id = ?`;
        const role =  db.get(query, [id]);
        if(!role){
            console.error(`Cant find role with id: ${id}`);
            return null;
        }
        return role;
    }catch(error){
        console.error(`Couldnt fetch role with id ${id}`, error.message);
    }
}
//#endregion

//#region CRUD for Candidates table

export async function createCandidate(candidate:any) {
    try{
        const db = await getDB();
        const existingUser = await db.get (`SELECT * FROM candidate WHERE id = ?`, [candidate.id]);
        if(existingUser){
            console.error(`User with id ${candidate.id} already exists`);
            return;
        }
        const query =  `INSERT INTO Candidate 
                        (user_id, genre, experience_id, languages_id, status_id, education_id)
                        VALUES (?, ?, ?, ?, ?, ? ) `
        const values = [
            candidate.user_id,
            candidate.genre,
            candidate.experience_id,
            candidate.languages_id,
            candidate.status_id,
            candidate.education_id
        ]
        await db.run(query, values);
        console.log(`Candidate assigned successfully`);
    }catch(error){
        console.error(`Something went wrong please try again`, error.message);
    }
}

export async function getaAllCandidates() {
    try{
        const db = await getDB();
        const query = `SELECT Candidate.*, 
                    User.name, 
                    language.language, 
                    Status.status_name, 
                    Experience.position_name, 
                    Experience.company, 
                    Education.degree, 
                    Education.graduation_date
                    FROM Candidate
                    LEFT JOIN User ON User.id = Candidate.user_id
                    LEFT JOIN language ON language.id = Candidate.languages_id
                    LEFT JOIN Status ON Status.id = Candidate.status_id
                    LEFT JOIN Experience ON Experience.id = Candidate.experience_id
                    LEFT JOIN Education ON Education.id = Candidate.education_id
                    GROUP BY Candidate.id;`
        const candidates = await db.all(query);
        console.log(`Candidates fetched successfully`);
        return candidates;    
    }catch(error){
        console.error(`Impossible to fetch the candidates`, error.message);
    }
}

export async function getCandidateByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT Candidate.*, 
                    User.name, 
                    language.language, 
                    Status.status_name, 
                    Experience.position_name, 
                    Experience.company, 
                    Education.degree, 
                    Education.graduation_date
                    FROM Candidate
                    LEFT JOIN User ON User.id = Candidate.user_id
                    LEFT JOIN language ON language.id = Candidate.languages_id
                    LEFT JOIN Status ON Status.id = Candidate.status_id
                    LEFT JOIN Experience ON Experience.id = Candidate.experience_id
                    LEFT JOIN Education ON Education.id = Candidate.education_id
                    WHERE Candidate.id = ?;
                    GROUP BY Candidate.id;`
        const candidate = db.get(query, [id]);
        if(!candidate){
            console.error(`Cant find candidate with id: ${id}`);
        }
        console.log(`Candidate with id: ${id} found:`, candidate);
        return candidate;
    }catch(error){
        console.error(`Cant fetch the candidate, please try again`, error.message);
    }
}

export async function editCandidateByID(id:number,
     updates: Partial<{
         genre: string,
         experience_id: number,
         language_id: number,
         status_id: number,
         education_id:number
    }>) {

      try{
        const db =  await getDB();
        const candidateExist = await db.get(`SELECT 1 FROM Candidate WHERE id = ?`, [id]);
        if(!candidateExist){
            throw new Error(`Candidate with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Candidate SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`User withe id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the user with id ${id}`, (error as Error).message);
    }
}

export async function deleteCandidateByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const candidateExist = await db.get(`SELECT 1 FROM Candidate WHERE id = ?`, id);
        if(!candidateExist){
            throw new Error(`Candidate with id: ${id} does not exist`);
        }
        const query = `DELETE FROM Candidate WHERE id = ?`;
        const result  = await db.run(query, id);
        if(result.changes === 0){
            throw new Error(`Failed to delete the Candidate with the id ${id}`);
        }
        console.log(`Candidate deleted successfully`);
}catch(error){
    console.error(`Error deleting the Candidate`, (error as Error).message);
    throw Error;
}
}
//#endregion

//#region CRUD For languages table

export async function createLanguage(L:any) {
    try{
        const db = await getDB();
        const languageExist =  await db.get(`SELECT * FROM Langauge WHERE langiuage = ?`, [L.Langauge]);
        if(languageExist){
            console.error(`The Language already existis`)
            return
        }
        const query =  `INSERT INTO Language (language) VALUES (?)`
        const values = [
            L.language
        ]
        await db.run(query, values);
        console.log(`Language created successfully`);
    }catch(error){
       console.error(`Impossible to create the language please try again`, error.message);
    }
}
//#endregion