import mongoose from "mongoose";
import sqlite3 from "sqlite3"
import {open} from "sqlite"
import path from "path";

const mongoUrl = "mongodb://localhost:27017/job_platform";


mongoose.connect(mongoUrl)
    .then(() => console.log('Connected with MongoDB'))
    .catch((error) => console.error('Issues trying to connect with MongoDB', error));


const dbPromise = open({
    filename: path.join(__dirname, "..", "DB", "SQL", "incluJob.db"),
            driver: sqlite3.Database,
});

export const mongoConnection = mongoose.connection;
export const getDB = () => {
    return dbPromise;
}