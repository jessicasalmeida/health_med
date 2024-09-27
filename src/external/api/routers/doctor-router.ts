import express, { Router } from "express";
import { DoctorRepositoryImp } from "../../data-sources/mongodb/doctor-respository-mongo";
import { DoctorController } from "../../../operation/controllers/doctor-controller";
import { DoctorUseCase } from "../../../core/usercases/doctor-use-case";
import { PasswordHasher } from "../../../operation/controllers/password-hasher-controller";
import { RabbitMQ } from "../../mq/mq";
import { Cognito } from "../../cognito/new_user";
import { Gateway } from "../../../operation/gateway/gateway";

const mq = new RabbitMQ();
const repository = new DoctorRepositoryImp();
const passwordHasher = new PasswordHasher();
const gateway = new Gateway(repository);
const useCase = new DoctorUseCase(gateway, passwordHasher, mq);
const cognito = new Cognito();
const controller = new DoctorController(useCase, cognito);

export const doctorRouter = Router();

doctorRouter.use(express.json());

doctorRouter.post('/', async (req, res) => {
    /*  #swagger.tags = ['Doctor']
        #swagger.summary = 'Create'
        #swagger.description = 'Endpoint to create a doctor' */
    const order = await controller.create(req, res);
});

doctorRouter.post('/schedule/', async (req, res) => {
    /*  #swagger.tags = ['Doctor']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to register a schedule as a doctor' */
    const order = await controller.schedule(req, res);
});

doctorRouter.post('/editSchedule/:id', async (req, res) => {
    /*  #swagger.tags = ['Doctor']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to edit a schedule as a doctor' */
    const order = await controller.editSchedule(req, res);
});

doctorRouter.get('/appointments/:id', async (req, res) => {
    /*  #swagger.tags = ['Doctor']
    #swagger.summary = 'schedule'
    #swagger.description = 'Endpoint to edit a schedule as a doctor' */
    const order = await controller.listAppointments(req, res);
});