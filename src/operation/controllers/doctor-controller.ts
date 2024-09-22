import { Request, Response } from 'express';
import { DoctorUseCase } from '../../core/usercases/doctor-use-case';

export class DoctorController {
  constructor(
    private doctorUseCase: DoctorUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const doctor = await this.doctorUseCase.createDoctor(req.body);
      res.status(201).json(doctor);
    } catch (e) {
      res.status(400).json({ message: (e as Error).message });
    }
  }

  async schedule(req: Request, res: Response) {
    try {
      await this.doctorUseCase.schedule(req.body);
      res.status(200).json("Horários criados com sucesso");
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
