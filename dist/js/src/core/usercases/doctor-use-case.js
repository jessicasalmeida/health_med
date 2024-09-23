"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorUseCase = void 0;
const validation_error_1 = require("../../common/errors/validation-error");
const mq_1 = require("../../external/mq/mq");
const doctor_1 = require("../entities/doctor");
class DoctorUseCase {
    constructor(doctorRepository, passwordHasher, mq) {
        this.doctorRepository = doctorRepository;
        this.passwordHasher = passwordHasher;
        this.mq = mq;
        this.listeners();
    }
    createDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorData.email || !doctorData.password || !doctorData.crm) {
                throw new validation_error_1.ValidationError('Missing required fields');
            }
            const hashedPassword = yield this.passwordHasher.hash(doctorData.password);
            const doctor = new doctor_1.Doctor(doctorData._id, doctorData.name, doctorData.cpf, doctorData.crm, doctorData.email, hashedPassword);
            return this.doctorRepository.save(doctor);
        });
    }
    findDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doctorRepository.findAll();
        });
    }
    findDoctorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.doctorRepository.findByID(id);
        });
    }
    schedule(appointments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                yield this.mq.publish('newAppointments', { appointments: appointments });
                yield this.mq.close();
                console.log("Publicado newAppointments");
                return true;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
    editSchedule(id, appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                yield this.mq.publish('editAppointment', { id: id, appointment: appointment });
                yield this.mq.close();
                console.log("Publicado editAppointments");
                return true;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
    listAppointments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mq = new mq_1.RabbitMQ();
                yield this.mq.connect();
                console.log("Publicado listAppointments");
                const responsta = yield this.mq.publishExclusive('listAppointment', { id: id });
                yield this.mq.close();
                return responsta;
            }
            catch (ConflictError) {
                throw new Error("Erro ao publicar mensagem");
            }
        });
    }
    listeners() {
        return __awaiter(this, void 0, void 0, function* () {
            this.mq = new mq_1.RabbitMQ();
            yield this.mq.connect();
            yield this.mq.consume('listDoctors', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log("Fila listDoctors ");
                this.mq.publishReply(message.replyTo, yield this.findDoctors(), message.correlationId);
            }));
            yield this.mq.consume('getDoctor', (message) => __awaiter(this, void 0, void 0, function* () {
                const id = message.message.id;
                console.log("Fila getDoctor. ID: " + id);
                this.mq.publishReply(message.replyTo, yield this.findDoctorById(id), message.correlationId);
            }));
        });
    }
}
exports.DoctorUseCase = DoctorUseCase;
