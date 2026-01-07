-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  avatar_url TEXT,
  cargo TEXT DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create alunos table
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  responsavel_nome TEXT,
  responsavel_telefone TEXT,
  endereco TEXT,
  nivel TEXT DEFAULT 'iniciante',
  objetivo TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'ativo',
  data_matricula DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alunos" ON public.alunos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert alunos" ON public.alunos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update alunos" ON public.alunos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete alunos" ON public.alunos
  FOR DELETE TO authenticated USING (true);

-- Create professores table
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  especialidade TEXT,
  instrumentos TEXT[],
  bio TEXT,
  status TEXT DEFAULT 'ativo',
  data_contratacao DATE DEFAULT CURRENT_DATE,
  salario NUMERIC(10,2),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view professores" ON public.professores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert professores" ON public.professores
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update professores" ON public.professores
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete professores" ON public.professores
  FOR DELETE TO authenticated USING (true);

-- Create cursos table
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  instrumento TEXT,
  nivel TEXT DEFAULT 'iniciante',
  descricao TEXT,
  duracao TEXT,
  carga_horaria TEXT,
  valor_mensal NUMERIC(10,2),
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cursos" ON public.cursos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cursos" ON public.cursos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cursos" ON public.cursos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete cursos" ON public.cursos
  FOR DELETE TO authenticated USING (true);

-- Create instrumentos table
CREATE TABLE public.instrumentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  localizacao TEXT,
  valor_patrimonio NUMERIC(10,2),
  status TEXT DEFAULT 'disponivel',
  emprestado_para TEXT,
  data_emprestimo DATE,
  observacoes TEXT,
  data_aquisicao DATE,
  data_manutencao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instrumentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view instrumentos" ON public.instrumentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert instrumentos" ON public.instrumentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update instrumentos" ON public.instrumentos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete instrumentos" ON public.instrumentos
  FOR DELETE TO authenticated USING (true);

-- Create aulas table
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  tipo TEXT DEFAULT 'individual',
  dia_semana INTEGER,
  horario TIME,
  duracao_minutos INTEGER DEFAULT 60,
  sala TEXT,
  data_especifica DATE,
  data_inicio DATE,
  data_fim DATE,
  recorrente BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'agendada',
  observacoes TEXT,
  valor NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view aulas" ON public.aulas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert aulas" ON public.aulas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update aulas" ON public.aulas
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete aulas" ON public.aulas
  FOR DELETE TO authenticated USING (true);

-- Create pagamentos table
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  valor NUMERIC(10,2) NOT NULL,
  tipo TEXT DEFAULT 'mensalidade',
  referencia TEXT,
  data_vencimento DATE,
  data_pagamento DATE,
  metodo_pagamento TEXT,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pagamentos" ON public.pagamentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert pagamentos" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update pagamentos" ON public.pagamentos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete pagamentos" ON public.pagamentos
  FOR DELETE TO authenticated USING (true);

-- Create planos_aula table
CREATE TABLE public.planos_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  instrumento TEXT,
  nivel TEXT,
  duracao TEXT,
  conteudo TEXT,
  objetivos TEXT,
  materiais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view planos_aula" ON public.planos_aula
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert planos_aula" ON public.planos_aula
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update planos_aula" ON public.planos_aula
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete planos_aula" ON public.planos_aula
  FOR DELETE TO authenticated USING (true);

-- Create avisos table
CREATE TABLE public.avisos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  tipo TEXT DEFAULT 'geral',
  prioridade TEXT DEFAULT 'normal',
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view avisos" ON public.avisos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert avisos" ON public.avisos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update avisos" ON public.avisos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete avisos" ON public.avisos
  FOR DELETE TO authenticated USING (true);

-- Create notificacoes table
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT DEFAULT 'info',
  lida BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notificacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notificacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notificacoes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notificacoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instrumentos_updated_at BEFORE UPDATE ON public.instrumentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aulas_updated_at BEFORE UPDATE ON public.aulas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planos_aula_updated_at BEFORE UPDATE ON public.planos_aula FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_avisos_updated_at BEFORE UPDATE ON public.avisos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();