import { z } from 'zod';
import { TipoEntidade } from '@prisma/client';

export const createReativacaoSchema = z.object({
  tipo_entidade: z.nativeEnum(TipoEntidade, { message: 'Tipo de entidade inválido (use USUARIO, MOTORISTA ou VEICULO)' }),
  entidade_id: z.coerce.number().int().positive('ID da entidade inválido'),
  motivo: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres'),
});

const entidadeParamMap: Record<string, TipoEntidade> = {
  USUARIO: TipoEntidade.USUARIO,
  USUARIOS: TipoEntidade.USUARIO,
  MOTORISTA: TipoEntidade.MOTORISTA,
  MOTORISTAS: TipoEntidade.MOTORISTA,
  VEICULO: TipoEntidade.VEICULO,
  VEICULOS: TipoEntidade.VEICULO,
};

export const entidadeParamSchema = z
  .string()
  .transform((v) => entidadeParamMap[v.trim().toUpperCase()])
  .refine((v): v is TipoEntidade => Boolean(v), 'Entidade inválida (use usuarios, motoristas ou veiculos)');

export type CreateReativacaoInput = z.infer<typeof createReativacaoSchema>;
