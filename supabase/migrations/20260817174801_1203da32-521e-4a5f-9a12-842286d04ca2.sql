ALTER TABLE public.matriculas
  ADD COLUMN IF NOT EXISTS desconto_tipo text,
  ADD COLUMN IF NOT EXISTS desconto_valor numeric;