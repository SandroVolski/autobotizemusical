-- =============================================
-- ESCOLA DE MÚSICA - DATABASE SCHEMA
-- =============================================

-- 1. PROFILES (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'admin' CHECK (tipo IN ('admin', 'professor', 'recepcionista', 'aluno')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'nome', new.email), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ALUNOS (Students)
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  responsavel_nome TEXT,
  responsavel_telefone TEXT,
  endereco TEXT,
  nivel TEXT DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  objetivo TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'trancado')),
  data_matricula DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos are viewable by authenticated users" 
ON public.alunos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Alunos can be inserted by authenticated users" 
ON public.alunos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Alunos can be updated by authenticated users" 
ON public.alunos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Alunos can be deleted by authenticated users" 
ON public.alunos FOR DELETE USING (auth.role() = 'authenticated');

-- 3. PROFESSORES (Teachers)
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  especialidades TEXT[] DEFAULT '{}',
  biografia TEXT,
  valor_hora DECIMAL(10,2),
  disponibilidade JSONB DEFAULT '{}',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'ferias', 'inativo')),
  avaliacao DECIMAL(2,1) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores are viewable by authenticated users" 
ON public.professores FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Professores can be managed by authenticated users" 
ON public.professores FOR ALL USING (auth.role() = 'authenticated');

-- 4. INSTRUMENTOS (Instruments)
CREATE TABLE public.instrumentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  localizacao TEXT,
  valor_patrimonio DECIMAL(10,2),
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'emprestado', 'manutencao', 'baixa')),
  emprestado_para UUID REFERENCES public.alunos(id),
  data_emprestimo DATE,
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instrumentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instrumentos are viewable by authenticated users" 
ON public.instrumentos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Instrumentos can be managed by authenticated users" 
ON public.instrumentos FOR ALL USING (auth.role() = 'authenticated');

-- 5. CURSOS (Courses)
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  instrumento TEXT NOT NULL,
  nivel TEXT DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado', 'todos')),
  descricao TEXT,
  duracao TEXT,
  carga_horaria TEXT,
  valor_mensal DECIMAL(10,2),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'encerrado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cursos are viewable by authenticated users" 
ON public.cursos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Cursos can be managed by authenticated users" 
ON public.cursos FOR ALL USING (auth.role() = 'authenticated');

-- 6. AULAS (Classes - supports recurring and one-off)
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES public.professores(id),
  curso_id UUID REFERENCES public.cursos(id),
  tipo TEXT DEFAULT 'recorrente' CHECK (tipo IN ('recorrente', 'avulsa', 'reposicao')),
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=Dom, 1=Seg, etc.
  horario TIME NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  sala TEXT,
  data_especifica DATE, -- Para aulas avulsas ou reposições
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'concluido', 'reagendado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aulas are viewable by authenticated users" 
ON public.aulas FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Aulas can be managed by authenticated users" 
ON public.aulas FOR ALL USING (auth.role() = 'authenticated');

-- 7. REGISTRO_PRESENCA (Attendance)
CREATE TABLE public.registro_presenca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  status TEXT DEFAULT 'presente' CHECK (status IN ('presente', 'ausente', 'justificado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.registro_presenca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Presenca is viewable by authenticated users" 
ON public.registro_presenca FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Presenca can be managed by authenticated users" 
ON public.registro_presenca FOR ALL USING (auth.role() = 'authenticated');

-- 8. PAGAMENTOS (Payments)
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT DEFAULT 'mensalidade' CHECK (tipo IN ('mensalidade', 'matricula', 'material', 'avulsa', 'outro')),
  referencia TEXT, -- Ex: "Mensalidade Junho/2024"
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'cartao', 'dinheiro', 'boleto', 'transferencia')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pagamentos are viewable by authenticated users" 
ON public.pagamentos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Pagamentos can be managed by authenticated users" 
ON public.pagamentos FOR ALL USING (auth.role() = 'authenticated');

-- 9. PLANOS_AULA (Lesson Plans)
CREATE TABLE public.planos_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  instrumento TEXT NOT NULL,
  nivel TEXT DEFAULT 'iniciante' CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  duracao TEXT,
  conteudo TEXT,
  objetivos TEXT,
  materiais TEXT,
  professor_id UUID REFERENCES public.professores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planos are viewable by authenticated users" 
ON public.planos_aula FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Planos can be managed by authenticated users" 
ON public.planos_aula FOR ALL USING (auth.role() = 'authenticated');

-- 10. AVISOS (Notices)
CREATE TABLE public.avisos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  destinatarios TEXT DEFAULT 'todos' CHECK (destinatarios IN ('todos', 'alunos', 'professores', 'turma')),
  turma_id UUID,
  enviado_email BOOLEAN DEFAULT FALSE,
  enviado_whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avisos are viewable by authenticated users" 
ON public.avisos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Avisos can be managed by authenticated users" 
ON public.avisos FOR ALL USING (auth.role() = 'authenticated');

-- 11. NOTIFICACOES (Notifications)
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'aviso', 'alerta', 'sucesso')),
  lida BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notificacoes are viewable by authenticated users" 
