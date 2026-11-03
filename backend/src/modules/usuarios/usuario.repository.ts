import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

const publicSelect = {
  id: true,
  login: true,
  nome: true,
  cpf: true,
  ativo: true,
  perfil: true,
} as const;

export class UsuarioRepository {
  async findAll() {
    return prisma.usuario.findMany({
      select: publicSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: publicSelect,
    });
  }

  async findByLogin(login: string) {
    return prisma.usuario.findUnique({
      where: { login },
    });
  }

  async findByCpf(cpf: string) {
    return prisma.usuario.findUnique({
      where: { cpf },
      select: publicSelect,
    });
  }

  async create(data: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({
      data,
      select: publicSelect,
    });
  }

  async update(id: number, data: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({
      where: { id },
      data,
      select: publicSelect,
    });
  }
}

export const usuarioRepository = new UsuarioRepository();
