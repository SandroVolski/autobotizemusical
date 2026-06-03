
-- 1. Realtime authorization: only allow users to subscribe to their own notification channel
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notification channel" ON realtime.messages;
CREATE POLICY "Users can read own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = concat('notifications-', auth.uid()::text)
  OR realtime.topic() NOT LIKE 'notifications-%'
);

-- 2. user_roles: restrict management to service_role only (admin user creation uses service role via edge function)
DROP POLICY IF EXISTS "Admins can insert non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update non-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete non-admin roles" ON public.user_roles;

CREATE POLICY "Only service role can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Only service role can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Only service role can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- 3. Storage: replace owner-column policy with folder-path scoping
DROP POLICY IF EXISTS "Users can update own materials" ON storage.objects;
CREATE POLICY "Users can update own materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materiais'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'materiais'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Revoke EXECUTE on internal SECURITY DEFINER functions from authenticated/public/anon
-- Keep has_role accessible since RLS policies depend on it
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
