-- Ensure new users can be inserted into profiles without failing on NOT NULL tipo
ALTER TABLE public.profiles
  ALTER COLUMN tipo SET DEFAULT 'usuario';

-- Backfill just in case there are any legacy rows
UPDATE public.profiles
SET tipo = 'usuario'
WHERE tipo IS NULL;

-- Keep the auth hook / trigger function from failing during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'usuario')
  )
  ON CONFLICT (id) DO UPDATE
    SET nome = EXCLUDED.nome,
        email = EXCLUDED.email,
        tipo = EXCLUDED.tipo,
        updated_at = now();

  RETURN NEW;
END;
$$;