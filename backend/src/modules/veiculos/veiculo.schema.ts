import { z } from 'zod';

const placaSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .refine((v) => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(v), 'Placa inválida (use padrão ABC1234 ou ABC1D23)');

export const createVeiculoSchema = z.object({
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  placa: placaSchema,
  chassi: z.string().min(5, 'Chassi é obrigatório').transform((v) => v.trim().toUpperCase()),
  renavam: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 9 && v.length <= 11, 'Renavam deve conter entre 9 e 11 dígitos numéricos'),
  ano_modelo: z.coerce.number().int().min(1900, 'Ano do modelo inválido').max(2100, 'Ano do modelo inválido'),
  responsavel_id: z.coerce.number().int().positive().nullable().optional(),
  codigo_fipe: z.string().optional(),
  valor_venal: z.coerce.number().positive().optional(),
});

export const updateVeiculoSchema = z.object({
  marca: z.string().min(1, 'Marca inválida').optional(),
  modelo: z.string().min(1, 'Modelo inválido').optional(),
  placa: placaSchema.optional(),
  chassi: z
    .string()
    .min(5, 'Chassi inválido')
    .transform((v) => v.trim().toUpperCase())
    .optional(),
  renavam: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 9 && v.length <= 11, 'Renavam deve conter entre 9 e 11 dígitos numéricos')
    .optional(),
  ano_modelo: z.coerce.number().int().min(1900).max(2100).optional(),
  responsavel_id: z.coerce.number().int().positive().nullable().optional(),
  codigo_fipe: z.string().optional(),
  valor_venal: z.coerce.number().positive().optional(),
});

export type CreateVeiculoInput = z.infer<typeof createVeiculoSchema>;
export type UpdateVeiculoInput = z.infer<typeof updateVeiculoSchema>;
