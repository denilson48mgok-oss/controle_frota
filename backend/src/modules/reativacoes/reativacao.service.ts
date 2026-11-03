import { StatusSolicitacao, TipoEntidade } from '@prisma/client';
import { AppError } from '../../utils/errors';
import { usuarioRepository } from '../usuarios/usuario.repository';
import { motoristaRepository } from '../motoristas/motorista.repository';
import { veiculoRepository } from '../veiculos/veiculo.repository';
import { reativacaoRepository } from './reativacao.repository';
import { CreateReativacaoInput } from './reativacao.schema';

export class ReativacaoService {
  private async buscarEntidade(tipo: TipoEntidade, id: number): Promise<{ id: number; ativo: boolean }> {
    if (tipo === TipoEntidade.USUARIO) {
      const usuario = await usuarioRepository.findById(id);
      if (!usuario) throw new AppError('Usuário não encontrado', 404);
      return usuario;
    }

    if (tipo === TipoEntidade.MOTORISTA) {
      const motorista = await motoristaRepository.findById(id);
      if (!motorista) throw new AppError('Motorista não encontrado', 404);
      return motorista;
    }

    const veiculo = await veiculoRepository.findById(id);
    if (!veiculo) throw new AppError('Veículo não encontrado', 404);
    return veiculo;
  }

  private async ativarEntidade(tipo: TipoEntidade, id: number) {
    if (tipo === TipoEntidade.USUARIO) {
      return usuarioRepository.update(id, { ativo: true });
    }
    if (tipo === TipoEntidade.MOTORISTA) {
      return motoristaRepository.update(id, { ativo: true });
    }
    return veiculoRepository.update(id, { ativo: true });
  }

  async findAll() {
    return reativacaoRepository.findAll();
  }

  async solicitar(data: CreateReativacaoInput, solicitanteId: number) {
    const entidade = await this.buscarEntidade(data.tipo_entidade, data.entidade_id);
    if (entidade.ativo) {
      throw new AppError('O registro informado já está ativo', 400);
    }

    return reativacaoRepository.create({
      tipo_entidade: data.tipo_entidade,
      entidade_id: data.entidade_id,
      motivo: data.motivo,
      solicitante_id: solicitanteId,
    });
  }

  async aprovar(id: number) {
    const solicitacao = await reativacaoRepository.findById(id);
    if (!solicitacao) {
      throw new AppError('Solicitação de reativação não encontrada', 404);
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new AppError('Esta solicitação já foi processada', 400);
    }

    await this.buscarEntidade(solicitacao.tipo_entidade, solicitacao.entidade_id);
    await this.ativarEntidade(solicitacao.tipo_entidade, solicitacao.entidade_id);

    return reativacaoRepository.updateStatus(id, StatusSolicitacao.APROVADA);
  }

  async rejeitar(id: number) {
    const solicitacao = await reativacaoRepository.findById(id);
    if (!solicitacao) {
      throw new AppError('Solicitação de reativação não encontrada', 404);
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new AppError('Esta solicitação já foi processada', 400);
    }

    return reativacaoRepository.updateStatus(id, StatusSolicitacao.REJEITADA);
  }

  async reativarDireto(tipo: TipoEntidade, id: number) {
    const entidade = await this.buscarEntidade(tipo, id);
    if (entidade.ativo) {
      throw new AppError('O registro informado já está ativo', 400);
    }

    const atualizado = await this.ativarEntidade(tipo, id);
    await reativacaoRepository.resolvePendingForEntity(tipo, id, StatusSolicitacao.APROVADA);
    return atualizado;
  }
}

export const reativacaoService = new ReativacaoService();
