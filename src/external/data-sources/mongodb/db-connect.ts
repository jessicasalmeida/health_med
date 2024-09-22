import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import { Doctor } from "../../../core/entities/doctor";

export const collections : {
    doctor?: mongoDB.Collection<Doctor>} = {};

export async function connectToDataBase()
{
    dotenv.config();
    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const doctorCollection = db.collection<Doctor>(process.env.DOCTOR_COLLECTION_NAME as string);

    collections.doctor = doctorCollection;

    console.log(`Conexão :` + process.env.DB_CONN_STRING as string);
}