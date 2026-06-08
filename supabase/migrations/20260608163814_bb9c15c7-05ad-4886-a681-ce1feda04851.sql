ALTER TABLE public.configuracoes_escola
ADD COLUMN IF NOT EXISTS usar_responsavel_whatsapp boolean NOT NULL DEFAULT true;