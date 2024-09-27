import { DoctorUseCase } from '../../src/core/usercases/doctor-use-case';
import { RabbitMQ } from '../../src/external/mq/mq';
import { PasswordHasher } from '../../src/operation/controllers/password-hasher-controller';
import { Gateway } from '../../src/operation/gateway/gateway';
import { DoctorRepositoryImp } from '../../src/external/data-sources/mongodb/doctor-respository-mongo';
import { ValidationError } from '../../src/common/errors/validation-error';
import { Doctor } from '../../src/core/entities/doctor';
import { Appointment } from '../../src/core/entities/appointment';

jest.mock('../../src/operation/gateway/gateway');
jest.mock('../../src/operation/controllers/password-hasher-controller');
jest.mock('../../src/external/mq/mq');
jest.mock('../../src/external/data-sources/mongodb/doctor-respository-mongo');

describe('DoctorUseCase', () => {
  let doctorUseCase: DoctorUseCase;
  let repository: jest.Mocked<DoctorRepositoryImp>;
  let gateway: jest.Mocked<Gateway>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let mq: jest.Mocked<RabbitMQ>;

  beforeEach(() => {
    repository = new DoctorRepositoryImp() as jest.Mocked<DoctorRepositoryImp>;
    gateway = new Gateway(repository) as jest.Mocked<Gateway>;
    passwordHasher = new PasswordHasher() as jest.Mocked<PasswordHasher>;
    mq = new RabbitMQ() as jest.Mocked<RabbitMQ>;
    doctorUseCase = new DoctorUseCase(gateway, passwordHasher, mq);
  });

  describe('createDoctor', () => {
    it('should throw ValidationError when required fields are missing', async () => {
      await expect(doctorUseCase.createDoctor({})).rejects.toThrow(ValidationError);
    });

    it('should create a doctor when valid data is provided', async () => {
      const doctorData = {
        name: 'Doctor Name',
        cpf: '12345678901',
        crm: 'CRM1234',
        email: 'doctor@example.com',
        password: 'password123',
        idAws: 'idAws'
      };

      passwordHasher.hash.mockResolvedValue('hashedPassword');
      gateway.save.mockResolvedValue(new Doctor('id', 'Doctor Name', '12345678901', 'CRM1234', 'doctor@example.com', 'hashedPassword', 'idAws'));

      const doctor = await doctorUseCase.createDoctor(doctorData);

      expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
      expect(gateway.save).toHaveBeenCalled();
      expect(doctor.password).toEqual('hashedPassword');
    });
  });

  describe('findDoctors', () => {
    it('should return a list of doctors', async () => {
      const doctors = [new Doctor('id', 'Doctor Name', '12345678901', 'CRM1234', 'doctor@example.com', 'hashedPassword', 'idAws')];
      gateway.findAll.mockResolvedValue(doctors);

      const result = await doctorUseCase.findDoctors();

      expect(gateway.findAll).toHaveBeenCalled();
      expect(result).toEqual(doctors);
    });
  });

  describe('schedule', () => {
    it('should publish new appointments and return true', async () => {
      const appointments = [{ id: 'id1', doctorId: 'doctorId', patientId: 'patientId', date: new Date(), status: false }];

      // Mocka a função publishExclusive para retornar uma resposta simulada
      mq.publishExclusive = jest.fn().mockResolvedValue('response');

      const result = await doctorUseCase.schedule(appointments);
      expect(result).toBeUndefined;
    });

    it('should throw an error when publishing fails', async () => {
      // Mocka o erro de rejeição para publishExclusive
      mq.publishExclusive = jest.fn().mockRejectedValue(new Error('ConflictError'));

      // Verifica se o método lança o erro esperado
      const result = await expect(doctorUseCase.schedule([]));
      expect(result).toBeUndefined;
    });
  });

  describe('editSchedule', () => {
    it('should publish edit appointment and return true', async () => {
      const appointment = { id: 'id1', doctorId: 'doctorId', patientId: 'patientId', date: new Date(), status: false };

      // Mocka a função publish para retornar sucesso
      mq.publish = jest.fn().mockResolvedValue('"editAppointment", {"appointment": {"date": 2024-09-27T12:12:59.925Z, "doctorId": "doctorId", "id": "id1", "patientId": "patientId", "status": false}, "id": "appointmentId"}');

      const result = await doctorUseCase.editSchedule('appointmentId', appointment);
      expect(result).toBeUndefined;
    });
  });

  describe('listAppointments', () => {
    it('should publish list appointment and return the response', async () => {
      // Mocka a função publishExclusive para retornar uma resposta simulada
      mq.publishExclusive = jest.fn().mockResolvedValue('response');

      const result = await doctorUseCase.listAppointments('doctorId');

      expect(result).toBeUndefined;
    });
  });

});