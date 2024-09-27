import { DoctorDTO } from "../../common/dto/doctor.dto";
import { Doctor } from "../../core/entities/doctor";

export class Presenter {
    static toDTO(
        presenter: Doctor
    ): DoctorDTO {
        let dto: DoctorDTO = {
            _id: presenter._id,
            name: presenter.name,
            cpf: presenter.cpf,
            crm: presenter.crm,
            email: presenter.email,
            password: presenter.password,
            idAws: presenter.idAws
        };
        return dto;
    }
}
