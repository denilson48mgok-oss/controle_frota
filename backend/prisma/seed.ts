import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Perfil } from '@prisma/client';
import { prisma } from '../src/config/database';

async function main() {
  const login = process.env.MASTER_LOGIN || 'master';
  const plainPassword = process.env.MASTER_PASSWORD || 'master123';
  const nome = process.env.MASTER_NOME || 'Administrador Master';
  const cpf = process.env.MASTER_CPF || '00000000000';

  const senha = await bcrypt.hash(plainPassword, 10);

  await prisma.usuario.upsert({
    where: { login },
    update: {},
    create: {
      login,
      senha,
      nome,
      cpf,
      ativo: true,
      perfil: Perfil.MASTER,
    },
  });

  console.log(`Usuário MASTER '${login}' configurado com sucesso.`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
