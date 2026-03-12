
-- Restrict SELECT policies on tables that currently have USING(true)

-- turma_alunos
DROP POLICY IF EXISTS "Authenticated users can view turma_alunos" ON public.turma_alunos;
CREATE POLICY "Authorized roles can view turma_alunos" ON public.turma_alunos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- confirmacao_aula_config
DROP POLICY IF EXISTS "Authenticated users can view confirmacao_config" ON public.confirmacao_aula_config;
CREATE POLICY "Authorized roles can view confirmacao_config" ON public.confirmacao_aula_config FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

-- confirmacao_aula_mensagens
DROP POLICY IF EXISTS "Authenticated users can view confirmacao_mensagens" ON public.confirmacao_aula_mensagens;
CREATE POLICY "Authorized roles can view confirmacao_mensagens" ON public.confirmacao_aula_mensagens FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

-- turmas
DROP POLICY IF EXISTS "Authenticated users can view turmas" ON public.turmas;
CREATE POLICY "Authorized roles can view turmas" ON public.turmas FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- reposicoes
DROP POLICY IF EXISTS "Authenticated users can view reposicoes" ON public.reposicoes;
CREATE POLICY "Authorized roles can view reposicoes" ON public.reposicoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- planos_aula
DROP POLICY IF EXISTS "Authenticated users can view planos_aula" ON public.planos_aula;
CREATE POLICY "Authorized roles can view planos_aula" ON public.planos_aula FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- produtos
DROP POLICY IF EXISTS "Authenticated users can view produtos" ON public.produtos;
CREATE POLICY "Authorized roles can view produtos" ON public.produtos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

-- instrumentos
DROP POLICY IF EXISTS "Authenticated users can view instrumentos" ON public.instrumentos;
CREATE POLICY "Authorized roles can view instrumentos" ON public.instrumentos FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- historico_status_aluno
DROP POLICY IF EXISTS "Authenticated users can view historico_status_aluno" ON public.historico_status_aluno;
CREATE POLICY "Authorized roles can view historico_status_aluno" ON public.historico_status_aluno FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));
