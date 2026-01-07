
-- Criar enum para roles de usuário (segurança)
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'aluno', 'secretaria');

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de Controle de Presença
CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'presente' CHECK (status IN ('presente', 'falta', 'justificada')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (aula_id, aluno_id, data)
);

ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view presencas"
  ON public.presencas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert presencas"
  ON public.presencas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update presencas"
  ON public.presencas FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete presencas"
  ON public.presencas FOR DELETE
  USING (true);

CREATE TRIGGER update_presencas_updated_at
  BEFORE UPDATE ON public.presencas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Matrículas
CREATE TABLE public.matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'trancado', 'cancelado', 'concluido')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (aluno_id, curso_id)
);

ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view matriculas"
  ON public.matriculas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert matriculas"
  ON public.matriculas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matriculas"
  ON public.matriculas FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete matriculas"
  ON public.matriculas FOR DELETE
  USING (true);

CREATE TRIGGER update_matriculas_updated_at
  BEFORE UPDATE ON public.matriculas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Configurações da Escola
CREATE TABLE public.configuracoes_escola (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT 'Minha Escola de Música',
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  logo_url TEXT,
  descricao TEXT,
  horario_funcionamento JSONB DEFAULT '{"segunda": {"inicio": "08:00", "fim": "20:00"}, "terca": {"inicio": "08:00", "fim": "20:00"}, "quarta": {"inicio": "08:00", "fim": "20:00"}, "quinta": {"inicio": "08:00", "fim": "20:00"}, "sexta": {"inicio": "08:00", "fim": "20:00"}, "sabado": {"inicio": "08:00", "fim": "14:00"}}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.configuracoes_escola ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view configuracoes"
  ON public.configuracoes_escola FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update configuracoes"
  ON public.configuracoes_escola FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can insert configuracoes"
  ON public.configuracoes_escola FOR INSERT
  WITH CHECK (true);

CREATE TRIGGER update_configuracoes_escola_updated_at
  BEFORE UPDATE ON public.configuracoes_escola
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão
INSERT INTO public.configuracoes_escola (nome) VALUES ('Minha Escola de Música');

-- Tabela de Materiais Didáticos
CREATE TABLE public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('pdf', 'audio', 'video', 'partitura', 'outro')),
  url TEXT,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  plano_aula_id UUID REFERENCES public.planos_aula(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view materiais"
  ON public.materiais FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert materiais"
  ON public.materiais FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update materiais"
  ON public.materiais FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete materiais"
  ON public.materiais FOR DELETE
  USING (true);

CREATE TRIGGER update_materiais_updated_at
  BEFORE UPDATE ON public.materiais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Avaliações
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  nota DECIMAL(3,1) CHECK (nota >= 0 AND nota <= 10),
  feedback TEXT,
  aspectos JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view avaliacoes"
  ON public.avaliacoes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert avaliacoes"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update avaliacoes"
  ON public.avaliacoes FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete avaliacoes"
  ON public.avaliacoes FOR DELETE
  USING (true);

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