ON public.notificacoes FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Notificacoes can be managed by authenticated users" 
ON public.notificacoes FOR ALL USING (auth.role() = 'authenticated');

-- 12. MATERIAIS_DIDATICOS (Teaching Materials)
CREATE TABLE public.materiais_didaticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT 'pdf' CHECK (tipo IN ('pdf', 'video', 'audio', 'partitura', 'outro')),
  descricao TEXT,
  arquivo_url TEXT,
  professor_id UUID REFERENCES public.professores(id),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.materiais_didaticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materiais are viewable by authenticated users" 
ON public.materiais_didaticos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Materiais can be managed by authenticated users" 
ON public.materiais_didaticos FOR ALL USING (auth.role() = 'authenticated');

-- 13. AVALIACOES (Evaluations)
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id),
  professor_id UUID REFERENCES public.professores(id),
  data DATE NOT NULL,
  nota DECIMAL(3,1),
  observacoes TEXT,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avaliacoes are viewable by authenticated users" 
ON public.avaliacoes FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Avaliacoes can be managed by authenticated users" 
ON public.avaliacoes FOR ALL USING (auth.role() = 'authenticated');

-- FUNCTION to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_instrumentos_updated_at BEFORE UPDATE ON public.instrumentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aulas_updated_at BEFORE UPDATE ON public.aulas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planos_aula_updated_at BEFORE UPDATE ON public.planos_aula FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.professores (nome, email, telefone, especialidades, valor_hora, status, avaliacao) VALUES
('Carlos Mendes', 'carlos@escola.com', '(47) 99999-1111', ARRAY['Piano', 'Teclado'], 80.00, 'ativo', 4.9),
('Ana Paula Costa', 'ana@escola.com', '(47) 99999-2222', ARRAY['Violão', 'Ukulele'], 70.00, 'ativo', 4.8),
('Pedro Oliveira', 'pedro@escola.com', '(47) 99999-3333', ARRAY['Bateria', 'Percussão'], 75.00, 'ativo', 4.7),
('Marina Silva', 'marina@escola.com', '(47) 99999-4444', ARRAY['Guitarra', 'Baixo'], 80.00, 'ativo', 4.9);

INSERT INTO public.cursos (nome, instrumento, nivel, duracao, carga_horaria, valor_mensal, status) VALUES
('Piano Básico', 'Piano', 'iniciante', '6 meses', '2h/semana', 450.00, 'ativo'),
('Violão Popular', 'Violão', 'iniciante', '4 meses', '1h/semana', 350.00, 'ativo'),
('Guitarra Rock', 'Guitarra', 'intermediario', '8 meses', '2h/semana', 500.00, 'ativo'),
('Bateria Avançada', 'Bateria', 'avancado', '12 meses', '2h/semana', 600.00, 'ativo'),
('Teoria Musical', 'Teoria', 'todos', '3 meses', '1h/semana', 280.00, 'ativo');

INSERT INTO public.instrumentos (nome, tipo, marca, localizacao, valor_patrimonio, status) VALUES
('Piano Yamaha C3', 'Piano', 'Yamaha', 'Sala 1', 45000.00, 'disponivel'),
('Violão Giannini', 'Violão', 'Giannini', 'Sala 3', 1200.00, 'disponivel'),
('Bateria Pearl Export', 'Bateria', 'Pearl', 'Sala 5', 8500.00, 'disponivel'),
('Teclado Korg PA700', 'Teclado', 'Korg', 'Sala 2', 12000.00, 'disponivel'),
('Guitarra Fender Stratocaster', 'Guitarra', 'Fender', 'Sala 3', 7800.00, 'disponivel');

INSERT INTO public.notificacoes (titulo, mensagem, tipo) VALUES
('Bem-vindo ao Sistema!', 'O sistema de gestão da escola está ativo.', 'sucesso'),
('Lembrete de Pagamentos', '5 pagamentos vencem esta semana.', 'alerta'),
('Nova Funcionalidade', 'O Hub de IA foi atualizado com novas funcionalidades.', 'info');