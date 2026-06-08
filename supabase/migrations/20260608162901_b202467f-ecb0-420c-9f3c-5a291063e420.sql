
-- Scope materiais bucket reads to owner folder (tenant isolation)
DROP POLICY IF EXISTS "Authenticated users can view materials" ON storage.objects;

CREATE POLICY "Users can view own materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'materiais'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Restrict realtime to user's own notifications channel only
DROP POLICY IF EXISTS "Authenticated users can receive non-notification messages" ON realtime.messages;
DROP POLICY IF EXISTS "Users can receive their own notifications" ON realtime.messages;

CREATE POLICY "Users can receive their own notifications"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications-' || auth.uid()::text
);
