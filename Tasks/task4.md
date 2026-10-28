## FASE 4: Frontend Web (HTML/CSS/JS Vanilla)

### Task 4.1: Estrutura Base, Cliente HTTP e Tela de Login
- **Objetivo:** Criar a interface web limpa e o gerenciador de requisições (`fetch`) com suporte a JWT.
- **Arquivos para Leitura:**
  - `backend/src/modules/usuarios/usuario.routes.ts` (Apenas para checar os endpoints de auth)
- **Arquivos a Criar/Modificar:**
  - `frontend/index.html` (Tela de Login)
  - `frontend/css/styles.css`
  - `frontend/js/api.js`
  - `frontend/js/auth.js`
- **Regras de Implementação:**
  - **Não ler códigos de serviços ou banco do backend.**
  - `api.js` deve centralizar a URL base da API, injetar automaticamente o token salvo no `localStorage` e tratar erros HTTP (401, 403, 400).
  - Salvar perfil do usuário logado (`MASTER`, `ADMIN`, `GERAL`) no `localStorage` após login.

### Task 4.2: Dashboard de Frotas (Veículos, Motoristas e Calculadora FIPE/IPVA)
- **Objetivo:** Construir a tela principal de operação para gerenciar veículos e motoristas.
- **Arquivos para Leitura:**
  - `frontend/js/api.js`
  - `frontend/css/styles.css`
  - `backend/src/modules/veiculos/veiculo.schema.ts` (Apenas para referência dos campos de payload)
  - `backend/src/modules/motoristas/motorista.schema.ts`
- **Arquivos a Criar/Modificar:**
  - `frontend/dashboard.html`
  - `frontend/js/veiculos.js`
  - `frontend/js/motoristas.js`
- **Regras de Implementação:**
  - Listagem de veículos mostrando placa, modelo, responsável, status (`Ativo`/`Inativo`), data e valor estimado do próximo IPVA.
  - Desabilitar o botão "Editar" na UI se o item estiver com `ativo === false`.
  - Exibir botão "Solicitar Reativação" nos itens inativos para usuários comuns, e botão "Reativar" direto se o usuário logado for `ADMIN`/`MASTER`.

### Task 4.3: Painel Administrativo (Gestão de Usuários e Aprovação de Reativações)
- **Objetivo:** Criar a área de gestão de usuários e fila de solicitações de reativação.
- **Arquivos para Leitura:**
  - `frontend/js/api.js`
  - `frontend/dashboard.html`
  - `backend/src/modules/usuarios/usuario.schema.ts`
  - `backend/src/modules/reativacoes/reativacao.schema.ts`
- **Arquivos a Criar/Modificar:**
  - `frontend/admin.html`
  - `frontend/js/admin.js`
- **Regras de Implementação:**
  - Ocultar/bloquear acesso caso o usuário seja `GERAL`.
  - No formulário de novo usuário: se o logado for `ADMIN`, fixar o select de perfil apenas em `GERAL`. Se for `MASTER`, permitir selecionar `ADMIN` ou `GERAL`.
  - Listar solicitações pendentes de reativação com botões de "Aprovar" e "Rejeitar".