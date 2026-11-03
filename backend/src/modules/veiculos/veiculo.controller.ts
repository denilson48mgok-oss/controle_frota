import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/errors';
import { veiculoService } from './veiculo.service';
import { createVeiculoSchema, updateVeiculoSchema } from './veiculo.schema';

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

export class VeiculoController {
  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const veiculos = await veiculoService.findAll();
      res.status(200).json(veiculos);
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
      const veiculo = await veiculoService.findById(id);
      res.status(200).json(veiculo);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createVeiculoSchema.parse(req.body);
      const veiculo = await veiculoService.create(data);
      res.status(201).json(veiculo);
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
      const data = updateVeiculoSchema.parse(req.body);
      const veiculo = await veiculoService.update(id, data);
      res.status(200).json(veiculo);
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
      const veiculo = await veiculoService.baixa(id);
      res.status(200).json(veiculo);
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const veiculoController = new VeiculoController();
