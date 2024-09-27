import { DoctorDTO } from '../../common/dto/doctor.dto';
import { ConflictError } from '../../common/errors/conflict-error';
import { NotFoundError } from '../../common/errors/not-found-error';
import { DoctorRepository } from '../../common/interfaces/doctor-data-source';
import { Doctor } from '../../core/entities/doctor';

export class Gateway {
    dataSource: DoctorRepository;
    constructor(dataSource: DoctorRepository) {
        this.dataSource = dataSource;
    }

    async save(entity: Doctor): Promise<Doctor> {

        const doctorDTO: DoctorDTO =
        {
            _id: entity._id,
            name: entity.name,
            cpf: entity.cpf,
            crm: entity.crm,
            email: entity.email,
            password: entity.password,
            idAws: entity.idAws
        };

        const sucesso = await this.dataSource.save(doctorDTO);
        return sucesso;
    }

    async findByEmail(email: string): Promise<Doctor> {
        const data = await this.dataSource.findByEmail(email);
        if (data) {
            const dataEntity = new Doctor(data._id, data.name, data.cpf, data.crm, data.email, data.password, data.idAws)
            return dataEntity;
        }
        throw new ConflictError("Erro ao inserir Doctor");
    }

    async findById(id: string): Promise<Doctor> {
        const data = await this.dataSource.findByID(id);
        if (data) {
            const dataEntity = new Doctor(data._id, data.name, data.cpf, data.crm, data.email, data.password, data.idAws)
            return dataEntity;
        }
        throw new NotFoundError("Erro ao localizar Doctor");
    }

    async findAll(): Promise<Doctor[]> {

        let dataEntity: Array<Doctor> = new Array();
        const data = await this.dataSource.findAll();
        if (data) {
            data.forEach(data => {
                dataEntity.push(new Doctor(data._id, data.name, data.cpf, data.crm, data.email, data.password, data.idAws))
            });
        }
        return dataEntity;
    }
}