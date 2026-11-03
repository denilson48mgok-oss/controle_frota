import { AppError } from '../../utils/errors';
import { fipeService } from '../../services/fipe.service';
import { motoristaRepository } from '../motoristas/motorista.repository';
import { veiculoRepository } from './veiculo.repository';
import { CreateVeiculoInput, UpdateVeiculoInput } from './veiculo.schema';

export class VeiculoService {
  private async validarResponsavel(responsavelId?: number | null): Promise<void> {
    if (responsavelId === undefined || responsavelId === null) return;

    const motorista = await motoristaRepository.findById(responsavelId);
    if (!motorista) {
      throw new AppError('Motorista responsável não encontrado', 404);
    }

    if (!motorista.ativo) {
      throw new AppError('Motorista responsável está inativo', 400);
    }
  }

  async findAll() {
    return veiculoRepository.findAll();
  }

  async findById(id: number) {
    const veiculo = await veiculoRepository.findById(id);
    if (!veiculo) {
      throw new AppError('Veículo não encontrado', 404);
    }
    return veiculo;
  }

  async create(data: CreateVeiculoInput) {
    if (await veiculoRepository.findByPlaca(data.placa)) {
      throw new AppError('Placa já cadastrada', 409);
    }
    if (await veiculoRepository.findByChassi(data.chassi)) {
      throw new AppError('Chassi já cadastrado', 409);
    }
    if (await veiculoRepository.findByRenavam(data.renavam)) {
      throw new AppError('Renavam já cadastrado', 409);
    }

    await this.validarResponsavel(data.responsavel_id);

    const ipva = await fipeService.obterCalculoIpva({
      placa: data.placa,
      codigo_fipe: data.codigo_fipe,
      valor_venal: data.valor_venal,
      ano_modelo: data.ano_modelo,
    });

    const { codigo_fipe: _cf, valor_venal: _vv, ...veiculoData } = data;

    return veiculoRepository.create({
      ...veiculoData,
      data_ipva: ipva?.dataIpva ?? null,
      valor_ipva: ipva ? ipva.valorIpva : null,
    });
  }

  async update(id: number, data: UpdateVeiculoInput) {
    const target = await veiculoRepository.findById(id);
    if (!target) {
      throw new AppError('Veículo não encontrado', 404);
    }

    if (!target.ativo) {
      throw new AppError('Veículo inativo não pode ser editado', 400);
    }

    if (data.placa && data.placa !== target.placa) {
      if (await veiculoRepository.findByPlaca(data.placa)) {
        throw new AppError('Placa já cadastrada', 409);
      }
    }

    if (data.chassi && data.chassi !== target.chassi) {
      if (await veiculoRepository.findByChassi(data.chassi)) {
        throw new AppError('Chassi já cadastrado', 409);
      }
    }

    if (data.renavam && data.renavam !== target.renavam) {
      if (await veiculoRepository.findByRenavam(data.renavam)) {
        throw new AppError('Renavam já cadastrado', 409);
      }
    }

    await this.validarResponsavel(data.responsavel_id);

    const { codigo_fipe, valor_venal, ...veiculoData } = data;
    const updatePayload: Record<string, unknown> = { ...veiculoData };

    if (data.placa || codigo_fipe !== undefined || valor_venal !== undefined) {
      const ipva = await fipeService.obterCalculoIpva({
        placa: data.placa ?? target.placa,
        codigo_fipe,
        valor_venal,
        ano_modelo: data.ano_modelo ?? target.ano_modelo,
      });

      if (ipva) {
        updatePayload.data_ipva = ipva.dataIpva;
        if (codigo_fipe !== undefined || valor_venal !== undefined || target.valor_ipva === null) {
          updatePayload.valor_ipva = ipva.valorIpva;
        }
      }
    }

    return veiculoRepository.update(id, updatePayload);
  }

  async baixa(id: number) {
    const target = await veiculoRepository.findById(id);
    if (!target) {
      throw new AppError('Veículo não encontrado', 404);
    }

    if (!target.ativo) {
      throw new AppError('Veículo já está inativo', 400);
    }

    return veiculoRepository.update(id, { ativo: false });
  }
}

export const veiculoService = new VeiculoService();
