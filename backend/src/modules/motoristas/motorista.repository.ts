import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

export class MotoristaRepository {
  async findAll() {
    return prisma.motorista.findMany({
      include: { veiculos: true },
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.motorista.findUnique({
      where: { id },
      include: { veiculos: true },
    });
  }

  async findByCpf(cpf: string) {
    return prisma.motorista.findUnique({
      where: { cpf },
    });
  }

  async findByCnh(num_cnh: string) {
    return prisma.motorista.findUnique({
      where: { num_cnh },
    });
  }

  async create(data: Prisma.MotoristaCreateInput) {
    return prisma.motorista.create({
      data,
      include: { veiculos: true },
    });
  }

  async update(id: number, data: Prisma.MotoristaUpdateInput) {
    return prisma.motorista.update({
      where: { id },
      data,
      include: { veiculos: true },
    });
  }

  async deactivateAndUnlinkVehicles(id: number) {
    const [, motorista] = await prisma.$transaction([
      prisma.veiculo.updateMany({
        where: { responsavel_id: id },
        data: { responsavel_id: null },
      }),
      prisma.motorista.update({
        where: { id },
        data: { ativo: false },
        include: { veiculos: true },
      }),
    ]);
    return motorista;
  }
}

export const motoristaRepository = new MotoristaRepository();
