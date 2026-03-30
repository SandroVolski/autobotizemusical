
-- Create holidays table
CREATE TABLE public.feriados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  titulo TEXT NOT NULL,
  motivo TEXT,
  dia_todo BOOLEAN NOT NULL DEFAULT true,
  horario_inicio TIME,
  horario_fim TIME,
  notificar_whatsapp BOOLEAN NOT NULL DEFAULT false,
  notificacao_enviada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;

-- Admin and Secretaria can manage
CREATE POLICY "Admin and Secretaria can manage feriados"
  ON public.feriados FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

-- All authenticated can view
CREATE POLICY "Authenticated users can view feriados"
  ON public.feriados FOR SELECT
  TO authenticated
  USING (true);
