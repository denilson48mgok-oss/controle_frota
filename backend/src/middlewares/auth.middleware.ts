import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Perfil } from '@prisma/client';
import prisma from '../config/database';

export interface AuthUser {
  id: number;
  perfil: Perfil;
  ativo: boolean;
}

interface JwtPayload {
  id: number;
  perfil: Perfil;
  ativo: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido', message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Token inválido', message: 'Token inválido' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded.ativo === false) {
      res.status(403).json({ error: 'Usuário inativo', message: 'Usuário inativo' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(decoded.id) },
      select: { id: true, perfil: true, ativo: true },
    });

    if (!usuario) {
      res.status(401).json({ error: 'Usuário não encontrado', message: 'Usuário não encontrado' });
      return;
    }

    if (!usuario.ativo) {
      res.status(403).json({ error: 'Usuário inativo', message: 'Usuário inativo' });
      return;
    }

    req.user = {
      id: usuario.id,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado', message: 'Token inválido ou expirado' });
  }
}
