import { Request, Response } from "express";
import { createStatus, getStatusByID, getAllStatuses } from "../Services/CRUD";

export const createStatusController = async (req:Request, res: Response): Promise<void> => {
    try{
        const {status_name} = req.body;
        const values = {status_name};
        const createdStatus = await createStatus(values);
         res.status(201).json({message: 'Status created successfully', Status: createdStatus});
    }catch(error){
        console.error('Error creating Status:', error);
        res.status(500).json({error: 'Impossible to create the Status'}); 
    }
}

export const getStatusByIDController = async (req:Request, res:Response): Promise<void> =>{
    try{
        const id = Number(req.params.id);
        const status = await getStatusByID(id);
        if (!status) {
            res.status(404).json({ error: `Status with ID ${id} not found` }); 
            return;
        }
        res.status(200).json({
        message: 'Status fetched successfully',
        status,});
    }catch(error){
        console.error('Error fetching Status:', (error as Error).message);
        res.status(500).json({error: 'Could not fetch the Status'});
    }
}

export const getAllStatusesController = async(req:Request, res: Response): Promise<void> => {
    try{
        const statues = await getAllStatuses();
                res.status(200).json({
                    message: 'Stastatuses fetched successfully',
                    statues,});
                 
    }catch(error){
        console.error('Error fetching statues:', (error as Error).message);
        res.status(500).json({error: 'Could not fetch the statuses'});
    }
}