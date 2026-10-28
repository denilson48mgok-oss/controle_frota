## FASE 2: Autenticação, Segurança e Usuários

### Task 2.1: Middlewares de Autenticação e Controle de Acesso (RBAC)
- **Objetivo:** Criar a camada de segurança JWT e validação de permissões por perfil.
- **Arquivos para Leitura:**
  - `backend/prisma/schema.prisma`
  - `backend/src/app.ts`
- **Arquivos a Criar/Modificar:**
  - `backend/src/middlewares/auth.middleware.ts`
  - `backend/src/middlewares/role.middleware.ts`
  - `backend/src/utils/errors.ts`
- **Regras de Implementação:**
  - Validar token JWT no header `Authorization: Bearer <token>`.
  - Anexar `user: { id, perfil, ativo }` na requisição. Bloquear login/acesso caso o usuário esteja `ativo: false` (exceto na rota de solicitar reativação, se aplicável, ou tratar via endpoint específico).
  - Criar guardas de rota para permitir apenas `['MASTER']` ou `['MASTER', 'ADMIN']`.

### Task 2.2: Módulo de Usuários (Repository, Service, Controller, Zod)
- **Objetivo:** Implementar CRUD de usuários respeitando a hierarquia (`MASTER` vs `ADMIN`) e regras de inativação.
- **Arquivos para Leitura:**
  - `backend/prisma/schema.prisma`
  - `backend/src/config/database.ts`
  - `backend/src/middlewares/auth.middleware.ts`
  - `backend/src/middlewares/role.middleware.ts`
- **Arquivos a Criar/Modificar:**
  - `backend/src/modules/usuarios/usuario.schema.ts`
  - `backend/src/modules/usuarios/usuario.repository.ts`
  - `backend/src/modules/usuarios/usuario.service.ts`
  - `backend/src/modules/usuarios/usuario.controller.ts`
  - `backend/src/modules/usuarios/usuario.routes.ts`
  - `backend/src/app.ts` (registrar rotas)
- **Regras de Implementação:**
  - Rota de Login (`POST /auth/login`): retorna JWT e dados básicos do usuário.
  - Criação (`POST /usuarios`):
    - Apenas `MASTER` ou `ADMIN` podem acessar.
    - Se o usuário logado for `ADMIN`, ele **só pode criar** usuários com perfil `GERAL`.
    - Apenas `MASTER` pode criar usuários com perfil `ADMIN`. Ninguém cria `MASTER` via API.
  - Edição (`PUT /usuarios/:id`): Bloquear edição se o usuário alvo estiver com `ativo === false`.
  - Baixa (`PATCH /usuarios/:id/baixa`): Define `ativo = false`.

---
