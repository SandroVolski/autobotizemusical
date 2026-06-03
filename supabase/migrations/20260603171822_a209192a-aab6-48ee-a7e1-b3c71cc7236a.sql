-- 1) Apelido (uso interno) no aluno
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS apelido text;

-- 2) WhatsApp instances por tenant
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  instance_name text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'desconectado',
  conectado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;

ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner admin/secretaria can view wa instance"
  ON public.whatsapp_instances FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'secretaria'::app_role)));

CREATE POLICY "Owner admin/secretaria can insert wa instance"
  ON public.whatsapp_instances FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'secretaria'::app_role)));

CREATE POLICY "Owner admin/secretaria can update wa instance"
  ON public.whatsapp_instances FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'secretaria'::app_role)))
  WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'secretaria'::app_role)));

CREATE POLICY "Owner admin/secretaria can delete wa instance"
  ON public.whatsapp_instances FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'secretaria'::app_role)));

CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();