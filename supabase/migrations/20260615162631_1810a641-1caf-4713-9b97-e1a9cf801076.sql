-- Tenant-scope alunos-fotos storage policies via alunos.owner_user_id
DROP POLICY IF EXISTS "Authorized roles can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized roles can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authorized roles can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin and Secretaria can delete student photos" ON storage.objects;

CREATE POLICY "Authorized roles can view student photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'alunos-fotos'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id::text = (storage.foldername(name))[1]
      AND a.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Authorized roles can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'alunos-fotos'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id::text = (storage.foldername(name))[1]
      AND a.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Authorized roles can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'alunos-fotos'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id::text = (storage.foldername(name))[1]
      AND a.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Admin and Secretaria can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'alunos-fotos'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.alunos a
    WHERE a.id::text = (storage.foldername(name))[1]
      AND a.owner_user_id = auth.uid()
  )
);