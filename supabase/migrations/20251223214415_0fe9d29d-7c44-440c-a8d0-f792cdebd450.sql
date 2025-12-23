-- Fix signup failure: 'usuario' violates profiles_tipo_check (allowed: admin, professor, recepcionista, aluno)

-- 1) Set safe default that matches the existing CHECK constraint
ALTER TABLE public.profiles
  ALTER COLUMN tipo SET DEFAULT 'aluno';

-- 2) Backfill any invalid legacy values created by the previous migration
UPDATE public.profiles
SET tipo = 'aluno'
WHERE tipo IS NULL
   OR tipo NOT IN ('admin', 'professor', 'recepcionista', 'aluno');

-- 3) Make the auth trigger function resilient: if 'tipo' is missing or invalid, fall back to 'aluno'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tipo text;
BEGIN
  v_tipo := COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'aluno');

  IF v_tipo NOT IN ('admin', 'professor', 'recepcionista', 'aluno') THEN
    v_tipo := 'aluno';
  END IF;

  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    v_tipo
  )
  ON CONFLICT (id) DO UPDATE
    SET nome = EXCLUDED.nome,
        email = EXCLUDED.email,
        tipo = EXCLUDED.tipo,
        updated_at = now();

  RETURN NEW;
END;
$$;