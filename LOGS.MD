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

## Task 3.3 - Módulo de Veículos
- **Data:** 2026-11-03
- **Branch:** `feat/fase3-dominio-frota`
- **O que foi feito:**
  - Criados os schemas Zod (`createVeiculoSchema`, `updateVeiculoSchema`) com validação de placa (antiga e Mercosul), chassi, renavam, ano do modelo e campos opcionais `codigo_fipe` e `valor_venal`.
  - Implementado `VeiculoRepository` retornando o motorista responsável (`include: { responsavel: true }`).
  - Implementado `VeiculoService` com validação de unicidade (`placa`, `chassi`, `renavam`), validação de existência e status ativo do `responsavel_id`, integração com `fipeService` para preenchimento de `data_ipva` e `valor_ipva`, bloqueio de edição de veículo inativo (`ativo === false`) e baixa lógica (`PATCH /veiculos/:id/baixa`).
  - Implementados `VeiculoController` e `veiculo.routes.ts` e registradas as rotas `/veiculos` em `src/app.ts`.
- **Arquivos criados:**
  - `backend/src/modules/veiculos/veiculo.schema.ts`
  - `backend/src/modules/veiculos/veiculo.repository.ts`
  - `backend/src/modules/veiculos/veiculo.service.ts`
  - `backend/src/modules/veiculos/veiculo.controller.ts`
  - `backend/src/modules/veiculos/veiculo.routes.ts`
- **Arquivos modificados:**
  - `backend/src/app.ts`
  - `LOGS.md`

## Task 3.4 - Fluxo de Solicitação e Revogação de Status Inativo
- **Data:** 2026-11-03
- **Branch:** `feat/fase3-dominio-frota`
- **O que foi feito:**
  - Criados os schemas Zod (`createReativacaoSchema`, `entidadeParamSchema`) validando o tipo de entidade (`USUARIO`, `MOTORISTA`, `VEICULO`), o ID da entidade e o motivo.
  - Implementado `ReativacaoRepository` para criação, listagem e atualização de solicitações na tabela `SolicitacaoReativacao`.
  - Implementado `ReativacaoService` permitindo abertura de solicitação por qualquer usuário autenticado (`POST /reativacoes`), aprovação/rejeição restrita a `ADMIN` e `MASTER` (`PATCH /reativacoes/:id/aprovar` e `PATCH /reativacoes/:id/rejeitar`) alterando `ativo = true` na entidade correspondente, e revogação direta de inatividade (`PATCH /:entidade/:id/reativar`) restrita a `ADMIN` e `MASTER`.
  - Implementados `ReativacaoController` e `reativacao.routes.ts` e registradas as rotas em `src/app.ts`.
- **Arquivos criados:**
  - `backend/src/modules/reativacoes/reativacao.schema.ts`
  - `backend/src/modules/reativacoes/reativacao.repository.ts`
  - `backend/src/modules/reativacoes/reativacao.service.ts`
  - `backend/src/modules/reativacoes/reativacao.controller.ts`
  - `backend/src/modules/reativacoes/reativacao.routes.ts`
- **Arquivos modificados:**
  - `backend/src/app.ts`
  - `LOGS.md`

## Task 4.1 - Estrutura Base, Cliente HTTP e Tela de Login
- **Data:** 2026-11-03
- **Branch:** `feat/fase4-frontend-web`
- **O que foi feito:**
  - Criado o estilo base (`frontend/css/styles.css`) para login, dashboard e painel administrativo.
  - Implementado `frontend/js/api.js` centralizando a URL base da API, injeção automática do header `Authorization: Bearer <token>` via `localStorage` e tratamento padronizado de erros HTTP (400, 401, 403).
  - Implementados `frontend/index.html` e `frontend/js/auth.js` para autenticação em `POST /auth/login` e armazenamento de `token`, `perfil` (`MASTER`, `ADMIN`, `GERAL`) e `usuario` no `localStorage`.
- **Arquivos criados:**
  - `frontend/index.html`
  - `frontend/css/styles.css`
  - `frontend/js/api.js`
  - `frontend/js/auth.js`
- **Arquivos modificados:**
  - `LOGS.md`

## Task 4.2 - Dashboard de Frotas (Veículos, Motoristas e Calculadora FIPE/IPVA)
- **Data:** 2026-11-03
- **Branch:** `feat/fase4-frontend-web`
- **O que foi feito:**
  - Criado `frontend/dashboard.html` com seções de gerenciamento e listagem de veículos e motoristas, além de prévia de IPVA (4% sobre o valor venal e vencimento pelo final da placa).
  - Implementados `frontend/js/veiculos.js` e `frontend/js/motoristas.js` exibindo placa, modelo, responsável, status (`Ativo`/`Inativo`), data/valor estimado do próximo IPVA e veículos vinculados a cada motorista.
  - Desabilitado o botão `Editar` para registros inativos (`ativo === false`) e exibido o botão `Solicitar Reativação` para usuários `GERAL` ou `Reativar` direto para `ADMIN`/`MASTER`.
- **Arquivos criados:**
  - `frontend/dashboard.html`
  - `frontend/js/veiculos.js`
  - `frontend/js/motoristas.js`
- **Arquivos modificados:**
  - `LOGS.md`

## Task 4.3 - Painel Administrativo (Gestão de Usuários e Aprovação de Reativações)
- **Data:** 2026-11-03
- **Branch:** `feat/fase4-frontend-web`
- **O que foi feito:**
  - Criado `frontend/admin.html` e implementado `frontend/js/admin.js` com bloqueio de acesso e redirecionamento para `dashboard.html` caso o usuário logado tenha perfil `GERAL`.
  - Implementado formulário de usuários que fixa o perfil em `GERAL` quando o usuário logado é `ADMIN` e permite selecionar `ADMIN` ou `GERAL` quando é `MASTER`, além de bloquear edição de usuários inativos.
  - Implementada listagem de solicitações pendentes de reativação com botões `Aprovar` (`PATCH /reativacoes/:id/aprovar`) e `Rejeitar` (`PATCH /reativacoes/:id/rejeitar`).
- **Arquivos criados:**
  - `frontend/admin.html`
  - `frontend/js/admin.js`
- **Arquivos modificados:**
  - `LOGS.md`
