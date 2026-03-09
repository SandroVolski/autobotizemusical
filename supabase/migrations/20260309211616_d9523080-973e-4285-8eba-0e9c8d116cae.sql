
-- Table for per-student WhatsApp confirmation settings
CREATE TABLE public.confirmacao_aula_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  habilitado boolean NOT NULL DEFAULT true,
  telefone_override text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(aluno_id)
);

-- Table for message logs
CREATE TABLE public.confirmacao_aula_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  aula_id uuid REFERENCES public.aulas(id) ON DELETE SET NULL,
  telefone text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  resposta_aluno text,
  data_aula timestamp with time zone NOT NULL,
  enviado_em timestamp with time zone,
  respondido_em timestamp with time zone,
  erro text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.confirmacao_aula_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmacao_aula_mensagens ENABLE ROW LEVEL SECURITY;

-- RLS policies for config
CREATE POLICY "Admin and Secretaria can manage confirmacao_config"
  ON public.confirmacao_aula_config FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

CREATE POLICY "Authenticated users can view confirmacao_config"
  ON public.confirmacao_aula_config FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for messages
CREATE POLICY "Admin and Secretaria can manage confirmacao_mensagens"
  ON public.confirmacao_aula_mensagens FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

CREATE POLICY "Authenticated users can view confirmacao_mensagens"
  ON public.confirmacao_aula_mensagens FOR SELECT
  TO authenticated
  USING (true);

-- Updated_at trigger for config
CREATE TRIGGER update_confirmacao_config_updated_at
  BEFORE UPDATE ON public.confirmacao_aula_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
