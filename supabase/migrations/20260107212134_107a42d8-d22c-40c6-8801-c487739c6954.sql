-- Fix: Restrict materiais storage bucket operations to authorized roles only
-- Drop the overly permissive policies that allow any authenticated user to upload/update/delete

DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete materials" ON storage.objects;

-- Create role-based INSERT policy (only admin, secretaria, professor can upload)
CREATE POLICY "Authorized roles can upload materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'materiais' AND 
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR 
      public.has_role(auth.uid(), 'secretaria'::public.app_role) OR
      public.has_role(auth.uid(), 'professor'::public.app_role)
    )
  );

-- Create UPDATE policy (only file owners can update their own files)
CREATE POLICY "Users can update own materials"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'materiais' AND 
    owner = auth.uid()
  );

-- Create DELETE policy (only admin and secretaria can delete)
CREATE POLICY "Admin and Secretaria can delete materials"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'materiais' AND
    (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR 
      public.has_role(auth.uid(), 'secretaria'::public.app_role)
    )
  );