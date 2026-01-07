-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('materiais', 'materiais', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for viewing materials (public access)
CREATE POLICY "Anyone can view materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'materiais');

-- Create policy for authenticated users to upload materials
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materiais' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to update their materials
CREATE POLICY "Authenticated users can update materials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'materiais' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to delete materials
CREATE POLICY "Authenticated users can delete materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'materiais' AND auth.role() = 'authenticated');