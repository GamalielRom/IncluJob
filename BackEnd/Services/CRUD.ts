import { promises } from "dns";
import { getDB } from "../DB/Connection"    
import { error } from "console";
import { getgid } from "process";

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
export async function getAllStatuses() {
            try{
                const db = await getDB();
                const query = `SELECT * FROM Status `;
                const status = await db.all(query);
                return status;        
            }catch(error){
                console.error(`Cant fetch the statuses`, error.message);
            }
        }
export async function getStatusByID(id:number) {
            try{
                const db = await getDB();
                const query = `SELECT s.*
                                FROM Status s 
                                WHERE s.id = ?`;
                const status = await db.get(query, [id]);
                if(!status){
                    console.error(`No status found with id ${id}`);
                    return null;
                }
                return status;
            }catch(error){
                console.error(`Cant find status with id ${id}`, error.message);
            }
        }
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
        const candidate = await db.get(query, [id]);
        if(!candidate){
            console.error(`Cant find candidate with id: ${id}`);
            return null;
        }
        console.log(`Candidate with id: ${id} found:`, candidate);
        return candidate;
    }catch(error){
        console.error(`Cant fetch the candidate, please try again`, error.message);
        throw error
    }
}


export async function getAllExperienceByCandidateID(user_id:number) {
    try{
        const db = await getDB();
        const userExist = await db.get( `SELECT * FROM User WHERE id = ?`, [user_id]);
        if(!userExist){
            console.log("This candidate do not exist please try with other")
            return null
        }
        const query = `SELECT e.position_name, e.description, e.start_date, e.end_date, e.company,u.name AS user_name, s.status_name
        FROM Experience e
        LEFT JOIN Candidate c ON c.id = e.candidate_id
        LEFT JOIN User u ON u.id = c.user_id
        LEFT JOIN Status s ON s.id = e.status_id
        WHERE u.id = ?`
        const experience = await db.all(query, [user_id]);
        console.log(`Experience by candidate with id ${user_id} sucessfully fetched`);
        return experience
    }catch(error){
        console.error('Impossible to fetch the experience for this user please try again', error.message);
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
        const languageExist =  await db.get(`SELECT * FROM Langauge WHERE language = ?`, [L.Language]);
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
export async function getAllLanguages() {
    try{
        const db = await getDB();
        const query = `SELECT * FROM Language `;
        const language = await db.all(query);
        return language;        
    }catch(error){
        console.error(`Cant fetch the languages`, error.message);
    }
}
export async function getLanguageByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT l.*
                        FROM Language l 
                        WHERE l.id = ?`;
        const language = await db.get(query, [id]);
        if(!language){
            console.error(`No language found with id ${id}`);
            return null;
        }
        return language;
    }catch(error){
        console.error(`Cant find language with id ${id}`, error.message);
    }
}
export async function editLanguageByID(id:number, 
    updates: Partial <{
        language: string
    }>
) {
    try{
        const db =  await getDB();
        const languageExist = await db.get(`SELECT 1 FROM Language WHERE id = ?`, [id]);
        if(!languageExist){
            throw new Error(`Language with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Language SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`Language withe id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the language with id ${id}`, (error as Error).message);
    }
}

export async function deleteLanguageByID(id:number): Promise<void> {
        try{
            const db = await getDB();
            const languageExist = await db.get(`SELECT 1 FROM Language WHERE id = ?`, id);
            if(!languageExist){
                throw new Error(`Language with id: ${id} does not exist`);
            }
            const query = `DELETE FROM Language WHERE id = ?`;
            const result  = await db.run(query, id);
            if(result.changes === 0){
                throw new Error(`Failed to delete the Language with the id ${id}`);
            }
            console.log(`Laguage deleted successfully`);
    }catch(error){
        console.error(`error deleting the Language`, (error as Error).message);
        throw Error;
    }
}

//#endregion


//#region CRUD for Locations table
export async function createLocation(location:any) {
    try{
        const db = await getDB();
        const query = `INSERT INTO location (city, country,remote, remote_type, postal_code)
                       VALUES (?, ?, ?, ?, ? )`;
        const existingLocation = await db.get(`SELECT * FROM Location WHERE postal_code = ?`, [location.postal_code]);
        if(existingLocation){
            console.log(`This location already exist, please select another postal code`);
        }
        if(!['Full', 'Hybrid'].includes(location.remote_type)){
            console.error('Remote type can only be full time or hybrid');
            return
        }
        const values = [
            location.city,
            location.country,
            location.remote,
            location.remote_type,
            location.postal_code
        ]
        await db.run(query, values);
        console.log(`Location created succesfully`, location);
    }catch(error){
        console.error(`Impossible to create this location please try again`, error.message);
    }
}

export async function getAllLocations() {
    try{
        const db = await getDB();
        const query = `SELECT * FROM Location GROUP BY Location.country`;
        const location = await db.all(query);
        console.log(`Fetch location successfully`, location);
        return location;
    }catch(error){
        console.error(`Error fetching locations`, error.message);
    }
}

export async function getLocationsByCountry(country:string) {
    try{ 
        const db = await getDB();
        const query = `SELECT * FROM Location WHERE country = ?`;
        const locations = await db.all(query, [country]);
        return locations;
    }catch(error){
        console.error(`Error fetching locations for country: ${country}`, error.message);
    }
}

export async function getLocationByCity(city:string) {
    try{ 
        const db = await getDB();
        const query = `SELECT * FROM Location WHERE city = ?`;
        const locations = await db.all(query, [city]);
        return locations;
    }catch(error){
        console.error(`Error fetching locations for country: ${city}`, error.message);
    }
}

export async function getLocationByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT l.*
                        FROM Location l 
                        WHERE l.id = ?`;
        const location = await db.get(query, [id]);
        if(!location){
            console.error(`No language found with id ${id}`);
            return null;
        }
        return location;
    }catch(error){
        console.error(`Cant find language with id ${id}`, error.message);
    }
}

export async function editLocationByID(id:number, updates:Partial<{
    city:string,
    country:string,
    remote:boolean,
    remote_type:string,
    postal_code:string
}>) {
    try{
        const db =  await getDB();
        const locationExist = await db.get(`SELECT 1 FROM Location WHERE id = ?`, [id]);
        if(!locationExist){
            throw new Error(`Location with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Location SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`User withe id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the Location with id ${id}`, (error as Error).message);
    }
}

export async function deleteLocationByID(id:number): Promise <void> {
    try{
        const db = await getDB();
        const locationExist = await db.get(`SELECT 1 FROM Location WHERE id = ?`, [id]);
            if(!locationExist){
                throw new Error(`Location with id: ${id} does not exist`);
            }
            const query = `DELETE FROM Location WHERE id = ?`;
            const result  = await db.run(query, id);
            if(result.changes === 0){
                throw new Error(`Failed to delete the Language with the id ${id}`);
            }
            console.log(`Laguage deleted successfully`);
    }catch(error){
        console.error(`error deleting the Location`, (error as Error).message);
        throw Error;
    }
}
//#endregion


