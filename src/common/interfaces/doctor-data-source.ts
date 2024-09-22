import { Doctor } from "../../core/entities/doctor";

export interface DoctorRepository {
  save(doctor: Doctor): Promise<Doctor>;
  findByEmail(email: string): Promise<Doctor | null>;
  findAll(): Promise<Doctor[]>;
  findByID(id: string): Promise<Doctor>;
}
