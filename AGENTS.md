# Plano de Execução para Agentes (Agentic Programming) - Controle de Frotas
## Diretrizes para o Agente de IA
0. Github: Toda implementação deve ser feita numa branch nova, com nome descritivo. Nao crie mais de uma funcionalidade por branch no github. Commits devem ser granulares e bem documentados, em portugues do brasil. 
   - Os arquivos listados em .gitignore estão fora de seu alcance, se precisar abrir algum deles, informe ao usuario o arquivo e o motivo do pedido;
   - Se o pedido for negado, informe no que isso vai interferir, complete as tarefas que não foram afetadas e cite isso no log final;
1. **Isolamento de Contexto:** Para cada Task, leia **APENAS** os arquivos listados em `Arquivos para Leitura`. Não faça varreduras desnecessárias no diretório (especialmente separar `backend/` e `frontend/`).
2. **Log de atividade:** Para cada Task, ao finalizar, faça o registro da atividade encerrada no arquivo LOGS.md, contendo tarefa, data, o que foi feito arquivos criados e arquivos modificados. Siga as diretrizes padrão de registro para que futuros agentes possam ter o contexto do que foi feito somente olhando para o arquivo LOGS.md
3. **Arquitetura Backend:** Seguir estritamente o padrão em camadas (`Controller` -> `Service` -> `Repository`), utilizando **Node.js, TypeScript, Fastify (ou Express), Prisma ORM (PostgreSQL) e Zod**.
4. **Regras de Ouro do Negócio:**
   - **Soft Delete:** Nenhum registro (`Usuario`, `Motorista`, `Veiculo`) é deletado fisicamente (`DELETE`). A baixa altera `ativo = false`.
   - **Bloqueio de Inativos:** Registros com `ativo = false` **não podem ser editados**.
   - **Hierarquia:** `MASTER` (inserido via seed/banco) cria `ADMIN` e `GERAL`. `ADMIN` cria apenas `GERAL` e aprova reativações.
---