//#region CRUD for Education table
export async function createEducation(education:any) {
    try{
        const db = await getDB();
        //Education records are equal if the candidate ID, Institution number and Degree are the same
        const educationExist =  await db.get( `SELECT * FROM Education WHERE candidate_id = ? AND institution_name = ? AND degree = ?`, [education.candidate_id, education.institution_name, education.degree]);
        if(educationExist){
            console.error(`The Education record already exists`)
            return
        }
        const query =  `INSERT INTO Education (institution_name, started_date, graduation_date, degree, candidate_id, status_id) VALUES (?, ?, ?, ?, ?, ?)`
        const values = [
            education.institution_name,
            education.started_date,
            education.graduation_date,
            education.degree,
            education.candidate_id,
            education.status_id
        ]
        await db.run(query, values);
        console.log(`Education created successfully`);
    }catch(error){
       console.error(`Impossible to create the education please try again`, error.message);
    }
}
export async function getAllEducations(){
    try{
        const db = await getDB();
        const query = `SELECT e.institution_name, e.started_date, e.graduation_date, e.degree, u.name, s.status_name 
        FROM Education e 
        LEFT JOIN Candidate c ON e.candidate_id = c.id
        LEFT JOIN Status s ON e.status_id = s.id
        LEFT JOIN User u ON c.user_id = u.id
        GROUP BY e.id;`
        const educations = await db.all(query);
        console.log(`Educations fetched successfully`)
        return educations;
    }
    catch(error){
        console.error(`Imposible to fetch the educations`, error.message)
    }
}
export async function getEducationByID(id:number){
    try
    {
        const db = await getDB();
        const query =`SELECT e.institution_name, e.started_date, e.graduation_date, e.degree, u.name, s.status_name 
            FROM Education e 
            LEFT JOIN Candidate c ON e.candidate_id = c.id
            LEFT JOIN Status s ON e.status_id = s.id
            LEFT JOIN User u ON c.user_id = u.id
            WHERE e.id = ?
            GROUP BY e.id;`
        const education = db.get(query,[id]);
        if(!education){
            console.error(`Cant find education record with id: ${id}`);
        }
        console.log(`Education record with id: ${id} found:`, education);
        return education;
    }
    catch(error){
        console.log(`Cant fetch the education record, please try again`, error.message)
    }
}
export async function editEducationByID(id: number,
    updates: Partial<{
        institution_name: string,
        started_date: Date,
        graduation_date: Date,
        degree: string,
        candidate_id: number,
        status_id: number
    }>) {

    // Function to format date to YYYY-MM-DD
    const formatDate = (date?: Date) => {
        return date ? date.toISOString().split('T')[0] : undefined;
    };

    try {
        const db = await getDB();
        const educationExist = await db.get(`SELECT 1 FROM Education WHERE id = ?`, [id]);
        if (!educationExist) {
            throw new Error(`Education record with id ${id} does not exist`);
        }
        if (Object.keys(updates).length === 0) {
            throw new Error(`No fields provided for update.`);
        }

        // Format the dates before adding to the values array
        const formattedStartedDate = updates.started_date ? formatDate(updates.started_date) : undefined;
        const formattedGraduationDate = updates.graduation_date ? formatDate(updates.graduation_date) : undefined;

        // Filter out undefined fields from the updates object
        const filteredUpdates = {
            ...updates,
            started_date: formattedStartedDate,
            graduation_date: formattedGraduationDate
        };

        // Prepare the fields and values arrays, excluding undefined values
        const fields = Object.keys(filteredUpdates)
            .filter(key => filteredUpdates[key] !== undefined) // Exclude undefined values
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(filteredUpdates)
            .filter(value => value !== undefined); // Exclude undefined values
        values.push(id); // Add the id at the end for the WHERE clause

        const query = `UPDATE Education SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`Education record with id: ${id} updated successfully`);
    } catch (error) {
        console.error(`Impossible to update the education with id ${id}`, (error as Error).message);
    }
}

export async function deleteEducationByID(id:number): Promise<void> {
   try{
       const db = await getDB();
       const educationExist = await db.get(`SELECT 1 FROM Education WHERE id = ?`, id);
       if(!educationExist){
           throw new Error(`Education record with id: ${id} does not exist`);
       }
       const query = `DELETE FROM Education WHERE id = ?`;
       const result  = await db.run(query, id);
       if(result.changes === 0){
           throw new Error(`Failed to delete the Education record with the id ${id}`);
       }
       console.log(`Education record deleted successfully`);
    }catch(error){
       console.error(`Error deleting the Education`, (error as Error).message);
       throw Error;
    }
}
//#endregion

      
//#region CRUD for assistance devices table
export async function createAssistanceDevice(AD:any) {
    try{
        const db = await getDB();
        const ADExist =  await db.get(`SELECT * FROM AssistanceDevice WHERE device_name = ?`, [AD.device_name]);
        if(ADExist){
            console.error(`AssistanceDevice with name ${AD.device_name} already exists`);
            return;
        }
        const query = `INSERT INTO AssistanceDevice (device_name) VALUES (?)`;
        const values = [AD.device_name];
        await db.all(query, values);
        console.log(`Assistance device successfully created`);
    }catch(error){
        console.error(`Error trying to create this asssistance device please try again`, error.message);
    }   
}
export async function getAllAssistanceDevices() {
    try{
        const db = await getDB();
        const query = `SELECT * FROM AssistanceDevice`;
        const AD = await db.all(query);
        console.log(`Successfully fetch of the assistance devices`, AD);
        return AD
    }catch(error){
        console.error(`Error fetching the assistance devices`, error.message);
    }
}

export async function getAssistanceDeviceByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT * FROM AssistanceDevice WHERE AssistanceDevice.id = ?`;
        const AD = await db.all(query, [id]);
        if(!AD){
            console.error(`No Assistance Device found with id ${id}`);
            return null;
        }
        return AD
    }catch(error){
        console.error(`Error trying to find this Assistance Device please try again`, error.message);
    } 
}

