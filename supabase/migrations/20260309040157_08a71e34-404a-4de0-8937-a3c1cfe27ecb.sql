
-- Add foto_url column to alunos table
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS foto_url text;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('alunos-fotos', 'alunos-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the bucket
CREATE POLICY "Authenticated users can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'alunos-fotos');

CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'alunos-fotos');

CREATE POLICY "Authenticated users can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'alunos-fotos');

CREATE POLICY "Authenticated users can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'alunos-fotos');
