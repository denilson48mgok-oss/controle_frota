
## FASE 3: Domínio da Frota (Motoristas, Veículos, FIPE e Reativações)

### Task 3.1: Módulo de Motoristas
- **Objetivo:** Implementar gerenciamento de motoristas nas 3 camadas.
- **Arquivos para Leitura:**
  - `backend/prisma/schema.prisma`
  - `backend/src/config/database.ts`
  - `backend/src/utils/errors.ts`
- **Arquivos a Criar/Modificar:**
  - `backend/src/modules/motoristas/motorista.schema.ts`
  - `backend/src/modules/motoristas/motorista.repository.ts`
  - `backend/src/modules/motoristas/motorista.service.ts`
  - `backend/src/modules/motoristas/motorista.controller.ts`
  - `backend/src/modules/motoristas/motorista.routes.ts`
  - `backend/src/app.ts` (registrar rotas)
- **Regras de Implementação:**
  - Validar CPF e CNH com Zod.
  - Listagem deve retornar também a lista de veículos sob responsabilidade do motorista.
  - Bloquear `PUT /motoristas/:id` se `ativo === false`.
  - Baixa via `PATCH /motoristas/:id/baixa` altera `ativo = false` (e desvincula veículos ativos ou exige desvinculação prévia).

### Task 3.2: Integração Externa FIPE e Cálculo de IPVA/Licenciamento
- **Objetivo:** Criar um serviço isolado para consultar valores na API gratuita da FIPE e estimar IPVA e data de vencimento.
- **Arquivos para Leitura:**
  - `backend/package.json`
- **Arquivos a Criar/Modificar:**
  - `backend/src/services/fipe.service.ts`
- **Regras de Implementação:**
  - Consumir API pública da FIPE (ex: Parallelum FIPE API) ou permitir fallback manual caso o código FIPE não seja informado.
  - Criar método `calcularProximoIpva(valorVenal: number, finalPlaca: string)`:
    - Calcular valor aproximado do IPVA (ex: alíquota padrão de 4% sobre o valor venal + taxa estimada de licenciamento, ou destacar se é isento por ser veículo oficial de setor público, exibindo o valor estimado para controle orçamentário).
    - Estimar a próxima data de vencimento baseada no último dígito da `placa`.

### Task 3.3: Módulo de Veículos
- **Objetivo:** Implementar CRUD de veículos com vínculo a motorista e cálculo automático de IPVA.
- **Arquivos para Leitura:**
  - `backend/prisma/schema.prisma`
  - `backend/src/services/fipe.service.ts`
  - `backend/src/modules/motoristas/motorista.repository.ts`
- **Arquivos a Criar/Modificar:**
  - `backend/src/modules/veiculos/veiculo.schema.ts`
  - `backend/src/modules/veiculos/veiculo.repository.ts`
  - `backend/src/modules/veiculos/veiculo.service.ts`
  - `backend/src/modules/veiculos/veiculo.controller.ts`
  - `backend/src/modules/veiculos/veiculo.routes.ts`
  - `backend/src/app.ts` (registrar rotas)
- **Regras de Implementação:**
  - Ao cadastrar/editar, validar se o `responsavel_id` (Motorista) existe e está `ativo === true`.
  - Acionar `fipe.service.ts` para preencher/atualizar `data_ipva` e `valor_ipva`.
  - Impedir edição (`PUT`) se `veiculo.ativo === false`.
  - Rota de baixa (`PATCH /veiculos/:id/baixa`) marca `ativo = false`.

### Task 3.4: Fluxo de Solicitação e Revogação de Status Inativo
- **Objetivo:** Permitir que usuários peçam a reativação de cadastros inativos e que apenas `ADMIN` (ou `MASTER`) aprove/revogue a inatividade.
- **Arquivos para Leitura:**
  - `backend/prisma/schema.prisma`
  - `backend/src/modules/usuarios/usuario.repository.ts`
  - `backend/src/modules/motoristas/motorista.repository.ts`
  - `backend/src/modules/veiculos/veiculo.repository.ts`
- **Arquivos a Criar/Modificar:**
  - `backend/src/modules/reativacoes/reativacao.schema.ts`
  - `backend/src/modules/reativacoes/reativacao.service.ts`
  - `backend/src/modules/reativacoes/reativacao.controller.ts`
  - `backend/src/modules/reativacoes/reativacao.routes.ts`
  - `backend/src/app.ts` (registrar rotas)
- **Regras de Implementação:**
  - `POST /reativacoes`: Qualquer usuário autenticado pode criar um pedido informando `tipo_entidade` (`USUARIO`, `MOTORISTA`, `VEICULO`), `entidade_id` e `motivo`.
  - `PATCH /reativacoes/:id/aprovar` (Restrito a `ADMIN` e `MASTER`): Altera o status da solicitação para `APROVADA` e muda `ativo = true` na tabela correspondente (`Usuario`, `Motorista` ou `Veiculo`).
  - Rota direta `PATCH /:entidade/:id/reativar` (Restrito a `ADMIN` e `MASTER`) para revogação direta pelo administrador.

---