export async function editAssistanceDeviceByID(id:number, updates: Partial<{
    device_name: string;
}>) {
    try{
        const db =  await getDB();
        const adExist = await db.get(`SELECT 1 FROM AssistanceDevice WHERE id = ?`, [id]);
        if(!adExist){
            throw new Error(`Assistance device with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE AssistanceDevice SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`Assistance Device withe id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the Assistance device with id ${id}`, (error as Error).message);
    }
}

export async function deleteAssistanceDeviceByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const adExist = await db.get(`SELECT 1 FROM AssistanceDevice WHERE id = ?`, [id]);
            if(!adExist){
                throw new Error(`Asssitance device with id: ${id} does not exist`);
            }
            const query = `DELETE FROM AssistanceDevice WHERE id = ?`;
            const result  = await db.run(query, id);
            if(result.changes === 0){
                throw new Error(`Failed to delete the Device with the id ${id}`);
            }
            console.log(`Device deleted successfully`);
    }catch(error){
        console.error(`error deleting the Device`, (error as Error).message);
        throw Error;
    }
}
//#endregion

//#region CRUD for Industry table
export async function createIndustry(industry:any) {
    try{
        const db = await getDB();
        const industryExist =  await db.get(`SELECT * FROM Industry WHERE industry_name = ?`, [industry.industry_name]);
        if(industryExist){
            console.error(`The Industry already exists`)
            return
        }
        const query =  `INSERT INTO Industry (industry_name) VALUES (?)`
        const values = [
            industry.industry_name
        ]
        await db.run(query, values);
        console.log(`Industry created successfully`);
    }catch(error){
       console.error(`Impossible to create the industry please try again`, error.message);
    }
}
export async function getAllIndustries() {
    try{
        const db = await getDB();
        const query = `SELECT * FROM Industry `;
        const industry = await db.all(query);
        return industry;        
    }catch(error){
        console.error(`Cant fetch the industries`, error.message);
    }
}
export async function getIndustryByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT i.*
                        FROM Industry i
                        WHERE i.id = ?`;
        const industry = await db.get(query, [id]);
        if(!industry){
            console.error(`No industry found with id ${id}`);
            return null;
        }
        return industry;
    }catch(error){
        console.error(`Cant find industry with id ${id}`, error.message);
    }
}
export async function editIndustryByID(id:number, 
    updates: Partial <{
        industry_name: string
    }>
) {
    try{
        const db =  await getDB();
        const industryExist = await db.get(`SELECT 1 FROM Industry WHERE id = ?`, [id]);
        if(!industryExist){
            throw new Error(`Industry with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Industry SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`Industry with id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the industry with id ${id}`, (error as Error).message);
    }
}

export async function deleteIndustryByID(id:number): Promise<void> {
        try{
            const db = await getDB();
            const industryExist = await db.get(`SELECT 1 FROM Industry WHERE id = ?`, id);
            if(!industryExist){
                throw new Error(`Industry with id: ${id} does not exist`);
            }
            const query = `DELETE FROM Industry WHERE id = ?`;
            const result  = await db.run(query, id);
            if(result.changes === 0){
                throw new Error(`Failed to delete the industry with the id ${id}`);
            }
            console.log(`Industry deleted successfully`);
    }catch(error){
        console.error(`error deleting the industry`, (error as Error).message);
        throw Error;
    }
}
//#endregion

//#region CRUD For Employers
export async function createEmployer(employer:any) {
    try{
        const db = await getDB();
        const existingEmployer = await db.get (`SELECT * FROM Employer WHERE company_name = ? AND location = ?`, [employer.company_name, employer.location]);
        if(existingEmployer){
            console.error(`Employer  ${employer.company_name} already exists`);
            return;
        }
        const query =  `INSERT INTO Employer 
                        (company_name, location, company_size, hiring_policy, status_id, user_id)
                        VALUES (?, ?, ?, ?, ?, ? ) `
        const values = [
            employer.company_name,
            employer.location,
            employer.company_size,
            employer.hiring_policy,
            employer.status_id,
            employer.user_id
        ]
        await db.run(query, values);
        console.log(`Employer created successfully`);
    }catch(error){
        console.error(`Something went wrong please try again`, error.message);
    }
}

export async function getaAllEmployers() {
    try{
        const db = await getDB();
        const query = `SELECT e.*, 
					s.status_name,
					u.name as 'User name'
                    FROM Employer e
                    LEFT JOIN User u ON u.id = e.user_id
                    LEFT JOIN Status s ON s.id = e.status_id
                    GROUP BY e.id;`
        const employers = await db.all(query);
        console.log(`Employers fetched successfully`);
        return employers;    
    }catch(error){
        console.error(`Impossible to fetch the employers`, error.message);
    }
}

export async function getEmployerByID(id:number) {
    try{
        const db = await getDB();
        const query = `SELECT e.*, 
					s.status_name,
					u.name as 'User name'
                    FROM Employer e
                    LEFT JOIN User u ON u.id = e.user_id
                    LEFT JOIN Status s ON s.id = e.status_id
                    WHERE e.id = ?;`
        const employer = await db.get(query, [id]);
        if(!employer){
            console.error(`Cant find employer with id: ${id}`);
            return null;
        }
        console.log(`Employer with id: ${id} found:`, employer);
        return employer;
    }catch(error){
        console.error(`Cant fetch the employer, please try again`, error.message);
        throw error;
    }
}

export async function editEmployerByID(id:number,
     updates: Partial<{
         company_name: string,
         location: string,
         company_size: string,
         hiring_policy:string,
         status_id: number,
         user_id:number
    }>) {

      try{
        const db =  await getDB();
        const employerExist = await db.get(`SELECT 1 FROM Employer WHERE id = ?`, [id]);
        if(!employerExist){
            throw new Error(`Employer with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Employer SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`Employer with id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the employer with id ${id}`, (error as Error).message);
        throw error;
    }
}

export async function deleteEmployerByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const employerExist = await db.get(`SELECT 1 FROM Employer WHERE id = ?`, [id]);
        if(!employerExist){
            throw new Error(`Employer with id: ${id} does not exist`);
        }
        const query = `DELETE FROM Employer WHERE id = ?`;
        const result  = await db.run(query, [id]);
        if(result.changes === 0){
            throw new Error(`Failed to delete the employer with the id ${id}`);
        }
        console.log(`Employer deleted successfully`);
    }catch(error){
        console.error(`Error deleting the employer`, (error as Error).message);
        throw Error;
    }
}
//#endregion

//#region EmployerPayments CRUD
export async function createEmployerPayment(empPayment: any){
    try{
        const db = await getDB();
        //A record is the same if the employer ID, subscription type, start date and  end date are the same
        // Check if record already exists
        const empPaymentExist = await db.get(
            `SELECT 1 FROM EmployerPayment 
             WHERE subscription_type = ? 
             AND subscription_start = ? 
             AND subscription_end = ? 
             AND employer_id = ?`,
            [
                empPayment.subscription_type,
                empPayment.subscription_start,
                empPayment.subscription_end, // FIXED TYPO
                empPayment.employer_id
            ]
        );

        if (empPaymentExist) {
            console.error("The Employer Payment record already exists.");
            return;
        }
        const query = `INSERT INTO EmployerPayment 
                    (subscription_type,employer_id,payment_date,amount,payment_method,currency,subscription_start,subscription_end,receipt_url,status_id)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`
        const values =[
            empPayment.subscription_type,
            empPayment.employer_id,
            empPayment.payment_date,
            empPayment.amount,
            empPayment.payment_method,
            empPayment.currency,
            empPayment.subscription_start,
            empPayment.subscription_end,
            empPayment.receipt_url,
            empPayment.status_id
        ]
        await db.run(query,values);
        console.log("Employer Payment record created succesfully")
    }catch(error){
        console.error(`Impossible to create the emnpployer payment record, please try again`, error.message);
    }
}
export async function getAllEmployerPayments(){
    try{
        const db = await getDB();
        const query = `SELECT 
        e.company_name AS Employer_Name,
        s.status_name AS Status_Name,
        ep.subscription_type, ep.payment_date, ep.amount, ep.currency, ep.subscription_start, ep.subscription_end, ep.payment_method, ep.receipt_url
        FROM EmployerPayment ep
        JOIN Employer e ON ep.employer_id = e.id
        JOIN Status s ON ep.status_id = s.id;`
        const empPayments = await db.all(query);
        console.log(`Employer Payments fetched successfully`);
        return empPayments;
    }catch(error){
        console.error(`Impossible to fetch the employer payments`, error.message)
        return [];
    }
}
//Get the LAST payment for each employer\
//Instead of Using the EmployerPayment ID, it will use the employer ID
export async function getLastEmployerPayment(employerId: number) {
    try {
        const db = await getDB();
        const query = `
            SELECT 
                e.company_name AS Employer_Name,
                s.status_name AS Status_Name,
                ep.subscription_type, 
                ep.payment_date, 
                ep.amount, 
                ep.currency, 
                ep.subscription_start, 
                ep.subscription_end, 
                ep.payment_method, 
                ep.receipt_url
            FROM EmployerPayment ep
            JOIN Employer e ON ep.employer_id = e.id
            JOIN Status s ON ep.status_id = s.id
            WHERE ep.employer_id = ?
            ORDER BY ep.payment_date DESC
            LIMIT 1;
        `;

        const lastPayment = await db.get(query, [employerId]);

        if (!lastPayment) {
            console.log(`No payment record found for employer ID: ${employerId}`);
            return null;
        }

        console.log(`Last payment for employer ID ${employerId} fetched successfully.`);
        return lastPayment;
    } catch (error) {
        console.error(`Impossible to fetch the last employer payment:`, error.message);
        return null;
    }
}
//Get all the payments history made by an Employer
export async function getEmployerPaymentHistory(employerId: number) {
    try {
        const db = await getDB();
        const query = `
            SELECT 
                e.company_name AS Employer_Name,
                s.status_name AS Status_Name,
                ep.subscription_type, 
                ep.payment_date, 
                ep.amount, 
                ep.currency, 
                ep.subscription_start, 
                ep.subscription_end, 
                ep.payment_method, 
                ep.receipt_url
            FROM EmployerPayment ep
            JOIN Employer e ON ep.employer_id = e.id
            JOIN Status s ON ep.status_id = s.id
            WHERE ep.employer_id = ?
            ORDER BY ep.payment_date DESC;
        `;

        const empPaymentHistory = await db.get(query, [employerId]);

        if (!empPaymentHistory) {
            console.log(`No payments records found for employer ID: ${employerId}`);
            return null;
        }

        console.log(`Employer payment history for employer ID ${employerId} fetched successfully.`);
        return empPaymentHistory;
    } catch (error) {
        console.error(`Impossible to fetch the employer payment history:`, error.message);
        return null;
    }
}
export async function editEmployerPaymentByID(id: number,
    updates: Partial<{
        subscription_type: string;
        employer_id: number;
        payment_date: Date;
        amount: number;
        payment_method: string;
        currency: string;
        subscription_start: Date;
        subscription_end: Date;
        receipt_url: string;
        status_id: number;
    }>
) {
    // Function to format date to YYYY-MM-DD
    const formatDate = (date?: Date) => {
        return date ? date.toISOString().split('T')[0] : undefined;
    };

    try {
        const db = await getDB();

        // Check if the record exists
        const paymentExists = await db.get(`SELECT 1 FROM EmployerPayment WHERE id = ?`, [id]);
        if (!paymentExists) {
            throw new Error(`Employer Payment with ID ${id} does not exist.`);
        }

        if (Object.keys(updates).length === 0) {
            throw new Error(`No fields provided for update.`);
        }

        // Format the date fields before adding to the values array
        const formattedPaymentDate = updates.payment_date ? formatDate(updates.payment_date) : undefined;
        const formattedSubscriptionStart = updates.subscription_start ? formatDate(updates.subscription_start) : undefined;
        const formattedSubscriptionEnd = updates.subscription_end ? formatDate(updates.subscription_end) : undefined;

        // Filter out undefined fields from the updates object
        const filteredUpdates = {
            ...updates,
            payment_date: formattedPaymentDate,
            subscription_start: formattedSubscriptionStart,
            subscription_end: formattedSubscriptionEnd
        };

        // Prepare the fields and values arrays, excluding undefined values
        const fields = Object.keys(filteredUpdates)
            .filter(key => filteredUpdates[key] !== undefined) // Exclude undefined values
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(filteredUpdates)
            .filter(value => value !== undefined); // Exclude undefined values
        values.push(id); // Add the id at the end for the WHERE clause

        const query = `UPDATE EmployerPayment SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`Employer Payment with ID ${id} updated successfully.`);
    } catch (error) {
        console.error(`Impossible to update Employer Payment with ID ${id}:`, error.message);
    }
}
export async function deleteEmployerPaymentByID(id: number) {
    try {
        const db = await getDB();

        // Check if the record exists
        const paymentExists = await db.get(`SELECT 1 FROM EmployerPayment WHERE id = ?`, [id]);
        if (!paymentExists) {
            console.error(`Employer Payment with ID ${id} not found.`);
            return null;
        }

        // Delete the record
        await db.run(`DELETE FROM EmployerPayment WHERE id = ?`, [id]);
        console.log(`Employer Payment with ID ${id} deleted successfully.`);
        return true;
    } catch (error) {
        console.error(`Impossible to delete Employer Payment:`, error.message);
        return null;
    }
}
//#endregion

//#region Disabilities CRUD
export async function createDisability(disability:any) {
    try{
        const db = await getDB();
        const disabilityExist = await db.get("SELECT 1 FROM Disability Where disability_type = ?", [disability.disability_type]);
        if(disabilityExist){
            console.error("Disability already exist");
            return;
        }
        const query = `INSERT INTO Disability (disability_type, related_disease, description, disability_rate, assistance_device_id)
                        VALUES (?, ?, ?, ?, ?)`
        const values = [
            disability.disability_type,
            disability.related_disease,
            disability.description,
            disability.disability_rate,
            disability.assistance_device_id
        ]
        await db.run(query,values);
        console.log("Employer Payment record created succesfully")
    }catch(error){
        console.error('Impossible to create the disability please try again', error.message);
    }
}

export async function getAllDisabilities() {
    try{
        const db = await getDB();
        const query =`SELECT d.disability_type, d.related_disease, d.description, d.disability_rate, a.device_name
                                    FROM Disability d
                                    LEFT JOIN AssistanceDevice a ON d.assistance_device_id = a.id
                                    ORDER BY d.id
                                    `;
        const disabilities = await db.all(query);
        console.log("Disabilities fetch successfully");
        return disabilities;
    }catch(error){
        console.error('Impossible to fetch the disabilities', error.message);
    }   
}
export async function getDisabilityByID(id:number) {
    try{
        const db = await getDB();
        const query =  `SELECT d.disability_type, d.related_disease, d.description, d.disability_rate, a.device_name
                        FROM Disability d
                        LEFT JOIN AssistanceDevice a ON d.assistance_device_id = a.id
                        WHERE d.id = ?
                        ORDER BY d.id
                        `
        const disability = db.get(query, [id]);
        console.log(`Sucessfully fetch of disability with id ${id}`);
        return disability;
    }catch(error){
        console.error(`Impossible to fetch disability with id: ${id}`,error.message);
    }
}

export async function editDisabilityByID(id:number, updates:Partial<{
    disability_type: string,
    related_disease:string,
    description:string,
    disability_rate:number,
    assistance_device_id:number
}>) {
    try{
        const db = await getDB();
        const disabilityExist = await db.get(`SELECT 1 FROM Disability WHERE id = ?`, [id]);
        if(!disabilityExist){
            throw new Error(`Disability with id ${id} does not exist`);
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE Disability SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`Disability with id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the disability with id ${id}`, (error as Error).message);
    }
}

export async function deleteDisabilityByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const disabilityExist = await db.get(`SELECT 1 FROM Disability WHERE id = ?`, [id]);
        if(!disabilityExist){
            throw new Error(`Disability with id: ${id} does not exist`);
        }
        const query = `DELETE FROM Disability WHERE id = ?`;
        const result  = await db.run(query, [id]);
        if(result.changes === 0){
            throw new Error(`Failed to delete the disability with the id ${id}`);
        }
        console.log(`disability deleted successfully`);
    }catch(error){
        console.error(`Error deleting the disability`, (error as Error).message);
        throw new Error(error.message);
    }
}
//#endregion

//#region Experience CRUD

export async function createExperience(experience:any) {
    try{
        const db =  await getDB();
        const candidateExist = await db.get("SELECT 1 FROM Candidate WHERE id = ?", [experience.candidate_id]);
        if (!candidateExist) {
            console.error("Candidate does not exist. Cannot add experience.");
            return;
        }
        const query = `INSERT INTO Experience (position_name, description, start_date, end_date, company, candidate_id, status_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`
        const values = [
            experience.position_name,
            experience.description,
            experience.start_date,
            experience.end_date,
            experience.company,
            experience.candidate_id,
            experience.status_id
        ]
        await db.run(query, values)
        console.log(`Successfully created the experience`)
    }catch(error){
        console.error(`Cant create this experience please try again`, error.message);
    }
}
export async function getExperienceByID(id:number) {
    try{
        const db = await getDB();
        const query = `
                        SELECT e.position_name, e.description, e.start_date, e.end_date, e.company, s.status_name
                        FROM Experience e
                        LEFT JOIN Candidate c ON c.id = e.candidate_id
                        LEFT JOIN Status s ON s.id = e.status_id
                        WHERE e.id = ?`
        const experience = await db.get(query, [id]);
        if (!experience) {
            console.log(`No experience found with ID: ${id}`);
            return null;
        }
        console.log(`Successfully fetched the experience for id: ${id}`);
        return experience;
    }catch(error){
        console.error(`Impossible to fetch the data from experience with id ${id}`);
    }
}

export async function editExperienceByID(id:number, updates: Partial<{
    position_name:string,
    description:string,
    start_date:Date,
    end_date: Date,
    company: string,
    candidate_id: number,
    status_id: number
}>) {
    const formatDate = (date?: Date) => {
        return date ? date.toISOString().split('T')[0] : undefined;
    };

    try {
        const db = await getDB();

        // Check if the record exists
        const experience = await db.get(`SELECT 1 FROM Experience WHERE id = ?`, [id]);
        if (!experience) {
            throw new Error(`Experience with ID ${id} does not exist.`);
        }

        if (Object.keys(updates).length === 0) {
            throw new Error(`No fields provided for update.`);
        }

        // Format the date fields before adding to the values array
        const formattedStartDate = updates.start_date ? formatDate(updates.start_date) : undefined;
        const formattedEndDate = updates.end_date ? formatDate(updates.end_date) : undefined;

        // Filter out undefined fields from the updates object
        const filteredUpdates = {
            ...updates,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        };

        // Prepare the fields and values arrays, excluding undefined values
        const fields = Object.keys(filteredUpdates)
            .filter(key => filteredUpdates[key] !== undefined) // Exclude undefined values
            .map(key => `${key} = ?`)
            .join(", ");
        const values = Object.values(filteredUpdates)
            .filter(value => value !== undefined); // Exclude undefined values
        values.push(id); // Add the id at the end for the WHERE clause

        const query = `UPDATE Experience SET ${fields} WHERE id = ?`;
        await db.run(query, values);
        console.log(`Experience with ID ${id} updated successfully.`);
    } catch (error) {
        console.error(`Impossible to update Experience with ID ${id}:`, error.message);
    }
    
}

export async function deleteExperienceByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const experienceExist = await db.get(`SELECT 1 FROM Experience WHERE id = ?`, [id]);
        if(!experienceExist){
            throw new Error(`Experience with id: ${id} does not exist`);
        }
        const query = `DELETE FROM Experience WHERE id = ?`;
        const result  = await db.run(query, [id]);
        if(result.changes === 0){
            throw new Error(`Failed to delete the experience with the id ${id}`);
        }
        console.log(`experience deleted successfully`);
    }catch(error){
        console.error(`Error deleting the experience`, (error as Error).message);
        throw new Error(error.message);
    }
}
//#endregion 

//#region for JobOffer CRUD
export async function createJobOffer(jobOffer:any) {
    try{
        const db = await getDB();
        const employerExist = await db.get("SELECT 1 FROM Employer WHERE id = ?", [jobOffer.employer_id]);
        if (!employerExist) {
            console.error("Employer does not exist. Cannot create job offer.");
            return;
        }

        const locationExist = await db.get("SELECT 1 FROM Location WHERE id = ?", [jobOffer.location_id]);
        if (!locationExist) {
            console.error("Location does not exist. Cannot create job offer.");
            return;
        }

        const industryExist = await db.get("SELECT 1 FROM Industry WHERE id = ?", [jobOffer.industry_id]);
        if (!industryExist) {
            console.error("Industry does not exist. Cannot create job offer.");
            return;
        }

        const statusExist = await db.get("SELECT 1 FROM Status WHERE id = ?", [jobOffer.status_id]);
        if (!statusExist) {
            console.error("Status does not exist. Cannot create job offer.");
            return;
        }
        const query = `INSERT INTO JobOffer (title, job_type, job_duration, description, requirements, experience_required, experience_level, salary, accommodation_details, 
                        status_id, location_id, industry_id, employer_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
        const values = [
            jobOffer.title,
            jobOffer.job_type,
            jobOffer.job_duration,
            jobOffer.description,
            jobOffer.requirements,
            jobOffer.experience_required,
            jobOffer.experience_level,
            jobOffer.salary,
            jobOffer.accommodation_details,
            jobOffer.status_id,
            jobOffer.location_id,
            jobOffer.industry_id,
            jobOffer.employer_id
        ];
        await db.run(query, values);
        console.log("Job Offer created sucessfully");
    }catch(error){
        console.error("Imposible to create this job offer", error.message);
    }
}

export async function getJobOfferByIndustry(industry_id:number) {
    try{
        const db = await getDB();
        const industryExist = await db.get(`SELECT * FROM Industry WHERE id = ?`, [industry_id]);
        if(!industryExist){
            console.error(`This industry with id ${industry_id} does not exist`);
            return
        }
        const jobOffers =await db.all( `SELECT jo.title, jo.job_type, jo.job_duration, jo.description, jo.requirements,e.company_name, jo.experience_required, jo.experience_level, jo.salary, jo.created_at, i.industry_name, s.status_name, l.city, l.country, l.remote_type
                        FROM JobOffer jo
                        LEFT JOIN  Industry i ON jo.industry_id = i.id
                        LEFT JOIN Status s ON jo.status_id = s.id
                        LEFT JOIN Location l ON jo.l ocation_id = l.id
                        LEFT JOIN Employer e ON jo.employer_id = e.id
                        WHERE jo.industry_id = ?`, [industry_id]);
        if (jobOffers.length === 0) {
            console.log(`No job offers found for industry ID ${industry_id}.`);
            return null;
        }
        console.log(`Successfully fetched the job offers for the industry: ${industry_id}`);
        return jobOffers
    }catch(error){
        console.error('Error trying to fetch the job offers by that industry please try again', error.message);
    }   
}

export async function getJobOffersByEmployer(employer_id:number) {
    try{
        const db = await getDB();
        const companyExist = await db.get(`SELECT * FROM Employer WHERE id = ?`, [employer_id]);
        if(!companyExist){
            console.error(`This employer with id ${employer_id} does not exist`);
            return
        }
        const jobOffers = await db.all( `SELECT jo.title, jo.job_type, jo.job_duration, jo.description, jo.requirements,e.company_name, jo.experience_required, jo.experience_level, jo.salary, jo.created_at, i.industry_name, s.status_name, l.city, l.country, l.remote_type
                        FROM JobOffer jo
                        LEFT JOIN  Industry i ON jo.industry_id = i.id
                        LEFT JOIN Status s ON jo.status_id = s.id
                        LEFT JOIN Location l ON jo.location_id = l.id
                        LEFT JOIN Employer e ON jo.employer_id = e.id
                        WHERE jo.employer_id = ?`, [employer_id]);
        if(jobOffers.length === 0){
            console.log(`There are not job offer for this company`);;
            return null
        }
        console.log(`Successfully fetched the job offers for the employer ${employer_id}`);
        return jobOffers;
    }catch(error){
        console.error(`Error fetching the job offers for that employer`, error.message);
    }
}



export async function getJobOfferByID(id:number) {
    try{
        const db = await getDB();
        const jobOfferExist = await db.get(`SELECT * FROM JobOffer WHERE id = ?`, [id]);
        if(!jobOfferExist){
            console.error(`This job offer is no longer avaliable`);
            return;
        }
        const jobOffer = await db.get(`SELECT jo.title, jo.job_type, jo.job_duration, jo.description, jo.requirements,e.company_name, jo.experience_required, jo.experience_level, jo.salary, jo.created_at, i.industry_name, s.status_name, l.city, l.country, l.remote_type
                                    FROM JobOffer jo
                                    LEFT JOIN  Industry i ON jo.industry_id = i.id
                                    LEFT JOIN Status s ON jo.status_id = s.id
                                    LEFT JOIN Location l ON jo.location_id = l.id
                                    LEFT JOIN Employer e ON jo.employer_id = e.id
                                    WHERE jo.id = ?`, [id]);
        console.log(`Successfully fetched the job offer`);
        return jobOffer;
    }catch(error){
        console.error(`Error fetching the job offer with id ${id}`, error.message);
    }
}

export async function editJobOfferByID(id:number, updates: Partial<{
    title:string,
    job_type: string,
    job_duration:string, 
    requirements: string,
    experience_required:number,
    experience_level:string,
    salary: number,
    accommodation_details: string,
    status_id: number,
    location_id: number,
    industry_id:number,
    employer_id: number
}>) {
    try{
        const db = await getDB();
        const jobOfferExist =  await db.get(`SELECT * FROM Employer WHERE id = ?`, [id]);
        if(!jobOfferExist){
            console.error(`This job offer with id ${id} does not exist`);
            return;
        }
        if(Object.keys(updates).length === 0){
            throw new Error(`No fields provided for update.`);
        }
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values =[...Object.values(updates), id];
        
        const query = `UPDATE JobOffer SET ${fields} WHERE id = ?`;

        await db.run(query, values);
        console.log(`Job offer with id: ${id} updated successfully`);
    }catch(error){
        console.error(`Impossible to update the job offer with id ${id}`, (error as Error).message);
    }
}

export async function deleteJobOfferByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        const userExist = await db.get(`SELECT 1 FROM JobOffer WHERE id = ?`, id);
        if(!userExist){
            throw new Error(`Job Offer with id: ${id} does not exist`);
        }
        const query = `DELETE FROM Job Offer WHERE id = ?`;
        const result  = await db.run(query, id);
        if(result.changes === 0){
            throw new Error(`Failed to delete the User with the id ${id}`);
        }
        console.log(`Job offer deleted successfully`);
}catch(error){
    console.error(`error deleting the Job Offer`, (error as Error).message);
    throw new Error(error.message);
}
}
//#endregion

//#region JobApplications CRUD
export async function  createJobApplication(application: any){
    try{
        const db = await getDB();
        //To applicate for a job we need to make sure the job exist
        const jobExist = await db.get("SELECT 1 FROM JobOffer WHERE id = ?",[application.job_id]);
        if(!jobExist){
            console.error("Job does not exist, application failed");
            return;
        }
        // Ensure applied_at has a valid timestamp (default to current time if not provided)
        const appliedAt = application.applied_at || new Date().toISOString();
        const query = `INSERT INTO JobApplication (applied_at, cover_letter_url, resume_url, feedback, employer_id, candidate_id, job_id, status_id, location_id)
        VALUES (?,?,?,?,?,?,?,?,?)`
      
        const values = [
            appliedAt,
            application.cover_letter_url,
            application.resume_url,
            application.feedback,
            application.employer_id,
            application.candidate_id,
            application.job_id,
            application.status_id,
            application.location_id
        ]
        await db.run(query,values)
        console.log(`Succesfully applied for the job`)
    }catch(error){
        console.error(`Cant apply for this job, try again`)
    }
}
//Get all the existing appllications
export async function getAllApplications() {
    try {
        const db = await getDB();
        const query = `
            SELECT  ja.id,
        		ja.applied_at,
        		ja.cover_letter_url,
        		ja.resume_url,
        		ja.feedback,
                j.title AS job_title, 
                e.company_name AS employer_name, 
                u.name AS candidate_name, 
                l.city AS location_city, 
        		l.country,
        		l.remote_type,
                s.status_name 
            FROM JobApplication ja
            LEFT JOIN JobOffer j ON ja.job_id = j.id
            LEFT JOIN Employer e ON ja.employer_id = e.id
            LEFT JOIN Candidate c ON ja.candidate_id = c.id
            LEFT JOIN User u on c.user_id = u.id
            LEFT JOIN Location l ON ja.location_id = l.id
            LEFT JOIN Status s ON ja.status_id = s.id
        `;
        const applications = await db.all(query);
        if (!applications) {
            console.log(`No experience found`);
            return null;
        }
        return applications;
    } catch (error) {
        console.error("Error fetching job applications:", error.message);
        return [];
    }
}
//Get all the applications done by a single candidate
export async function getApplicationsByCandidateID(candidate_id: number) {
    try {
        const db = await getDB();
        const query = `
            SELECT  ja.id,
        		ja.applied_at,
        		ja.cover_letter_url,
        		ja.resume_url,
        		ja.feedback,
                j.title AS job_title, 
                e.company_name AS employer_name, 
                l.city AS location_city, 
                s.status_name 
            FROM JobApplication ja
            JOIN JobOffer j ON ja.job_id = j.id
            JOIN Employer e ON ja.employer_id = e.id
            JOIN Location l ON ja.location_id = l.id
            JOIN Status s ON ja.status_id = s.id
            WHERE ja.candidate_id = ?
        `;
        const applications = await db.all(query, [candidate_id]);
        if (!applications) {
            console.log(`No applications found with ID: ${candidate_id}`);
            return null;
        }
        return applications;
    } catch (error) {
        console.error(`Error fetching applications for candidate ${candidate_id}:`, error.message);
        return [];
    }
}
//Get all the candidates that have applied for a specific company
export async function getApplicationsByCompany(employer_id: number) {
    try {
        const db = await getDB();
        const query = `
            SELECT ja.id,
        		ja.applied_at,
        		ja.cover_letter_url,
        		ja.resume_url,
        		ja.feedback,
                j.title AS job_title, 
                u.name AS candidate_name, 
                l.city AS location_city, 
                s.status_name 
            FROM JobApplication ja
            JOIN JobOffer j ON ja.job_id = j.id
            JOIN Candidate c ON ja.candidate_id = c.id
            JOIN User u on c.user_id = u.id
            JOIN Location l ON ja.location_id = l.id
            JOIN Status s ON ja.status_id = s.id
            WHERE ja.employer_id = ?
        `;
        const applications = await db.all(query, [employer_id]);
        if (!applications) {
            console.log(`No applications found with ID: ${employer_id}`);
            return null;
        }
        return applications;
    } catch (error) {
        console.error(`Error fetching applications for company ${employer_id}:`, error.message);
        return [];
    }
}
//Get all the applications for a specific job
export async function getApplicationsByJobID(job_id: number) {
    try {
        const db = await getDB();
        const query = `
            SELECT ja.id,
        		ja.applied_at,
        		ja.cover_letter_url,
        		ja.resume_url,
        		ja.feedback,
                e.company_name AS employer_name, 
                u.name AS candidate_name, 
                l.city AS location_city, 
                s.status_name 
            FROM JobApplication ja
            JOIN Employer e ON ja.employer_id = e.id
            JOIN Candidate c ON ja.candidate_id = c.id
            JOIN User u on c.user_id = u.id
            JOIN Location l ON ja.location_id = l.id
            JOIN Status s ON ja.status_id = s.id
            WHERE ja.job_id = ?
        `;
        const applications = await db.all(query, [job_id]);
        if (!applications) {
            console.log(`No applications found with ID: ${job_id}`);
            return null;
        }
        return applications;
    } catch (error) {
        console.error(`Error fetching applications for job ${job_id}:`, error.message);
        return [];
    }
}
//Delete/Withdrawn application
export async function deleteApplicationByID(id:number): Promise<void> {
    try{
        const db = await getDB();
        //Check if the aplication exist
        const applicationExist = await db.get(`SELECT 1 FROM JobApplication WHERE id = ?`, [id]);
        if(!applicationExist){
            throw new Error(`aPPLICATION with id: ${id} does not exist`);
        }
        //IF the application exist, deleter the record
        const query = `DELETE FROM JobApplication WHERE id = ?`;
        const result  = await db.run(query, [id]);
        if(result.changes === 0){
            throw new Error(`Failed to delete the application with the id ${id}`);
        }
        console.log(`application deleted successfully`);
    }catch(error){
        console.error(`Error deleting the application`, (error as Error).message);
        throw new Error(error.message);
    }
}
//#endregion

//#region CRUD JobBookmarks
export async function createJobBookmark(jobBookmark:any){
    try{
        const db = await getDB();
    //To save a job the job must exist
    const jobExist = await db.get("SELECT 1 FROM JobOffer WHERE id = ?",[jobBookmark.job_id]);
    if(!jobExist){
        console.error("Job does not exist, job bookmark failed");
        return;
    }
    // Ensure acreated_at has a valid timestamp (default to current time if not provided)
    const created_at = jobBookmark.created_at || new Date().toISOString();
    const query = `INSERT INTO JobBookmark (candidate_id, job_id, created_at) VALUES (?,?,?)`
    const values = [
        jobBookmark.candidate_id,
        jobBookmark.job_id,
        created_at
    ]
    //Run the query and pass the values
    await db.run(query,values);
    console.log("Succesfully saved the job");
    }catch(error){
        console.error("Cant apply for this job");
    }
}
//get all the Job Bookmarks by a candidate ID
//Ordered from the most recent to the oldest
export async function getAllJobBookmarksByCandidateID(id: number){
    try{
        const db = await getDB();
        //Mostly a resume, wont display all the information in the bookmark site, just a resume
        //The timestamp is parsed to a Date so it's easier top read for the user
        const query = `SELECT u.name,
                        	jo.title,
                        	jo.job_type,
                        	jo.experience_level,
                        	jo.salary,
                        	l.country,
                        	DATE(jb.created_at) AS bookmark_date
                        FROM JobBookmark jb
                        JOIN Candidate c on jb.candidate_id = c.id
                        JOIN User u on c.user_id = u.id
                        JOIN JobOffer jo on jb.job_id = jo.id  
                        JOIN Location l on jo.location_id = l.id
                        WHERE c.id = ?
                        ORDER BY jb.created_at`;
        const bookmark = await db.all(query, [id]);
        if (!bookmark) {
            console.log(`No bookmarks found for candidate with ID: ${id}`);
            return null;
        }
        return bookmark;
    } catch (error) {
        console.error(`Error fetching bookmarks for candidate ${id}:`, error.message);
        return [];
    }
}
//Delete a Bookmark
//When the user is no longer interested in the job, already applied, etc
export async function deleteJobBookmarkByID(id: number): Promise<void> {
    try {
        const db = await getDB();
        
        // Check if the bookmark exists
        const bookmarkExist = await db.get(`SELECT 1 FROM JobBookmark WHERE id = ?`, [id]);
        if (!bookmarkExist) {
            throw new Error(`Bookmark with id ${id} does not exist`);
        }

        // If the bookmark exists, delete the record
        const query = `DELETE FROM JobBookmark WHERE id = ?`;
        const result = await db.run(query, [id]);

        if (!result || result.changes === 0) {
            throw new Error(`Failed to delete the bookmark with id ${id}`);
        }

        console.log(`Bookmark with id ${id} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting the bookmark:`, (error as Error).message);
        throw new Error(error.message);
    }
}
//#endregion

//#region CRUD EmployerIndustry
//Add an Industry to an employer, we can add as many Industries as we need for each Employer
export async function createEmployerIndustry(employerIndustry: any){
    try{
        const db = await getDB();
        //To save, the employer and the industry must exist
        const indExist =  await db.get("SELECT 1 FROM Industry WHERE id = ?",[employerIndustry.industry_id]);
        const empExist = await db.get("SELECT 1 FROM Employer WHERE id = ?",[employerIndustry.employer_id]);
        if(!indExist){
            console.error("Industry does not exist, operation failed");
            return;
        }
        if(!empExist){
            console.error("Employer does not exist, operation failed");
            return;
        }
        const query =`INSERT INTO EmployerIndustry (industry_id, employer_id) VALUES (?,?)`;
        //Passing the values
        const values = [
            employerIndustry.industry_id,
            employerIndustry.employer_id
        ]
        //Run the query and pass the values
        await db.run(query,values);
        console.log("Succesfully saved the Employer Industry");
    }catch(error){
        console.error("Cant relate the Industry to the employer", error);
    }
}
// The importan ones, READ operations
// Display all the Industries that are part of an Employer
export async function getEmployerIndustryByEmpID(id: number){
    try{
        const db = await getDB();
        const empExists = await db.get("SELECT 1 FROM Employer WHERE id = ?", [id]);
        if (!empExists) {
            console.error(`Emplopyer with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }

        const query =`SELECT 
                        e.company_name,
                         COALESCE(GROUP_CONCAT(i.industry_name, ', '), 'No industries assigned') AS industries
                    FROM Employer e
                    LEFT JOIN EmployerIndustry ei ON ei.employer_id = e.id
                    LEFT JOIN Industry i ON ei.industry_id = i.id
                    WHERE e.id = ?`;
        const empInd = await db.get(query, [id]);
        if(!empInd){
            console.log(`Employer with id ${id} was not found`);
            return null;
        }
        return empInd;
    }catch(error){
        console.error(`Error fetching the EmployerIndustries ${id}:`,error.message);
        return[];
    }
}
export async function getEmployerIndustryByIndID(id: number){
    try{
        const db = await getDB();
        const industryExists = await db.get("SELECT 1 FROM Industry WHERE id = ?", [id]);
        if (!industryExists) {
            console.error(`Industry with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }

        const query =`SELECT 
                        i.industry_name,
                    	COALESCE(GROUP_CONCAT(e.company_name, ', '), 'No employers assigned') AS employers
                    FROM Industry i 
                    LEFT JOIN EmployerIndustry ei ON ei.industry_id = i.id
                    LEFT JOIN Employer e ON ei.employer_id = e.id
                    WHERE i.id = ?`;
        const empInd = await db.get(query, [id]);
        if(!empInd){
            console.log(`Industry with id ${id} was not found`);
            return null;
        }
        return empInd;
    }catch(error){
        console.error(`Error fetching the employers for industry with ID ${id}:`,error.message);
        return{};
    }
}
//Edit the record if there was a mistake
export async function editEmployerIndustry(employerIndustry: {
    new_industry_id: number;
    new_employer_id: number;
    old_industry_id: number;
    old_employer_id: number;
}): Promise<any> {
    try {
        const db = await getDB();

        const query = `
            UPDATE EmployerIndustry
            SET industry_id = ?, employer_id = ?
            WHERE industry_id = ? AND employer_id = ?
        `;

        const values = [
            employerIndustry.new_industry_id,
            employerIndustry.new_employer_id,
            employerIndustry.old_industry_id,
            employerIndustry.old_employer_id
        ];

        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to update.");
            return null;
        }

        console.log("Successfully updated the EmployerIndustry record.");
        return result;
    } catch (error) {
        console.error("Error updating the EmployerIndustry record:", error);
        return null;
    }
}
//Delete relatinship between industry and employer
export async function deleteEmployerIndustry(employerIndustry: {
    industry_id: number;
    employer_id: number;
}): Promise<any> {
    try {
        const db = await getDB();
        //Only delete if the industry aned employer ID match with an existing record
        const query = `
            DELETE FROM EmployerIndustry
            WHERE industry_id = ? AND employer_id = ?
        `;

        const values = [
            employerIndustry.industry_id,
            employerIndustry.employer_id
        ];

        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to delete.");
            return null;
        }

        console.log("Successfully deleted the EmployerIndustry record.");
        return result;
    } catch (error) {
        console.error("Error deleting the EmployerIndustry record:", error);
        return null;
    }
}

