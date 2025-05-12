import {Request, Response} from 'express';
import {createUser, getAllUsers, getUserByID, editUserByID, deleteUserByID} from '../Services/CRUD'

export const createUsersController = async(req: Request, res: Response): Promise<void> =>{
   try{
        const {
            name,
            email,
            password,
            phone,
            alternative_phone,
            country,
            role_id
        } = req.body;

        const values = {
            name,
            email,
            password,
            phone,
            alternative_phone,
            country,
            role_id
        };

        const createdUser = await createUser(values);
        res.status(201).json({message: 'User created successfully', User: createdUser});
   }catch(error){
        console.error('Error creating User:', error);
        res.status(500).json({error: 'Impossible to create the User'});
   }
}

export const getAllUsersController = async(req: Request, res: Response): Promise<void> => {
    try{
        const users = await getAllUsers();
        res.status(200).json({
            message: 'Users fetched successfully',
            users,});
        
    }catch(error){
        console.error('Error fetching users:', (error as Error).message);
        res.status(500).json({error: 'Could not fetch the users'});
    }
}

export const getUserByIDController = async(req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        const user = await getUserByID(id);
        if (!user) {
            res.status(404).json({ error: `User with ID ${id} not found` }); 
            return;
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user,});
    }catch(error){
        console.error('Error fetching user:', (error as Error).message);
        res.status(500).json({error: 'Could not fetch the user'});
    }
}

export const updateUserByIDController = async(req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        const {
            name,
            email,
            password,
            phone,
            alternative_phone,
            country,
            role_id
        } = req.body;

        const updates: Partial < {
            name :string,
            email :string,
            password: string,
            phone: number,
            alternative_phone: number,
            country: string,
            role_id: number
        }> = {
            name,
            email,
            password,
            phone,
            alternative_phone,
            country,
            role_id
        };
        if (Object.values(updates).every(value => value === undefined)) {
             res.status(400).json({ error: 'No fields provided for update' });
             return;
          }
        const editedUser = await editUserByID(Number(id), updates);
        res.status(200).json({
            message: 'User updated successfully',
            editedUser,});

    }catch(error){
        console.error('Error updating the user:', (error as Error).message);
        res.status(500).json({error: 'Could not edit the user'});
    }
}

export const deleteUserByIDController = async(req:Request, res: Response): Promise<void> => {
    try{
        const id =  parseInt(req.params.id, 10);
        if(isNaN(id)){
            res.status(400).json({error: 'Missing or invalid the user ID'});
            return;
        }
        await deleteUserByID(id);
        res.status(200).json({
                message: 'User deleated successfully'});

    }catch(error: any){
        if (error.message && error.message.includes('Does not exist')) {
            res.status(404).json({ error: error.message });
            return;
          }
          console.error('Error deleting user:', error.message);
          res.status(500).json({ error: 'Could not delete the user' });
    }
}