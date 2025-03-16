import { getDB } from "../DB/Connection"    

export async function createUser(user:any) {
    try{
        const db = await getDB();
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
createUser({
    name: "Juan",
    email: "juan@example.com",
    password: "securepassword",
    phone: 123456789,
    alternative_phone: 987654321,
    country: "Canada",
    role_id: 1
});


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