import { promises } from "dns";
import { getDB } from "../DB/Connection"    

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
/*
createUser({
    name: "Juan",
    email: "juan@example.com",
    password: "securepassword",
    phone: 123456789,
    alternative_phone: 987654321,
    country: "Canada",
    role_id: 1
});
 */
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
            console.error(`❌ No user found with id ${id}`);
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