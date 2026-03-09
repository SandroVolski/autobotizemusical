
-- 1. Turmas (Group classes)
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  dia_semana INTEGER,
  horario TIME WITHOUT TIME ZONE,
  duracao_minutos INTEGER DEFAULT 60,
  max_alunos INTEGER DEFAULT 10,
  sala TEXT,
  status TEXT DEFAULT 'ativa',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Turma-Alunos (many-to-many)
CREATE TABLE public.turma_alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_entrada DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turma_id, aluno_id)
);

-- 3. Contas a Pagar
CREATE TABLE public.contas_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  categoria TEXT DEFAULT 'outros',
  fornecedor TEXT,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Produtos (mini-estoque)
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 5,
  categoria TEXT DEFAULT 'acessorio',
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Vendas (PDV)
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  itens JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  metodo_pagamento TEXT DEFAULT 'dinheiro',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Reposições
CREATE TABLE public.reposicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE SET NULL,
  data_falta DATE NOT NULL,
  tipo_falta TEXT NOT NULL DEFAULT 'falta',
  status TEXT DEFAULT 'pendente',
  data_reposicao DATE,
  horario_reposicao TIME WITHOUT TIME ZONE,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Contratos
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  instrumento_id UUID REFERENCES public.instrumentos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'matricula',
  dados JSONB DEFAULT '{}',
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Leads (CRM)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  interesse TEXT,
  origem TEXT DEFAULT 'site',
  status TEXT DEFAULT 'novo_contato',
  data_experimental DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reposicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for turmas
CREATE POLICY "Admin and Secretaria can manage turmas" ON public.turmas FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professor can manage own turmas" ON public.turmas FOR ALL TO public USING (has_role(auth.uid(), 'professor'));

-- RLS Policies for turma_alunos
CREATE POLICY "Admin and Secretaria can manage turma_alunos" ON public.turma_alunos FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view turma_alunos" ON public.turma_alunos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professor can manage turma_alunos" ON public.turma_alunos FOR ALL TO public USING (has_role(auth.uid(), 'professor'));

-- RLS Policies for contas_pagar
CREATE POLICY "Admin and Secretaria can manage contas_pagar" ON public.contas_pagar FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Admin and Secretaria can view contas_pagar" ON public.contas_pagar FOR SELECT TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- RLS Policies for produtos
CREATE POLICY "Admin and Secretaria can manage produtos" ON public.produtos FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view produtos" ON public.produtos FOR SELECT TO authenticated USING (true);

-- RLS Policies for vendas
CREATE POLICY "Admin and Secretaria can manage vendas" ON public.vendas FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Admin and Secretaria can view vendas" ON public.vendas FOR SELECT TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- RLS Policies for reposicoes
CREATE POLICY "Admin and Secretaria can manage reposicoes" ON public.reposicoes FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view reposicoes" ON public.reposicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professor can manage reposicoes" ON public.reposicoes FOR ALL TO public USING (has_role(auth.uid(), 'professor'));

-- RLS Policies for contratos
CREATE POLICY "Admin and Secretaria can manage contratos" ON public.contratos FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view contratos" ON public.contratos FOR SELECT TO authenticated USING (true);

-- RLS Policies for leads
CREATE POLICY "Admin and Secretaria can manage leads" ON public.leads FOR ALL TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
