
-- 1) configuracoes_escola: restrict to admin/secretaria
DROP POLICY IF EXISTS "Users can view their own configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Users can insert their own configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Users can update their own configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Users can delete their own configuracoes" ON public.configuracoes_escola;

CREATE POLICY "Admin/secretaria can view configuracoes"
ON public.configuracoes_escola FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role)));

CREATE POLICY "Admin/secretaria can insert configuracoes"
ON public.configuracoes_escola FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role)));

CREATE POLICY "Admin/secretaria can update configuracoes"
ON public.configuracoes_escola FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role)))
WITH CHECK (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role)));

CREATE POLICY "Admin/secretaria can delete configuracoes"
ON public.configuracoes_escola FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role)));

-- 2) pix-qrcodes storage: enforce per-user folder
-- Move existing object into owner folder
UPDATE storage.objects
SET name = owner_id::text || '/' || name
WHERE bucket_id = 'pix-qrcodes'
  AND owner_id IS NOT NULL
  AND (storage.foldername(name))[1] IS DISTINCT FROM owner_id::text;

DROP POLICY IF EXISTS "Authenticated users can view pix qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pix qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pix qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete pix qrcodes" ON storage.objects;

CREATE POLICY "Users view own pix qrcodes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pix-qrcodes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own pix qrcodes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pix-qrcodes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own pix qrcodes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pix-qrcodes' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'pix-qrcodes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own pix qrcodes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pix-qrcodes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3) user_roles: prevent admin self/peer-escalation
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Admins can view all roles (needed for user management UI)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can assign/modify non-admin roles only. Admin role can only be granted by service_role.
CREATE POLICY "Admins can insert non-admin roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND role <> 'admin'::app_role);

CREATE POLICY "Admins can update non-admin roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND role <> 'admin'::app_role)
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND role <> 'admin'::app_role);

CREATE POLICY "Admins can delete non-admin roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND role <> 'admin'::app_role);

-- 4) realtime.messages: restrict broadcast/presence subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny realtime broadcasts" ON realtime.messages;
-- No permissive policy means authenticated users cannot read/write realtime.messages directly.
-- Postgres changes (used by useRealtimeNotifications) flow through replication and remain governed by table RLS on public.notificacoes.
