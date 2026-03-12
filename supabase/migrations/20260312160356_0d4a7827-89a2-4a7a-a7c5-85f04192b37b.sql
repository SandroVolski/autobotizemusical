ALTER TABLE public.configuracoes_escola ADD COLUMN IF NOT EXISTS pix_chave text DEFAULT NULL;
ALTER TABLE public.configuracoes_escola ADD COLUMN IF NOT EXISTS pix_tipo_chave text DEFAULT NULL;
ALTER TABLE public.configuracoes_escola ADD COLUMN IF NOT EXISTS pix_qrcode_url text DEFAULT NULL;