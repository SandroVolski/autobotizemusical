
-- 1. Add owner_user_id columns
ALTER TABLE public.alunos ADD COLUMN owner_user_id uuid;
ALTER TABLE public.pagamentos ADD COLUMN owner_user_id uuid;

-- 2. Backfill existing rows to Sandro Eduardo (the other admin)
UPDATE public.alunos SET owner_user_id = '39b71a73-a25c-4d43-bf1e-a697e3f97e37' WHERE owner_user_id IS NULL;
UPDATE public.pagamentos SET owner_user_id = '39b71a73-a25c-4d43-bf1e-a697e3f97e37' WHERE owner_user_id IS NULL;

-- 3. Make NOT NULL and default to auth.uid() for future inserts
ALTER TABLE public.alunos ALTER COLUMN owner_user_id SET NOT NULL;
ALTER TABLE public.alunos ALTER COLUMN owner_user_id SET DEFAULT auth.uid();
ALTER TABLE public.pagamentos ALTER COLUMN owner_user_id SET NOT NULL;
ALTER TABLE public.pagamentos ALTER COLUMN owner_user_id SET DEFAULT auth.uid();

-- 4. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_alunos_owner ON public.alunos(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_owner ON public.pagamentos(owner_user_id);

-- 5. Drop old policies on alunos
DROP POLICY IF EXISTS "Admin and Secretaria can manage alunos" ON public.alunos;
DROP POLICY IF EXISTS "Admin and Secretaria can view alunos" ON public.alunos;
DROP POLICY IF EXISTS "Professor can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Professor can update alunos" ON public.alunos;
DROP POLICY IF EXISTS "Professor can view alunos" ON public.alunos;

-- 6. New owner-scoped policies on alunos
CREATE POLICY "Owner admin/secretaria can view own alunos"
  ON public.alunos FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role)
         OR has_role(auth.uid(), 'professor'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can insert alunos"
  ON public.alunos FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role)
         OR has_role(auth.uid(), 'professor'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can update alunos"
  ON public.alunos FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role)
         OR has_role(auth.uid(), 'professor'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can delete alunos"
  ON public.alunos FOR DELETE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role))
  );

-- 7. Drop old policies on pagamentos
DROP POLICY IF EXISTS "Admin and Secretaria can manage pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Admin and Secretaria can view pagamentos" ON public.pagamentos;

-- 8. New owner-scoped policies on pagamentos
CREATE POLICY "Owner admin/secretaria can view own pagamentos"
  ON public.pagamentos FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can insert pagamentos"
  ON public.pagamentos FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can update pagamentos"
  ON public.pagamentos FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role))
  );

CREATE POLICY "Owner admin/secretaria can delete pagamentos"
  ON public.pagamentos FOR DELETE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role)
         OR has_role(auth.uid(), 'secretaria'::app_role))
  );
