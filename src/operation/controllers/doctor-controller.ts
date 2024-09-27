import { Request, Response } from 'express';
import { DoctorUseCase } from '../../core/usercases/doctor-use-case';
import { Cognito } from '../../external/cognito/new_user';
import { Doctor } from '../../core/entities/doctor';
import { Presenter } from '../presenters/presenter';

export class DoctorController {
  constructor(
    private doctorUseCase: DoctorUseCase,
    private cognito: Cognito
  ) { }

  async create(req: Request, res: Response) {
    try {
      const d: Doctor = {
        _id: req.body.id,
        name: req.body.name,
        password: req.body.password,
        cpf: req.body.cpf,
        crm: req.body.crm,
        email: req.body.email,
        idAws: "000"
      }
      const respostaCognito = await this.cognito.createUser(d.email);
      await this.cognito.setUserPassword(d.email, d.password);
      d.idAws = respostaCognito

      const doctor = await this.doctorUseCase.createDoctor(req.body);
      res.status(201).json(Presenter.toDTO(doctor));
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }
  async schedule(req: Request, res: Response) {
    try {
      const resposta = await this.doctorUseCase.schedule(req.body);
      console.log(resposta);
      if (resposta)
        res.status(200).json("Horários criados com sucesso");
      else
        res.status(400).json("Horario ocupado");
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async editSchedule(req: Request, res: Response) {
    try {
      await this.doctorUseCase.editSchedule(req.params.id, req.body);
      res.status(200).json("Horários editados com sucesso");
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async listAppointments(req: Request, res: Response) {
    try {
      const resposta = await this.doctorUseCase.listAppointments(req.params.id);
      res.status(200).json(resposta);
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

}
