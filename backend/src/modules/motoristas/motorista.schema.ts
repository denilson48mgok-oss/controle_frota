import { z } from 'zod';

const cpfSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length === 11, 'CPF deve conter 11 dígitos numéricos');

const cnhSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length >= 9 && v.length <= 11, 'CNH deve conter entre 9 e 11 dígitos numéricos');

export const createMotoristaSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  cpf: cpfSchema,
  num_cnh: cnhSchema,
  vencimento_cnh: z.coerce.date({ message: 'Data de vencimento da CNH inválida' }),
});

export const updateMotoristaSchema = z.object({
  nome: z.string().min(2, 'Nome inválido').optional(),
  cpf: cpfSchema.optional(),
  num_cnh: cnhSchema.optional(),
  vencimento_cnh: z.coerce.date({ message: 'Data de vencimento da CNH inválida' }).optional(),
});

export type CreateMotoristaInput = z.infer<typeof createMotoristaSchema>;
export type UpdateMotoristaInput = z.infer<typeof updateMotoristaSchema>;
