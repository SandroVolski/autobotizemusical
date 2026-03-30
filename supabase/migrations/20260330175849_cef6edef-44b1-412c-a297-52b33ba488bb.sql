-- Fix 1: Remove overly permissive professor SELECT on professores (exposes salaries)
DROP POLICY IF EXISTS "Professor can view professores" ON public.professores;

-- Fix 2: Restrict alunos-fotos storage policies to admin/secretaria/professor
DROP POLICY IF EXISTS "Authenticated users can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view student photos" ON storage.objects;

CREATE POLICY "Authorized roles can upload student photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'alunos-fotos' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
  );

CREATE POLICY "Authorized roles can view student photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'alunos-fotos' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
  );

CREATE POLICY "Authorized roles can update student photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'alunos-fotos' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role))
  );

CREATE POLICY "Admin and Secretaria can delete student photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'alunos-fotos' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role))
  );