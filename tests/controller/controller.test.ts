import { Request, Response } from 'express';
import { DoctorUseCase } from '../../src/core/usercases/doctor-use-case';
import { Cognito } from '../../src/external/cognito/new_user';
import { RabbitMQ } from '../../src/external/mq/mq';
import { DoctorController } from '../../src/operation/controllers/doctor-controller';
import { PasswordHasher } from '../../src/operation/controllers/password-hasher-controller';
import { Gateway } from '../../src/operation/gateway/gateway';
import { DoctorRepositoryImp } from '../../src/external/data-sources/mongodb/doctor-respository-mongo';
import { Presenter } from '../../src/operation/presenters/presenter';

// Mock dependencies
jest.mock('../../src/core/usercases/doctor-use-case');
jest.mock('../../src/external/cognito/new_user');
jest.mock('../../src/operation/presenters/presenter');
jest.mock('../../src/operation/gateway/gateway');
jest.mock('../../src/operation/controllers/password-hasher-controller');
jest.mock('../../src/external/mq/mq');
jest.mock('../../src/external/data-sources/mongodb/doctor-respository-mongo');

describe('DoctorController', () => {
  let doctorController: DoctorController;
  let gateway: jest.Mocked<Gateway>;
  let doctorUseCase: jest.Mocked<DoctorUseCase>;
  let cognito: jest.Mocked<Cognito>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let mq: jest.Mocked<RabbitMQ>;
  let repository: jest.Mocked<DoctorRepositoryImp>;

  beforeEach(() => {
    repository = new DoctorRepositoryImp() as jest.Mocked<DoctorRepositoryImp>;
    passwordHasher = new PasswordHasher() as jest.Mocked<PasswordHasher>;
    mq = new RabbitMQ() as jest.Mocked<RabbitMQ>;
    gateway = new Gateway(repository) as jest.Mocked<Gateway>;
    doctorUseCase = new DoctorUseCase(gateway, passwordHasher, mq) as jest.Mocked<DoctorUseCase>;
    cognito = new Cognito() as jest.Mocked<Cognito>;

    doctorController = new DoctorController(doctorUseCase, cognito);

    req = {
      body: {
        id: 'doctor-id',
        name: 'Dr. Smith',
        password: 'password123',
        cpf: '12345678900',
        crm: 'CRM123',
        email: 'drsmith@example.com'
      },
      params: {
        id: 'appointment-id'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('create', () => {
    it('should create a new doctor and return 201 status', async () => {
      cognito.createUser.mockResolvedValue('aws-id');
      cognito.setUserPassword.mockResolvedValue(void 0);
      doctorUseCase.createDoctor.mockResolvedValue(req.body);

      await doctorController.create(req as Request, res as Response);

      expect(cognito.createUser).toHaveBeenCalledWith(req.body.email);
      expect(cognito.setUserPassword).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(doctorUseCase.createDoctor).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(Presenter.toDTO(req.body));
    });

    it('should return 400 if an error occurs', async () => {
      cognito.createUser.mockRejectedValue(new Error('Error'));

      await doctorController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error' });
    });
  });

  describe('schedule', () => {
    it('should create schedule and return 200 status', async () => {
      doctorUseCase.schedule.mockResolvedValue(true);

      await doctorController.schedule(req as Request, res as Response);

      expect(doctorUseCase.schedule).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("Horários criados com sucesso");
    });

    it('should return 400 if schedule is occupied', async () => {
      doctorUseCase.schedule.mockResolvedValue(false);

      await doctorController.schedule(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith("Horario ocupado");
    });

    it('should return 400 if an error occurs', async () => {
      doctorUseCase.schedule.mockRejectedValue(new Error('Error'));

      await doctorController.schedule(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error' });
    });
  });

  describe('editSchedule', () => {
    it('should edit schedule and return 200 status', async () => {
      doctorUseCase.editSchedule.mockResolvedValue(true);

      await doctorController.editSchedule(req as Request, res as Response);

      expect(doctorUseCase.editSchedule).toHaveBeenCalledWith('appointment-id', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("Horários editados com sucesso");
    });

    it('should return 400 if an error occurs', async () => {
      doctorUseCase.editSchedule.mockRejectedValue(new Error('Error'));

      await doctorController.editSchedule(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error' });
    });
  });

  describe('listAppointments', () => {
    it('should return a list of appointments and 200 status', async () => {
      doctorUseCase.listAppointments.mockResolvedValue('001');

      await doctorController.listAppointments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if an error occurs', async () => {
      doctorUseCase.listAppointments.mockRejectedValue(new Error('Error'));

      await doctorController.listAppointments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error' });
    });
  });
});
