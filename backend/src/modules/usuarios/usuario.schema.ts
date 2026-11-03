import { z } from 'zod';
import { Perfil } from '@prisma/client';

export const loginSchema = z.object({
  login: z.string().min(1, 'Login é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const createUsuarioSchema = z.object({
  login: z.string().min(3, 'Login deve ter no mínimo 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(2, 'Nome é obrigatório'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 11, 'CPF deve conter 11 dígitos numéricos'),
  perfil: z.nativeEnum(Perfil).optional().default(Perfil.GERAL),
});

export const updateUsuarioSchema = z.object({
  login: z.string().min(3, 'Login deve ter no mínimo 3 caracteres').optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  nome: z.string().min(2, 'Nome inválido').optional(),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 11, 'CPF deve conter 11 dígitos numéricos')
    .optional(),
  perfil: z.nativeEnum(Perfil).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
