
-- Tighten materiais bucket policies to require folder ownership
DROP POLICY IF EXISTS "Admin and Secretaria can delete materials" ON storage.objects;
DROP POLICY IF EXISTS "Authorized roles can upload materials" ON storage.objects;

CREATE POLICY "Admin and Secretaria can delete materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'materiais'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role))
);

CREATE POLICY "Authorized roles can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'materiais'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role) OR has_role(auth.uid(), 'professor'::app_role))
);

-- Restrict realtime messages to only the user's own notification channel
DROP POLICY IF EXISTS "Users can read own notification channel" ON realtime.messages;
