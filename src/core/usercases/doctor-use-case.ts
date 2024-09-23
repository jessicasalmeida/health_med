import { ValidationError } from '../../common/errors/validation-error';
import { DoctorRepository } from '../../common/interfaces/doctor-data-source';
import { RabbitMQ } from '../../external/mq/mq';
import { PasswordHasher } from '../../operation/controllers/password-hasher-controller';
import { Doctor } from '../entities/doctor';
import { Appointment } from '../entities/appointment';

export class DoctorUseCase {
  constructor(
    private doctorRepository: DoctorRepository,
    private passwordHasher: PasswordHasher, private mq: RabbitMQ
  ) { 
    this.listeners();
  }

  async createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    if (!doctorData.email || !doctorData.password || !doctorData.crm) {
      throw new ValidationError('Missing required fields');
    }

    const hashedPassword = await this.passwordHasher.hash(doctorData.password);
    const doctor = new Doctor(
      doctorData._id!,
      doctorData.name!,
      doctorData.cpf!,
      doctorData.crm!,
      doctorData.email!,
      hashedPassword
    );
    return this.doctorRepository.save(doctor);
  }

  async findDoctors(): Promise<Doctor[]> {
    return await this.doctorRepository.findAll();
  }

  async findDoctorById(id: string): Promise<Doctor> {
    return await this.doctorRepository.findByID(id);
  }

  async schedule(appointments: Appointment[]): Promise<boolean> {

    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      await this.mq.publish('newAppointments', { appointments: appointments });
      await this.mq.close();
      console.log("Publicado newAppointments");
      return true;
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }

  async editSchedule(id: string, appointment: Appointment): Promise<boolean> {

    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      await this.mq.publish('editAppointment', { id: id, appointment: appointment});
      await this.mq.close();
      console.log("Publicado editAppointments");
      return true;
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }

  async listAppointments(id: string): Promise<string> {

    try {
      this.mq = new RabbitMQ();
      await this.mq.connect();
      console.log("Publicado listAppointments");
      const responsta = await this.mq.publishExclusive('listAppointment', { id: id});
      await this.mq.close();      
      return responsta;
    }
    catch (ConflictError) {
      throw new Error("Erro ao publicar mensagem");
    }
  }

  async listeners(): Promise<void> {
    this.mq = new RabbitMQ();
    await this.mq.connect();
    await this.mq.consume('listDoctors', async (message: any) => {
      console.log("Fila listDoctors ");
      this.mq.publishReply(message.replyTo, await this.findDoctors(), message.correlationId);
    });
    await this.mq.consume('getDoctor', async (message: any) => {
      await this.mq.connect();
      const id: string = message.message.id;
      console.log("Fila getDoctor. ID: " + id);
      this.mq.publishReply(message.replyTo, await this.findDoctorById(id), message.correlationId);
    });
  }
}
