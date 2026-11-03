# Registro de Atividades (LOGS)

## Task 1.1 - Inicialização do Projeto Backend e Configuração TypeScript
- **Data:** 2026-10-29
- **Branch:** `feat/fase1-setup-backend-banco`
- **O que foi feito:**
  - Inicializada a estrutura do servidor backend em Node.js com TypeScript e Express.
  - Instaladas as dependências base (`express`, `cors`, `dotenv`, `zod`, `bcryptjs`, `jsonwebtoken`) e respectivas tipagens/ferramentas (`typescript`, `tsx`, `@types/*`).
  - Configurado `app.ts` com suporte a JSON, CORS e rota de healthcheck (`GET /health`).
  - Configurado `server.ts` carregando variáveis de ambiente e iniciando o servidor HTTP.
  - Atualizado `.gitignore` para ignorar `node_modules/`, `dist/` e `.env`.
- **Arquivos criados:**
  - `backend/package.json`
  - `backend/package-lock.json`
  - `backend/tsconfig.json`
  - `backend/.env.example`
  - `backend/src/app.ts`
  - `backend/src/server.ts`
- **Arquivos modificados:**
  - `.gitignore`
  - `LOGS.md`

## Task 1.2 - Modelagem do Banco de Dados (PostgreSQL + Prisma) e Seed Master
- **Data:** 2026-10-29
- **Branch:** `feat/fase1-setup-backend-banco`
- **O que foi feito:**
  - Instalado Prisma ORM (`prisma` e `@prisma/client` v6) para PostgreSQL e gerado o Prisma Client.
  - Modelado `schema.prisma` com os enums `Perfil`, `TipoEntidade` e `StatusSolicitacao`, além dos models `Usuario`, `Motorista`, `Veiculo` (com `responsavel_id` opcional referenciando `Motorista` na relação `1:N`) e `SolicitacaoReativacao`.
  - Criada instância compartilhada do `PrismaClient` em `src/config/database.ts`.
  - Implementado `prisma/seed.ts` idempotente (`upsert`) para criação do usuário `MASTER` com senha hasheada via `bcryptjs`, além de configurar o comando de seed no `package.json` e variáveis opcionais no `.env.example`.
- **Arquivos criados:**
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed.ts`
  - `backend/src/config/database.ts`
- **Arquivos modificados:**
  - `backend/package.json`
  - `backend/package-lock.json`
  - `backend/.env.example`
  - `LOGS.md`


## Task 2.1 - Middlewares de Autenticação e Controle de Acesso (RBAC)
- **Data:** 2026-11-03
- **Branch:** `feat/fase2-autenticacao-usuarios`
- **O que foi feito:**
  - Criada classe de erro padronizada `AppError` em `src/utils/errors.ts`.
  - Implementado `authMiddleware` para validar o token JWT no header `Authorization: Bearer <token>`, verificar o status ativo do usuário e anexar `req.user = { id, perfil, ativo }`.
  - Implementado `roleMiddleware` (e guardas `requireMaster` e `requireMasterOrAdmin`) para restrição de rotas por perfil (`['MASTER']` e `['MASTER', 'ADMIN']`).
- **Arquivos criados:**
  - `backend/src/utils/errors.ts`
  - `backend/src/middlewares/auth.middleware.ts`
  - `backend/src/middlewares/role.middleware.ts`
- **Arquivos modificados:**
  - `LOGS.md`

## Task 2.2 - Módulo de Usuários (Repository, Service, Controller, Zod)
- **Data:** 2026-11-03
- **Branch:** `feat/fase2-autenticacao-usuarios`
- **O que foi feito:**
  - Criados os schemas Zod (`loginSchema`, `createUsuarioSchema`, `updateUsuarioSchema`) para validação de dados e normalização de CPF.
  - Implementado `UsuarioRepository` com consultas seguras omitindo hash de senha nas respostas públicas.
  - Implementado `UsuarioService` com autenticação (`POST /auth/login`), regras de hierarquia na criação/edição (`MASTER` cria `ADMIN`/`GERAL`, `ADMIN` cria apenas `GERAL`, bloqueio de criação/atribuição `MASTER` via API), bloqueio de edição de usuários com `ativo === false` e baixa lógica (`ativo = false`).
  - Implementados `UsuarioController` e `usuario.routes.ts` e registradas as rotas `/auth` e `/usuarios` em `src/app.ts`.
- **Arquivos criados:**
  - `backend/src/modules/usuarios/usuario.schema.ts`
  - `backend/src/modules/usuarios/usuario.repository.ts`
  - `backend/src/modules/usuarios/usuario.service.ts`
  - `backend/src/modules/usuarios/usuario.controller.ts`
  - `backend/src/modules/usuarios/usuario.routes.ts`
- **Arquivos modificados:**
  - `backend/src/app.ts`
  - `LOGS.md`


## Task 3.1 - Módulo de Motoristas
- **Data:** 2026-11-03
- **Branch:** `feat/fase3-dominio-frota`
- **O que foi feito:**
  - Criados os schemas Zod (`createMotoristaSchema`, `updateMotoristaSchema`) com validação e normalização de CPF (11 dígitos) e CNH (9 a 11 dígitos), além de data de vencimento da CNH.
  - Implementado `MotoristaRepository` retornando veículos vinculados (`include: { veiculos: true }`) e baixa transacional que desvincula veículos (`responsavel_id = null`) ao inativar o motorista.
  - Implementado `MotoristaService` com validação de unicidade de CPF/CNH, bloqueio de edição de motorista inativo (`ativo === false`) e baixa lógica (`ativo = false`).
  - Implementados `MotoristaController` e `motorista.routes.ts` e registradas as rotas `/motoristas` em `src/app.ts`.
- **Arquivos criados:**
  - `backend/src/modules/motoristas/motorista.schema.ts`
  - `backend/src/modules/motoristas/motorista.repository.ts`
  - `backend/src/modules/motoristas/motorista.service.ts`
  - `backend/src/modules/motoristas/motorista.controller.ts`
  - `backend/src/modules/motoristas/motorista.routes.ts`
- **Arquivos modificados:**
  - `backend/src/app.ts`
  - `LOGS.md`

## Task 3.2 - Integração Externa FIPE e Cálculo de IPVA/Licenciamento
- **Data:** 2026-11-03
- **Branch:** `feat/fase3-dominio-frota`
- **O que foi feito:**
  - Implementado `FipeService` em `src/services/fipe.service.ts` para consulta de valor venal por código FIPE em API pública (com fallback para `valor_venal` informado manualmente).
  - Criado método `calcularProximoIpva(valorVenal, finalPlaca)` que calcula 4% de IPVA estimado para controle orçamentário (destacando isenção de frota pública) e estima a próxima data de vencimento (`data_ipva`) conforme o último dígito da placa.
- **Arquivos criados:**
  - `backend/src/services/fipe.service.ts`
- **Arquivos modificados:**
  - `LOGS.md`
