import { AppError } from '../../utils/errors';
import { motoristaRepository } from './motorista.repository';
import { CreateMotoristaInput, UpdateMotoristaInput } from './motorista.schema';

export class MotoristaService {
  async findAll() {
    return motoristaRepository.findAll();
  }

  async findById(id: number) {
    const motorista = await motoristaRepository.findById(id);
    if (!motorista) {
      throw new AppError('Motorista não encontrado', 404);
    }
    return motorista;
  }

  async create(data: CreateMotoristaInput) {
    const existingCpf = await motoristaRepository.findByCpf(data.cpf);
    if (existingCpf) {
      throw new AppError('CPF já cadastrado', 409);
    }

    const existingCnh = await motoristaRepository.findByCnh(data.num_cnh);
    if (existingCnh) {
      throw new AppError('CNH já cadastrada', 409);
    }

    return motoristaRepository.create(data);
  }

  async update(id: number, data: UpdateMotoristaInput) {
    const target = await motoristaRepository.findById(id);
    if (!target) {
      throw new AppError('Motorista não encontrado', 404);
    }

    if (!target.ativo) {
      throw new AppError('Motorista inativo não pode ser editado', 400);
    }

    if (data.cpf && data.cpf !== target.cpf) {
      const existingCpf = await motoristaRepository.findByCpf(data.cpf);
      if (existingCpf) {
        throw new AppError('CPF já cadastrado', 409);
      }
    }

    if (data.num_cnh && data.num_cnh !== target.num_cnh) {
      const existingCnh = await motoristaRepository.findByCnh(data.num_cnh);
      if (existingCnh) {
        throw new AppError('CNH já cadastrada', 409);
      }
    }

    return motoristaRepository.update(id, data);
  }

  async baixa(id: number) {
    const target = await motoristaRepository.findById(id);
    if (!target) {
      throw new AppError('Motorista não encontrado', 404);
    }

    if (!target.ativo) {
      throw new AppError('Motorista já está inativo', 400);
    }

    return motoristaRepository.deactivateAndUnlinkVehicles(id);
  }
}

export const motoristaService = new MotoristaService();
