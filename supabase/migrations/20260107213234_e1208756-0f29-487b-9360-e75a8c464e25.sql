-- Add public read access policy specifically for school logo files
-- This allows logos to be publicly accessible while keeping other materials private

CREATE POLICY "Public can view school logo"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'materiais' AND 
    name LIKE 'escola/logo.%'
  );