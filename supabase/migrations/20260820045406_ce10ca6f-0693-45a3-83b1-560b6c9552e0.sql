DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['avaliacoes','presencas','materiais','planos_aula','historico_status_aluno','turma_alunos','reposicoes']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Owner can view ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Owner can write ' || t, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Owner can view historico_status" ON public.historico_status_aluno;
DROP POLICY IF EXISTS "Owner can write historico_status" ON public.historico_status_aluno;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['avaliacoes','presencas','materiais','planos_aula','historico_status_aluno','turma_alunos','reposicoes']
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Staff owner can view %1$s" ON public.%1$I
      FOR SELECT TO authenticated
      USING (owner_user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'secretaria') OR public.has_role(auth.uid(),'professor')));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Staff owner can write %1$s" ON public.%1$I
      FOR ALL TO authenticated
      USING (owner_user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'secretaria') OR public.has_role(auth.uid(),'professor')))
      WITH CHECK (owner_user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'secretaria') OR public.has_role(auth.uid(),'professor')));
    $f$, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Owner can view turmas" ON public.turmas;
CREATE POLICY "Staff owner can view turmas" ON public.turmas
FOR SELECT TO authenticated
USING (owner_user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'secretaria') OR public.has_role(auth.uid(),'professor')));