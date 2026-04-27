
-- =========================================================
-- 1) Adicionar owner_user_id em todas as tabelas operacionais
-- =========================================================

ALTER TABLE public.professores              ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.instrumentos             ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.cursos                   ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.turmas                   ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.turma_alunos             ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.matriculas               ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.contratos                ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.aulas                    ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.presencas                ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.reposicoes               ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.avaliacoes               ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.materiais                ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.planos_aula              ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.contas_pagar             ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.vendas                   ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.produtos                 ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.leads                    ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.feriados                 ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.avisos                   ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.confirmacao_aula_config  ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.confirmacao_aula_mensagens ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();
ALTER TABLE public.historico_status_aluno   ADD COLUMN IF NOT EXISTS owner_user_id uuid NOT NULL DEFAULT auth.uid();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_professores_owner ON public.professores(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_instrumentos_owner ON public.instrumentos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_cursos_owner ON public.cursos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_turmas_owner ON public.turmas(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_turma_alunos_owner ON public.turma_alunos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_owner ON public.matriculas(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_contratos_owner ON public.contratos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_aulas_owner ON public.aulas(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_presencas_owner ON public.presencas(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_reposicoes_owner ON public.reposicoes(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_owner ON public.avaliacoes(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_materiais_owner ON public.materiais(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_planos_aula_owner ON public.planos_aula(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_owner ON public.contas_pagar(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_owner ON public.vendas(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_owner ON public.produtos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON public.leads(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_feriados_owner ON public.feriados(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_avisos_owner ON public.avisos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_conf_config_owner ON public.confirmacao_aula_config(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_conf_msgs_owner ON public.confirmacao_aula_mensagens(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_historico_status_owner ON public.historico_status_aluno(owner_user_id);

-- =========================================================
-- 2) Reescrever RLS para isolamento por conta
-- =========================================================

-- Helper macro pattern: drop todas as policies e recriar com owner_user_id = auth.uid()

-- ---------- professores ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage professores" ON public.professores;
DROP POLICY IF EXISTS "Admin and Secretaria can view professores" ON public.professores;
CREATE POLICY "Owner admin/secretaria can view professores" ON public.professores FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner admin/secretaria can insert professores" ON public.professores FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner admin/secretaria can update professores" ON public.professores FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner admin/secretaria can delete professores" ON public.professores FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- instrumentos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage instrumentos" ON public.instrumentos;
DROP POLICY IF EXISTS "Authorized roles can view instrumentos" ON public.instrumentos;
CREATE POLICY "Owner can view instrumentos" ON public.instrumentos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria') OR has_role(auth.uid(),'professor')));
CREATE POLICY "Owner admin/secretaria can write instrumentos" ON public.instrumentos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- cursos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage cursos" ON public.cursos;
DROP POLICY IF EXISTS "Authenticated users can view cursos" ON public.cursos;
DROP POLICY IF EXISTS "Professor can insert cursos" ON public.cursos;
DROP POLICY IF EXISTS "Professor can update cursos" ON public.cursos;
CREATE POLICY "Owner can view cursos" ON public.cursos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner admin/secretaria can write cursos" ON public.cursos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- turmas ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authorized roles can view turmas" ON public.turmas;
DROP POLICY IF EXISTS "Professor can manage own turmas" ON public.turmas;
CREATE POLICY "Owner can view turmas" ON public.turmas FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write turmas" ON public.turmas FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria') OR has_role(auth.uid(),'professor')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria') OR has_role(auth.uid(),'professor')));

-- ---------- turma_alunos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage turma_alunos" ON public.turma_alunos;
DROP POLICY IF EXISTS "Authorized roles can view turma_alunos" ON public.turma_alunos;
DROP POLICY IF EXISTS "Professor can manage turma_alunos" ON public.turma_alunos;
CREATE POLICY "Owner can view turma_alunos" ON public.turma_alunos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write turma_alunos" ON public.turma_alunos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- matriculas ----------
DROP POLICY IF EXISTS "Admin Secretaria Professor can view matriculas" ON public.matriculas;
DROP POLICY IF EXISTS "Admin and Secretaria can manage matriculas" ON public.matriculas;
CREATE POLICY "Owner can view matriculas" ON public.matriculas FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write matriculas" ON public.matriculas FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- contratos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authorized roles can view contratos" ON public.contratos;
CREATE POLICY "Owner can view contratos" ON public.contratos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write contratos" ON public.contratos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- aulas ----------
DROP POLICY IF EXISTS "Admin Secretaria Professor can view aulas" ON public.aulas;
DROP POLICY IF EXISTS "Admin and Secretaria can manage aulas" ON public.aulas;
DROP POLICY IF EXISTS "Professor can manage own aulas" ON public.aulas;
CREATE POLICY "Owner can view aulas" ON public.aulas FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write aulas" ON public.aulas FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria') OR has_role(auth.uid(),'professor')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria') OR has_role(auth.uid(),'professor')));

-- ---------- presencas ----------
DROP POLICY IF EXISTS "Admin Secretaria Professor can view presencas" ON public.presencas;
DROP POLICY IF EXISTS "Admin and Secretaria can manage presencas" ON public.presencas;
DROP POLICY IF EXISTS "Professor can manage presencas" ON public.presencas;
CREATE POLICY "Owner can view presencas" ON public.presencas FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write presencas" ON public.presencas FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- reposicoes ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage reposicoes" ON public.reposicoes;
DROP POLICY IF EXISTS "Authorized roles can view reposicoes" ON public.reposicoes;
DROP POLICY IF EXISTS "Professor can manage reposicoes" ON public.reposicoes;
CREATE POLICY "Owner can view reposicoes" ON public.reposicoes FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write reposicoes" ON public.reposicoes FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- avaliacoes ----------
DROP POLICY IF EXISTS "Admin Secretaria Professor can view avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Admin and Secretaria can manage avaliacoes" ON public.avaliacoes;
DROP POLICY IF EXISTS "Professor can manage avaliacoes" ON public.avaliacoes;
CREATE POLICY "Owner can view avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write avaliacoes" ON public.avaliacoes FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- materiais ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage materiais" ON public.materiais;
DROP POLICY IF EXISTS "Authenticated users can view materiais" ON public.materiais;
DROP POLICY IF EXISTS "Professor can manage materiais" ON public.materiais;
CREATE POLICY "Owner can view materiais" ON public.materiais FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write materiais" ON public.materiais FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- planos_aula ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage planos_aula" ON public.planos_aula;
DROP POLICY IF EXISTS "Authorized roles can view planos_aula" ON public.planos_aula;
DROP POLICY IF EXISTS "Professor can manage planos_aula" ON public.planos_aula;
CREATE POLICY "Owner can view planos_aula" ON public.planos_aula FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write planos_aula" ON public.planos_aula FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- ---------- contas_pagar ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Admin and Secretaria can view contas_pagar" ON public.contas_pagar;
CREATE POLICY "Owner can view contas_pagar" ON public.contas_pagar FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write contas_pagar" ON public.contas_pagar FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- vendas ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage vendas" ON public.vendas;
DROP POLICY IF EXISTS "Admin and Secretaria can view vendas" ON public.vendas;
CREATE POLICY "Owner can view vendas" ON public.vendas FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write vendas" ON public.vendas FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- produtos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage produtos" ON public.produtos;
DROP POLICY IF EXISTS "Authorized roles can view produtos" ON public.produtos;
CREATE POLICY "Owner can view produtos" ON public.produtos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write produtos" ON public.produtos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- leads ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Admin and Secretaria can view leads" ON public.leads;
CREATE POLICY "Owner can view leads" ON public.leads FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write leads" ON public.leads FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- feriados ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage feriados" ON public.feriados;
DROP POLICY IF EXISTS "Authenticated users can view feriados" ON public.feriados;
CREATE POLICY "Owner can view feriados" ON public.feriados FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write feriados" ON public.feriados FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- avisos ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage avisos" ON public.avisos;
DROP POLICY IF EXISTS "Authenticated users can view avisos" ON public.avisos;
CREATE POLICY "Owner can view avisos" ON public.avisos FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write avisos" ON public.avisos FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- confirmacao_aula_config ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage confirmacao_config" ON public.confirmacao_aula_config;
DROP POLICY IF EXISTS "Authorized roles can view confirmacao_config" ON public.confirmacao_aula_config;
CREATE POLICY "Owner can view conf_config" ON public.confirmacao_aula_config FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write conf_config" ON public.confirmacao_aula_config FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- confirmacao_aula_mensagens ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage confirmacao_mensagens" ON public.confirmacao_aula_mensagens;
DROP POLICY IF EXISTS "Authorized roles can view confirmacao_mensagens" ON public.confirmacao_aula_mensagens;
CREATE POLICY "Owner can view conf_msgs" ON public.confirmacao_aula_mensagens FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));
CREATE POLICY "Owner can write conf_msgs" ON public.confirmacao_aula_mensagens FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')))
  WITH CHECK (owner_user_id = auth.uid() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'secretaria')));

-- ---------- historico_status_aluno ----------
DROP POLICY IF EXISTS "Admin and Secretaria can manage historico_status_aluno" ON public.historico_status_aluno;
DROP POLICY IF EXISTS "Authorized roles can view historico_status_aluno" ON public.historico_status_aluno;
DROP POLICY IF EXISTS "Professor can insert historico_status_aluno" ON public.historico_status_aluno;
CREATE POLICY "Owner can view historico_status" ON public.historico_status_aluno FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can write historico_status" ON public.historico_status_aluno FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());
