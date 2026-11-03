import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

export class VeiculoRepository {
  async findAll() {
    return prisma.veiculo.findMany({
      include: { responsavel: true },
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.veiculo.findUnique({
      where: { id },
      include: { responsavel: true },
    });
  }

  async findByPlaca(placa: string) {
    return prisma.veiculo.findUnique({
      where: { placa },
    });
  }

  async findByChassi(chassi: string) {
    return prisma.veiculo.findUnique({
      where: { chassi },
    });
  }

  async findByRenavam(renavam: string) {
    return prisma.veiculo.findUnique({
      where: { renavam },
    });
  }

  async create(data: Prisma.VeiculoUncheckedCreateInput) {
    return prisma.veiculo.create({
      data,
      include: { responsavel: true },
    });
  }

  async update(id: number, data: Prisma.VeiculoUncheckedUpdateInput) {
    return prisma.veiculo.update({
      where: { id },
      data,
      include: { responsavel: true },
    });
  }
}

export const veiculoRepository = new VeiculoRepository();
