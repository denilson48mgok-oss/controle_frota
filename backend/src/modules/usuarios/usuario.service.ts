import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Perfil } from '@prisma/client';
import { AppError } from '../../utils/errors';
import { AuthUser } from '../../middlewares/auth.middleware';
import { usuarioRepository } from './usuario.repository';
import { CreateUsuarioInput, LoginInput, UpdateUsuarioInput } from './usuario.schema';

export class UsuarioService {
  async login({ login, senha }: LoginInput) {
    const usuario = await usuarioRepository.findByLogin(login);

    if (!usuario) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401);
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário inativo', 403);
    }

    const secret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil, ativo: usuario.ativo },
      secret,
      { expiresIn: '8h' },
    );

    const dadosUsuario = {
      id: usuario.id,
      login: usuario.login,
      nome: usuario.nome,
      cpf: usuario.cpf,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    };

    return {
      token,
      user: dadosUsuario,
      usuario: dadosUsuario,
    };
  }

  async findAll() {
    return usuarioRepository.findAll();
  }

  async findById(id: number) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return usuario;
  }

  async create(data: CreateUsuarioInput, currentUser: AuthUser) {
    if (currentUser.perfil !== Perfil.MASTER && currentUser.perfil !== Perfil.ADMIN) {
      throw new AppError('Acesso negado', 403);
    }

    const targetPerfil = data.perfil ?? Perfil.GERAL;

    if (targetPerfil === Perfil.MASTER) {
      throw new AppError('Não é permitido criar usuário com perfil MASTER via API', 403);
    }

    if (currentUser.perfil === Perfil.ADMIN && targetPerfil !== Perfil.GERAL) {
      throw new AppError('Usuários ADMIN só podem criar usuários com perfil GERAL', 403);
    }

    const existingLogin = await usuarioRepository.findByLogin(data.login);
    if (existingLogin) {
      throw new AppError('Login já cadastrado', 409);
    }

    const existingCpf = await usuarioRepository.findByCpf(data.cpf);
    if (existingCpf) {
      throw new AppError('CPF já cadastrado', 409);
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    return usuarioRepository.create({
      login: data.login,
      senha: hashedPassword,
      nome: data.nome,
      cpf: data.cpf,
      perfil: targetPerfil,
      ativo: true,
    });
  }

  async update(id: number, data: UpdateUsuarioInput, currentUser: AuthUser) {
    const existing = await usuarioRepository.findById(id);
    if (!existing) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!existing.ativo) {
      throw new AppError('Não é permitido editar um usuário inativo', 400);
    }

    if (data.perfil === Perfil.MASTER) {
      throw new AppError('Não é permitido atribuir perfil MASTER via API', 403);
    }

    if (currentUser.perfil === Perfil.ADMIN && data.perfil && data.perfil !== Perfil.GERAL) {
      throw new AppError('Usuários ADMIN só podem atribuir perfil GERAL', 403);
    }

    if (data.login && data.login !== existing.login) {
      const loginInUse = await usuarioRepository.findByLogin(data.login);
      if (loginInUse) {
        throw new AppError('Login já cadastrado', 409);
      }
    }

    if (data.cpf && data.cpf !== existing.cpf) {
      const cpfInUse = await usuarioRepository.findByCpf(data.cpf);
      if (cpfInUse) {
        throw new AppError('CPF já cadastrado', 409);
      }
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (data.senha) {
      updatePayload.senha = await bcrypt.hash(data.senha, 10);
    }

    return usuarioRepository.update(id, updatePayload);
  }

  async baixa(id: number) {
    const existing = await usuarioRepository.findById(id);
    if (!existing) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!existing.ativo) {
      throw new AppError('Usuário já está inativo', 400);
    }

    return usuarioRepository.update(id, { ativo: false });
  }
}

export const usuarioService = new UsuarioService();
