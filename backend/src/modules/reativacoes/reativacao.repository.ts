import { StatusSolicitacao, TipoEntidade } from '@prisma/client';
import prisma from '../../config/database';

const solicitanteSelect = {
  id: true,
  login: true,
  nome: true,
  perfil: true,
} as const;

export class ReativacaoRepository {
  async findAll() {
    return prisma.solicitacaoReativacao.findMany({
      include: { solicitante: { select: solicitanteSelect } },
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.solicitacaoReativacao.findUnique({
      where: { id },
      include: { solicitante: { select: solicitanteSelect } },
    });
  }

  async create(data: { tipo_entidade: TipoEntidade; entidade_id: number; motivo: string; solicitante_id: number }) {
    return prisma.solicitacaoReativacao.create({
      data,
      include: { solicitante: { select: solicitanteSelect } },
    });
  }

  async updateStatus(id: number, status: StatusSolicitacao) {
    return prisma.solicitacaoReativacao.update({
      where: { id },
      data: { status },
      include: { solicitante: { select: solicitanteSelect } },
    });
  }

  async resolvePendingForEntity(tipo_entidade: TipoEntidade, entidade_id: number, status: StatusSolicitacao) {
    return prisma.solicitacaoReativacao.updateMany({
      where: {
        tipo_entidade,
        entidade_id,
        status: StatusSolicitacao.PENDENTE,
      },
      data: { status },
    });
  }
}

export const reativacaoRepository = new ReativacaoRepository();
