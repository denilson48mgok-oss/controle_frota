import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/errors';
import { usuarioService } from './usuario.service';
import { createUsuarioSchema, loginSchema, updateUsuarioSchema } from './usuario.schema';

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

export class UsuarioController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await usuarioService.login(data);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await usuarioService.findAll();
      res.status(200).json(usuarios);
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
      const usuario = await usuarioService.findById(id);
      res.status(200).json(usuario);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createUsuarioSchema.parse(req.body);
      const usuario = await usuarioService.create(data, req.user!);
      res.status(201).json(usuario);
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
      const data = updateUsuarioSchema.parse(req.body);
      const usuario = await usuarioService.update(id, data, req.user!);
      res.status(200).json(usuario);
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
      const usuario = await usuarioService.baixa(id);
      res.status(200).json(usuario);
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const usuarioController = new UsuarioController();
