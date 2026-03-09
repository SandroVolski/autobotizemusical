
CREATE TABLE public.historico_status_aluno (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  data_mudanca TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.historico_status_aluno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and Secretaria can manage historico_status_aluno"
  ON public.historico_status_aluno FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));

CREATE POLICY "Authenticated users can view historico_status_aluno"
  ON public.historico_status_aluno FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professor can insert historico_status_aluno"
  ON public.historico_status_aluno FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'professor'::app_role));