//#endregion

//#region CandidateLanguage CRUD
//Add a Language to a candidate, we can add as many Languages as we need for each Candidate
export async function createCandidateLanguage(candidateLanguage: any){
    try{
        const db = await getDB();
        //To save, the candidate and the language
        const langExist = await db.get("SELECT 1 FROM Language WHERE id = ?",[candidateLanguage.language_id]);
        const candExist =  await db.get("SELECT 1 FROM Candidate WHERE id = ?",[candidateLanguage.candidate_id]);
        if(!langExist){
            console.error("Language does not exist, operation failed");
            return;
        }
        if(!candExist){
            console.error("Candidate does not exist, operation failed");
            return;
        }
        const query =`INSERT INTO CandidateLanguage (language_id, candidate_id) VALUES (?,?)`;
        //Defininf the values
        const values = [
            candidateLanguage.language_id,
            candidateLanguage.candidate_id
        ]
        //Run the query and pass the values
        await db.run(query,values);
        console.log("Succesfully saved the Candidate Lamguage");
    }catch(error){
        console.error("Cant relate the lamguage to the candidate", error);
    }
}
//Read operations:
// Display all the languages that are related to 1 candidate
export async function getCandidateLanguageByCandID(id: number){
    try{
        const db = await getDB();
        //Check that the Candidate ID exist
        const candExist = await db.get("SELECT 1 FROM Candidate WHERE id = ?", [id]);
        if (!candExist) {
            console.error(`Candidate with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }
        //Note that the Join to the User table is required to get the name for the candidate
        const query =`SELECT 
                         u.name,
                         COALESCE(GROUP_CONCAT(l.language, ', '), 'No languages assigned') AS languages
                    FROM Candidate c
                    LEFT JOIN CandidateLanguage cl ON cl.candidate_id = c.id
                    LEFT JOIN Language l ON cl.language_id = l.id
					LEFT JOIN User u ON c.user_id = u.id
                    WHERE c.id = ?`;
        const candLang = await db.get(query, [id]);
        //Check if the query executes with no errors
        if(!candLang){
            console.log(`Candidate with id ${id} was not found`);
            return null;
        }
        return candLang;
    }catch(error){
        console.error(`Error fetching the CandidatelANGUAGE ${id}:`,error.message);
        return[];
    }
}
//Display de Candidates that are related to 1 Language
export async function getCandidateLanguageByLangID(id: number){
    try{
        const db = await getDB();
        //Check the Language ID exist
        const langExist = await db.get("SELECT 1 FROM Language WHERE id = ?", [id]);
        if (!langExist) {
            console.error(`Language with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }
        //As in the previous function, here the Join to the user table is also needed to get the candidate name
        const query =`SELECT 
                         l.language,
                         COALESCE(GROUP_CONCAT(u.name, ', '), 'No candidates assigned') AS candidates
                    FROM Language l
                    LEFT JOIN CandidateLanguage cl ON cl.language_id = l.id
                    LEFT JOIN Candidate c ON cl.candidate_id = c.id
					LEFT JOIN User u ON c.user_id = u.id
                    WHERE l.id = ?`;
        const candLang = await db.get(query, [id]);
        if(!candLang){
            console.log(`Language with id ${id} was not found`);
            return null;
        }
        return candLang;
    }catch(error){
        console.error(`Error fetching the candidates for language with ID ${id}:`,error.message);
        return{};
    }
}
//Edit CandidateLanguage if there was a mistake
export async function editCandidateLanguage(candidateLanguage: {
    new_language_id: number;
    new_candidate_id: number;
    old_language_id: number;
    old_candidate_id: number;
}): Promise<any> {
    try {
        const db = await getDB();

        const query = `
            UPDATE CandidateLanguage
            SET language_id = ?, candidate_id = ?
            WHERE language_id = ? AND candidate_id = ?
        `;

        const values = [
            candidateLanguage.new_language_id,
            candidateLanguage.new_candidate_id,
            candidateLanguage.old_language_id,
            candidateLanguage.old_candidate_id
        ];
        // Getting the result after running the query and passing the values
        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to update.");
            return null;
        }

        console.log("Successfully updated the CandidateLanguage record.");
        return result;
    } catch (error) {
        console.error("Error updating the CandidateLanguage record:", error);
        return null;
    }
}
//Delete relatinship between industry and employer
export async function deleteCandidateLanguage(candidateLanguage: {
    language_id: number;
    candidate_id: number;
}): Promise<any> {
    try {
        const db = await getDB();
        //Only delete if the language and candidate ID match with an existing record
        const query = `
            DELETE FROM CandidateLanguage
            WHERE language_id = ? AND candidate_id = ?
        `;

        const values = [
            candidateLanguage.language_id,
            candidateLanguage.candidate_id
        ];

        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to delete.");
            return null;
        }

        console.log("Successfully deleted the CandidateLanguage record.");
        return result;
    } catch (error) {
        console.error("Error deleting the CandidateLanguage record:", error);
        return null;
    }
}
//#endregion

