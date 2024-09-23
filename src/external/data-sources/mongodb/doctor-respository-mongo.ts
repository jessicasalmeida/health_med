import { collections } from "./db-connect";
import { Doctor } from '../../../core/entities/doctor';
import { DoctorRepository } from "../../../common/interfaces/doctor-data-source";

export class DoctorRepositoryImp implements DoctorRepository {


  async save(doctor: Doctor): Promise<Doctor> {
    const savedDoctor = await collections.doctor?.insertOne(doctor);
    return savedDoctor as unknown as Doctor;
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    {
      const query = { email: (email) };
      const order = await collections.doctor?.findOne(query);
      return order as Doctor;
    }
  }

  async findByID(id: string): Promise<Doctor> {
    {
      const query = { _id: (id) };
      const order = await collections.doctor?.findOne(query);
      return order as Doctor;
    }
  }

  async findAll(): Promise<Doctor[]> {
    {
      return await collections.doctor?.find({}).toArray() as Doctor[];
    }
  }

}
