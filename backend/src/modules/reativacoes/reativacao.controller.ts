import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/errors';
import { reativacaoService } from './reativacao.service';
import { createReativacaoSchema, entidadeParamSchema } from './reativacao.schema';

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

export class ReativacaoController {
  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const solicitacoes = await reativacaoService.findAll();
      res.status(200).json(solicitacoes);
    } catch (error) {
      handleError(res, error);
    }
  }

  async solicitar(req: Request, res: Response): Promise<void> {
    try {
      const data = createReativacaoSchema.parse(req.body);
      const solicitacao = await reativacaoService.solicitar(data, req.user!.id);
      res.status(201).json(solicitacao);
    } catch (error) {
      handleError(res, error);
    }
  }

  async aprovar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const solicitacao = await reativacaoService.aprovar(id);
      res.status(200).json(solicitacao);
    } catch (error) {
      handleError(res, error);
    }
  }

  async rejeitar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const solicitacao = await reativacaoService.rejeitar(id);
      res.status(200).json(solicitacao);
    } catch (error) {
      handleError(res, error);
    }
  }

  async reativarDireto(req: Request, res: Response): Promise<void> {
    try {
      const tipo = entidadeParamSchema.parse(req.params.entidade);
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'ID inválido', message: 'ID inválido' });
        return;
      }
      const entidade = await reativacaoService.reativarDireto(tipo, id);
      res.status(200).json(entidade);
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const reativacaoController = new ReativacaoController();
