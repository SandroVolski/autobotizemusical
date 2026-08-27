CREATE TABLE public.onboarding_progresso (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid(),
  passo_atual integer NOT NULL DEFAULT 1,
  concluido boolean NOT NULL DEFAULT false,
  dados_exemplo_criados boolean NOT NULL DEFAULT false,
  rascunho jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_progresso TO authenticated;
GRANT ALL ON public.onboarding_progresso TO service_role;

ALTER TABLE public.onboarding_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding" ON public.onboarding_progresso
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own onboarding" ON public.onboarding_progresso
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own onboarding" ON public.onboarding_progresso
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own onboarding" ON public.onboarding_progresso
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_onboarding_progresso_updated_at
  BEFORE UPDATE ON public.onboarding_progresso
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();