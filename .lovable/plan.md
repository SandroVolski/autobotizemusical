## Escopo

Sete frentes de correção, agrupadas por área.

### 1. WhatsApp multi-tenant (instância por escola)

Hoje existe uma só instância Evolution (`EVOLUTION_INSTANCE` em env). Vou substituir por uma instância por usuário/escola.

- Nova tabela `whatsapp_instances` (user_id, instance_name, status, conectado_em).
- `whatsapp-connection` passa a usar `instance_name = wa_<user_id_curto>` derivado do usuário logado. Cria/conecta/deleta a inst do próprio tenant. Mantém role check admin/secretaria.
- `send-class-confirmations`, `whatsapp-webhook`, automações de cobrança e qualquer outro send: usam a inst do `owner_user_id` do dado em questão. Se a escola não tem instância conectada, pula com aviso (não usa fallback global).
- Variável `EVOLUTION_INSTANCE` deixa de ser usada para envio multi-tenant; permanece só como fallback em jobs antigos.

### 2. Isolamento de configurações por conta

Auditar leitura/escrita de `configuracoes_escola`, `confirmacao_aula_config`, `confirmacao_aula_mensagens`, `whatsapp_instances` em todos os hooks/edge functions e garantir `eq('user_id'/'owner_user_id', auth.uid())` em toda query. RLS já existe mas há lugares que leem `.limit(1).maybeSingle()` sem filtro — vou corrigir.

### 3. Cobrança envia para o dono, não para o cliente

Bug confirmado: no fluxo de cobrança o telefone usado é do remetente. Vou ajustar para sempre usar `aluno.responsavel_telefone || aluno.telefone` (prioridade do responsável conforme memória) e nunca o telefone do `configuracoes_escola`.

### 4. Confirmações: "0 mensagens enviadas" em envio manual

A função `send-class-confirmations` em modo `forceManual` exige aula com `status=agendada` E (recorrente do dia de amanhã) OU (one-off entre hoje e +24h). Em manual o filtro de data ainda é aplicado em alguns ramos. Vou:
- Em manual com `aluno_id`: ignorar filtro de dia/data, pegar próxima aula futura do aluno (ou qualquer aula agendada).
- Retornar `{sent, errors, skipped, reason}` com motivos claros por aluno.

### 5. Tela de Turmas sem botões de ação

Adicionar em `src/pages/Turmas.tsx` / card de turma:
- Editar (dialog reaproveitando o de criação).
- Excluir turma (com confirmação; cascateia `turma_alunos`).
- Desvincular aluno individual da turma (já existe hook `useRemoveAlunoTurma`, falta UI).
- Hooks novos: `useUpdateTurma`, `useDeleteTurma`.

### 6. Campo "Apelido" no cadastro de aluno

- Migration: `ALTER TABLE alunos ADD COLUMN apelido text`.
- Form de cadastro/edição: input opcional, label "Apelido (uso interno)".
- Listagens internas (Alunos, Turmas, Agenda, Cobranças) exibem `apelido || nome`.
- WhatsApp **continua usando `nome`** — apelido nunca vai em mensagem.

### 7. Cadastro de aluno: escolher turma OU individual com dia/horário

No `EnrollmentDialog`/form do aluno, adicionar bloco "Modalidade de aula":
- **Em turma**: select com turmas ativas filtradas pelo curso → cria `turma_alunos`.
- **Individual**: campos dia da semana + horário + duração + professor (opcional) → cria 1 registro em `aulas` com `recorrente=true`, `dia_semana`, `horario`, `aluno_id`, `owner_user_id=auth.uid()`. Aparece automaticamente na agenda (a agenda já lê `aulas` recorrentes).
- Ao excluir/desativar matrícula, cancelar a aula recorrente correspondente.

## Detalhes técnicos

**Migrations (1 só):**
```sql
ALTER TABLE alunos ADD COLUMN apelido text;
CREATE TABLE whatsapp_instances (
  id uuid PK default gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  instance_name text NOT NULL UNIQUE,
  status text DEFAULT 'desconectado',
  conectado_em timestamptz,
  created_at, updated_at
);
-- GRANTs + RLS owner=auth.uid() para admin/secretaria
```

**Edge functions tocadas:** `whatsapp-connection`, `send-class-confirmations`, `whatsapp-webhook` (mapear instance→tenant via tabela), e qualquer job de cobrança automática.

**Frontend tocado:**
- `src/pages/Alunos.tsx` + form (apelido, bloco modalidade)
- `src/pages/Turmas.tsx` (botões editar/excluir/desvincular)
- `src/hooks/useTurmas.ts` (update, delete)
- `src/hooks/useAlunos.ts` (criar aula recorrente junto)
- Componentes de exibição de nome → `apelido || nome` (Alunos, Turmas, Agenda card, Cobranças list)

**Fora de escopo desta entrega:**
- Migrar dados históricos da instância única para instâncias por tenant (ficará vazio até cada escola reconectar).
- Webhook que não consegue identificar o tenant é descartado.

## Ordem de execução

1. Migration (apelido + whatsapp_instances).
2. Backend: edge functions multi-tenant.
3. Frontend turmas (botões).
4. Frontend alunos (apelido + modalidade).
5. Fixes cobrança + confirmações manual.
6. Auditoria final de isolamento de configurações.