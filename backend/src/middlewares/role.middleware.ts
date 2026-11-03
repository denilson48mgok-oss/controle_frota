import { Request, Response, NextFunction } from 'express';
import { Perfil } from '@prisma/client';

export function roleMiddleware(allowedRoles: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado', message: 'Não autenticado' });
      return;
    }

    if (!req.user.ativo) {
      res.status(403).json({ error: 'Usuário inativo', message: 'Usuário inativo' });
      return;
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      res.status(403).json({ error: 'Acesso negado', message: 'Acesso negado' });
      return;
    }

    next();
  };
}

export const requireMaster = roleMiddleware([Perfil.MASTER]);
export const requireMasterOrAdmin = roleMiddleware([Perfil.MASTER, Perfil.ADMIN]);
