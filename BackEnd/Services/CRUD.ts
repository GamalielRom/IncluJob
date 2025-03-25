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



