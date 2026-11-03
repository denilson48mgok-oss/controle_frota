import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/errors';
import { motoristaService } from './motorista.service';
import { createMotoristaSchema, updateMotoristaSchema } from './motorista.schema';

function handleError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    const msg = error.issues.map((e) => e.message).join(', ');
    res.status(400).json({ error: msg, message: msg, details: error.issues });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message, message: error.message });
    return;
  }

  res.status(500).json({ error: 'Erro interno do servidor', message: 'Erro interno do servidor' });
}

export class MotoristaController {
  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const motoristas = await motoristaService.findAll();
      res.status(200).json(motoristas);
    } catch (error) {
      handleError(res, error);
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const motorista = await motoristaService.findById(id);
      res.status(200).json(motorista);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createMotoristaSchema.parse(req.body);
      const motorista = await motoristaService.create(data);
      res.status(201).json(motorista);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const data = updateMotoristaSchema.parse(req.body);
      const motorista = await motoristaService.update(id, data);
      res.status(200).json(motorista);
    } catch (error) {
      handleError(res, error);
    }
  }

  async baixa(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const motorista = await motoristaService.baixa(id);
      res.status(200).json(motorista);
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const motoristaController = new MotoristaController();
