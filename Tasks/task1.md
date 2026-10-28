## FASE 1: Setup e Banco de Dados (Backend)

### Task 1.1: Inicialização do Projeto Backend e Configuração TypeScript
- **Objetivo:** Configurar a estrutura base do servidor Node.js com TypeScript e variáveis de ambiente.
- **Arquivos para Leitura:** `Nenhum` (Diretório vazio)
- **Arquivos a Criar/Modificar:**
  - `backend/package.json`
  - `backend/tsconfig.json`
  - `backend/.env.example`
  - `backend/src/server.ts`
  - `backend/src/app.ts`
- **Regras de Implementação:**
  - Instalar dependências base: `fastify` (ou `express`), `zod`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `cors` e tipos correspondentes.
  - Configurar `app.ts` apenas com rotas de healthcheck (`GET /health`) e suporte a JSON/CORS.

### Task 1.2: Modelagem do Banco de Dados (PostgreSQL + Prisma) e Seed Master
- **Objetivo:** Criar o schema relacional completo e o script inicial para injetar o usuário `MASTER` direto no banco.
- **Arquivos para Leitura:**
  - `backend/package.json`
  - `backend/.env.example`
- **Arquivos a Criar/Modificar:**
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed.ts`
  - `backend/src/config/database.ts`
- **Regras de Implementação:**
  - Model `Usuario`: `id` (PK), `login` (Unique), `senha`, `nome`, `cpf` (Unique), `ativo` (Boolean, default true), `perfil` (Enum: `MASTER`, `ADMIN`, `GERAL`).
  - Model `Motorista`: `id` (PK), `ativo` (Boolean, default true), `nome`, `cpf` (Unique), `num_cnh` (Unique), `vencimento_cnh` (DateTime), relação `1:N` com `Veiculo`.
  - Model `Veiculo`: `id` (PK), `ativo` (Boolean, default true), `marca`, `modelo`, `placa` (Unique), `chassi` (Unique), `renavam` (Unique), `ano_modelo` (Int), `data_ipva` (DateTime?), `valor_ipva` (Decimal?), `responsavel_id` (FK opcional ou obrigatória para `Motorista`).
  - Model `SolicitacaoReativacao`: `id` (PK), `tipo_entidade` (Enum: `USUARIO`, `MOTORISTA`, `VEICULO`), `entidade_id` (Int), `motivo` (String), `status` (Enum: `PENDENTE`, `APROVADA`, `REJEITADA`), `solicitante_id` (FK `Usuario`), `criado_em` (DateTime).
  - No `seed.ts`, criar o usuário `MASTER` com senha hasheada via `bcryptjs`.
---
