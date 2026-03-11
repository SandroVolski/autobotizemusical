-- Tighten SELECT policies: restrict sensitive tables to appropriate roles

-- alunos: admin, secretaria full access; professor can view students
DROP POLICY IF EXISTS "Authenticated users can view alunos" ON public.alunos;
CREATE POLICY "Admin and Secretaria can view alunos" ON public.alunos
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));
CREATE POLICY "Professor can view alunos" ON public.alunos
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'professor'::app_role));

-- professores: admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view professores" ON public.professores;
CREATE POLICY "Admin and Secretaria can view professores" ON public.professores
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));
CREATE POLICY "Professor can view professores" ON public.professores
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'professor'::app_role));

-- aulas: admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view aulas" ON public.aulas;
CREATE POLICY "Admin Secretaria Professor can view aulas" ON public.aulas
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- avaliacoes: admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view avaliacoes" ON public.avaliacoes;
CREATE POLICY "Admin Secretaria Professor can view avaliacoes" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- presencas: admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view presencas" ON public.presencas;
CREATE POLICY "Admin Secretaria Professor can view presencas" ON public.presencas
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));

-- matriculas: admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view matriculas" ON public.matriculas;
CREATE POLICY "Admin Secretaria Professor can view matriculas" ON public.matriculas
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role));