//#region CRUD for JobOfferDisability
export async function createJobOfferDisability(jobOfferDisability: any){
    try{
        const db = await getDB();
        //To save, the job offer and the disability type must exist
        const offerExist = await db.get("SELECT 1 FROM JobOffer WHERE id = ?",[jobOfferDisability.job_offer_id]);
        const disExist =  await db.get("SELECT 1 FROM Disability WHERE id = ?",[jobOfferDisability.disability_id]);
        if(!offerExist){
            console.error("Offer does not exist, operation failed");
            return;
        }
        if(!disExist){
            console.error("Disability type does not exist, operation failed");
            return;
        }
        const query =`INSERT INTO JobOfferDisability (job_offer_id, disability_id) VALUES (?,?)`;
        //Definine the values
        const values = [
            jobOfferDisability.job_offer_id,
            jobOfferDisability.disability_id
        ]
        //Run the query and pass the values
        await db.run(query,values);
        console.log("Succesfully saved the Job Offer Disability");
    }catch(error){
        console.error("Cant relate the disability to the offer", error);
    }
}
//Read operations:
// Display all the disabilities that are related to 1 offer
export async function getJobOfferDisabilityByOfferID(id: number){
    try{
        const db = await getDB();
        //Check that the Offer ID exist
        const offerExist = await db.get("SELECT 1 FROM JobOffer WHERE id = ?", [id]);
        if (!offerExist) {
            console.error(`Offer with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }
        //Note that the Join to the AssitanceDevice table is required to get the name for the asistance device
        const query =`SELECT 
                         jo.title,
						 jo.job_type,
						 jo.job_duration,
                         COALESCE(GROUP_CONCAT(d.disability_type, ', '), 'No disabilities assigned') AS disabilities,
						 COALESCE(GROUP_CONCAT(ad.device_name, ', '), 'No asistance device assigned') AS asistanceDevices
                    FROM JobOffer jo
                    LEFT JOIN JobOfferDisability jod ON jod.job_offer_id = jo.id
                    LEFT JOIN Disability d ON jod.disability_id = d.id
					LEFT JOIN AssistanceDevice ad ON d.assistance_device_id = ad.id
                    WHERE jo.id = ?`;
        const offDisa = await db.get(query, [id]);
        //Check if the query executes with no errors
        if(!offDisa){
            console.log(`Offer with id ${id} was not found`);
            return null;
        }
        return offDisa;
    }catch(error){
        console.error(`Error fetching the JobOfferDisability ${id}:`,error.message);
        return[];
    }
}
//Display de offers that are related to 1 disability
export async function getJobOfferDisabilityByDisabilityID(id: number){
    try{
        const db = await getDB();
        //Check the Disability ID exist
        const disabilityExist = await db.get("SELECT 1 FROM Disability WHERE id = ?", [id]);
        if (!disabilityExist) {
            console.error(`Disability with ID ${id} does not exist.`);
            return null; // Return null or throw an error
        }
        //As in the previous function, here the Join to the user table is also needed to get the asisatance device
        const query =`SELECT 
                         d.disability_type,
						 ad.device_name,
                         COALESCE(GROUP_CONCAT(jo.title, ', '), 'No offers assigned') AS offers
                    FROM Disability d 
					LEFT JOIN AssistanceDevice ad ON d.assistance_device_id = ad.id
                    LEFT JOIN JobOfferDisability jod ON jod.disability_id = d.id
                    LEFT JOIN JobOffer jo ON jod.job_offer_id = jo.id
                    WHERE d.id = ?`;
        const candLang = await db.get(query, [id]);
        if(!candLang){
            console.log(`Disability with id ${id} was not found`);
            return null;
        }
        return candLang;
    }catch(error){
        console.error(`Error fetching the offers for disability with ID ${id}:`,error.message);
        return{};
    }
}
//Edit JobOfferDisability if there was a mistake
export async function editJobOfferDisability(jobOfferDisability: {
    new_job_offer_id: number;
    new_disability_id: number;
    old_job_offer_id: number;
    old_disability_id: number;
}): Promise<any> {
    try {
        const db = await getDB();
        //To save, the job offer and the disability type must exist
        const offerExist = await db.get("SELECT 1 FROM JobOffer WHERE id = ?",[jobOfferDisability.new_job_offer_id]);
        const disExist =  await db.get("SELECT 1 FROM Disability WHERE id = ?",[jobOfferDisability.new_disability_id]);
        if(!offerExist){
            console.error("Offer does not exist, operation failed");
            return;
        }
        if(!disExist){
            console.error("Disability type does not exist, operation failed");
            return;
        }
        const query = `
            UPDATE JobOfferDisability
            SET job_offer_id = ?, disability_id  = ?
            WHERE job_offer_id = ? AND disability_id = ?
        `;

        const values = [
            jobOfferDisability.new_job_offer_id,
            jobOfferDisability.new_disability_id,
            jobOfferDisability.old_job_offer_id,
            jobOfferDisability.old_disability_id
        ];
        // Getting the result after running the query and passing the values
        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to update.");
            return null;
        }

        console.log("Successfully updated the jobOfferDisability record.");
        return result;
    } catch (error) {
        console.error("Error updating the jobOfferDisability record:", error);
        return null;
    }
}
//Delete relatinship between industry and employer
export async function deleteJobOfferDisability(jobOfferDisability: {
    job_offer_id: number;
    disability_id: number;
}): Promise<any> {
    try {
        const db = await getDB();
        //Only delete if the language and candidate ID match with an existing record
        const query = `
            DELETE FROM JobOfferDisability
            WHERE job_offer_id = ? AND disability_id = ?
        `;

        const values = [
            jobOfferDisability.job_offer_id,
            jobOfferDisability.disability_id
        ];

        const result = await db.run(query, values);

        if (result.changes === 0) {
            console.log("No matching record found to delete.");
            return null;
        }

        console.log("Successfully deleted the jobOfferDisability record.");
        return result;
    } catch (error) {
        console.error("Error deleting the jobOfferDisability record:", error);
        return null;
    }
}

//#endregion




