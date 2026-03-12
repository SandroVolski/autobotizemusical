
-- Create storage bucket for PIX QR Code images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pix-qrcodes', 'pix-qrcodes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload pix qrcodes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pix-qrcodes');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update pix qrcodes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pix-qrcodes');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete pix qrcodes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pix-qrcodes');

-- Allow public read access
CREATE POLICY "Public can view pix qrcodes"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'pix-qrcodes');
