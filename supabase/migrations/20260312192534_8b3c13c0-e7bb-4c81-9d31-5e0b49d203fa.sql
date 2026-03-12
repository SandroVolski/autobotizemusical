
-- Fix 1: Make pix-qrcodes bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pix-qrcodes';

-- Drop existing public read policy
DROP POLICY IF EXISTS "Public can view pix qrcodes" ON storage.objects;

-- Add authenticated-only read policy
CREATE POLICY "Authenticated users can view pix qrcodes"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pix-qrcodes');

-- Fix 2: Fix materiais SELECT policy - drop public-role one and recreate for authenticated
DROP POLICY IF EXISTS "Authenticated users can view materiais" ON public.materiais;

CREATE POLICY "Authenticated users can view materiais"
  ON public.materiais FOR SELECT TO authenticated
  USING (true);
