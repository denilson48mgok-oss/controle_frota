# Sistema de Controle de Frota

Aplicação completa para gerenciamento de frotas (Usuários, Motoristas, Veículos, integração FIPE/IPVA e fluxo de Solicitação/Aprovação de Reativação), construída com **Node.js, TypeScript, Express, Prisma ORM (PostgreSQL), Zod** no backend e **HTML5, CSS3 e JavaScript Vanilla** no frontend.

---

## 1. Pré-requisitos

Antes de iniciar, garanta que você possui instalado na máquina:
- **Node.js** (versão 18 ou superior — recomendado v20 LTS): [https://nodejs.org/](https://nodejs.org/)
- **PostgreSQL** (versão 14 ou superior)

> **Dica para Windows (PowerShell):** Caso o PowerShell bloqueie a execução de scripts `.ps1` (`PSSecurityException`), utilize `npm.cmd` e `npx.cmd` no lugar de `npm` e `npx` em todos os comandos abaixo.

---

## 2. Como Instalar e Configurar o PostgreSQL (Caso não tenha instalado)

Escolha **uma** das 3 opções abaixo conforme seu ambiente:

### Opção A — Windows (Instalador ou Winget)
1. Instale via **Winget** no PowerShell:
   ```powershell
   winget install PostgreSQL.PostgreSQL.16
   ```
   *(Ou baixe o instalador oficial em [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)).*
2. Durante a instalação:
   - Defina uma senha para o superusuário `postgres` (exemplo: `postgres`).
   - Mantenha a porta padrão **`5432`**.
3. Crie o banco de dados `controle_frota` (via **pgAdmin 4** ou pelo terminal):
   ```powershell
   psql -U postgres -h localhost -c "CREATE DATABASE controle_frota;"
   ```

### Opção B — Linux (Ubuntu / Debian)
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE controle_frota;"
```

### Opção C — Via Docker (Sem instalar o PostgreSQL localmente)
Se você tiver o Docker instalado, suba um container pronto com um único comando:
```powershell
docker run --name postgres-frota `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=controle_frota `
  -p 5432:5432 `
  -d postgres:16
```

---

## 3. Configuração do Backend e Banco de Dados

### 3.1. Instalar dependências do Backend
Na raiz do repositório, entre na pasta `backend/` e instale os pacotes:
```powershell
cd backend
npm.cmd install
```

### 3.2. Configurar as Variáveis de Ambiente (`.env`)
Crie o arquivo `backend/.env` copiando o modelo `backend/.env.example`:

- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

Edite o arquivo `backend/.env` com os dados da sua conexão PostgreSQL:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/controle_frota?schema=public"
JWT_SECRET="sua_chave_secreta_jwt"

# Credenciais opcionais para o seed do usuário MASTER (valores padrão abaixo):
MASTER_LOGIN="master"
MASTER_PASSWORD="master123"
MASTER_NOME="Administrador Master"
MASTER_CPF="00000000000"
```

### 3.3. Criar as Tabelas e Executar o Seed (`MASTER`)
Ainda dentro da pasta `backend/`, gere o cliente Prisma, sincronize o schema com o banco e crie o usuário `MASTER`:
```powershell
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run seed
```

---

## 4. Executando o Projeto

### 4.1. Iniciar o Servidor Backend
No terminal dentro de `backend/`:
```powershell
npm.cmd run dev
```
- A API estará disponível em: **`http://localhost:3000`**
- Para verificar se está online: acesse `http://localhost:3000/health` (deve retornar `{"status":"ok"}`).

### 4.2. Iniciar o Frontend Web
Abra um **segundo terminal** na raiz do projeto (`controle_frota/`) e sirva a pasta `frontend/`:
```powershell
npx.cmd serve frontend -l 5500
```
- Acesse no navegador: **`http://localhost:5500`**
*(Alternativamente, você pode usar a extensão **Live Server** do VS Code ou abrir `frontend/index.html` diretamente no navegador).*

---

## 5. Funcionamento Final (Guia de Uso)

### 5.1. Login (`index.html`)
1. Acesse `http://localhost:5500`.
2. Faça login com a conta **MASTER** criada pelo seed:
   - **Login:** `master` (ou o valor definido em `MASTER_LOGIN` no `.env`)
   - **Senha:** `master123` (ou o valor definido em `MASTER_PASSWORD` no `.env`)

### 5.2. Dashboard de Frota (`dashboard.html`)
- **Gerenciar Motoristas:**
  - Cadastre motoristas informando Nome, CPF (11 dígitos), Nº da CNH (9 a 11 dígitos) e Data de Vencimento.
  - A tabela lista os motoristas e todos os veículos atualmente sob sua responsabilidade.
  - Ao clicar em **Dar Baixa**, o motorista passa para `Inativo` (`ativo = false`) e seus veículos são desvinculados automaticamente em transação.
- **Gerenciar Veículos e Cálculo FIPE/IPVA:**
  - Cadastre veículos informando Marca, Modelo, Placa (padrão antigo `ABC1234` ou Mercosul `ABC1D23`), Chassi, Renavam, Ano e opcionalmente um Motorista Responsável ativo.
  - Informe o **Código FIPE** (consulta automática na API pública da FIPE) e/ou o **Valor Venal (R$)** (fallback manual). O sistema calcula automaticamente **4% de IPVA estimado** e a **próxima data de vencimento** baseada no último dígito da placa.
- **Bloqueio de Inativos e Reativação:**
  - Registros com status **Inativo** têm o botão **Editar** desabilitado tanto na interface quanto na API (`PUT` bloqueado).
  - Se logado como `GERAL`, itens inativos exibem o botão **Solicitar Reativação** (pede o motivo e envia para a fila administrativa).
  - Se logado como `ADMIN` ou `MASTER`, itens inativos exibem o botão **Reativar** para revogação imediata da inatividade.

### 5.3. Painel Administrativo (`admin.html`)
- Acessível pelo botão **Painel Admin** no topo do Dashboard (visível e permitido apenas para perfis `MASTER` e `ADMIN`; usuários `GERAL` são bloqueados e redirecionados).
- **Gestão de Usuários e Hierarquia:**
  - `MASTER` pode criar usuários com perfil `ADMIN` ou `GERAL`.
  - `ADMIN` possui o seletor travado para criar apenas usuários `GERAL`.
- **Fila de Solicitações de Reativação:**
  - Lista todas as solicitações `PENDENTE` abertas pelos usuários.
  - Ao clicar em **Aprovar**, a solicitação muda para `APROVADA` e o cadastro correspondente (`Usuario`, `Motorista` ou `Veiculo`) volta automaticamente para `ativo = true`.
  - Ao clicar em **Rejeitar**, a solicitação é encerrada como `REJEITADA`.

---

## 6. Principais Rotas da API

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Verificação de saúde da API |
| `POST` | `/auth/login` | Público | Autenticação JWT |
| `GET` | `/usuarios` | Autenticado | Lista usuários |
| `POST` | `/usuarios` | `MASTER`, `ADMIN` | Cria usuário (respeitando hierarquia) |
| `PUT` | `/usuarios/:id` | `MASTER`, `ADMIN` | Edita usuário ativo |
| `PATCH` | `/usuarios/:id/baixa` | `MASTER`, `ADMIN` | Inativa usuário (`ativo = false`) |
| `GET / POST` | `/motoristas` | Autenticado | Lista e cadastra motoristas |
| `PUT` | `/motoristas/:id` | Autenticado | Edita motorista ativo |
| `PATCH` | `/motoristas/:id/baixa` | Autenticado | Inativa motorista e desvincula veículos |
| `GET / POST` | `/veiculos` | Autenticado | Lista e cadastra veículos (com cálculo FIPE/IPVA) |
| `PUT` | `/veiculos/:id` | Autenticado | Edita veículo ativo |
| `PATCH` | `/veiculos/:id/baixa` | Autenticado | Inativa veículo (`ativo = false`) |
| `GET / POST` | `/reativacoes` | Autenticado | Lista e cria solicitações de reativação |
| `PATCH` | `/reativacoes/:id/aprovar` | `MASTER`, `ADMIN` | Aprova solicitação e reativa entidade |
| `PATCH` | `/reativacoes/:id/rejeitar` | `MASTER`, `ADMIN` | Rejeita solicitação de reativação |
| `PATCH` | `/:entidade/:id/reativar` | `MASTER`, `ADMIN` | Reativação direta (`usuarios`, `motoristas`, `veiculos`) |
