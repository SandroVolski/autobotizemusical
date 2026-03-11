
-- Input validation constraints on key tables

-- alunos
ALTER TABLE public.alunos ADD CONSTRAINT alunos_nome_length CHECK (length(nome) <= 200);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_email_length CHECK (email IS NULL OR length(email) <= 255);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_telefone_length CHECK (telefone IS NULL OR length(telefone) <= 30);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_endereco_length CHECK (endereco IS NULL OR length(endereco) <= 500);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_responsavel_nome_length CHECK (responsavel_nome IS NULL OR length(responsavel_nome) <= 200);
ALTER TABLE public.alunos ADD CONSTRAINT alunos_responsavel_telefone_length CHECK (responsavel_telefone IS NULL OR length(responsavel_telefone) <= 30);

-- professores
ALTER TABLE public.professores ADD CONSTRAINT professores_nome_length CHECK (length(nome) <= 200);
ALTER TABLE public.professores ADD CONSTRAINT professores_email_length CHECK (email IS NULL OR length(email) <= 255);
ALTER TABLE public.professores ADD CONSTRAINT professores_telefone_length CHECK (telefone IS NULL OR length(telefone) <= 30);
ALTER TABLE public.professores ADD CONSTRAINT professores_salario_positive CHECK (salario IS NULL OR salario >= 0);

-- pagamentos
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_valor_positive CHECK (valor > 0);

-- contas_pagar
ALTER TABLE public.contas_pagar ADD CONSTRAINT contas_pagar_valor_positive CHECK (valor > 0);

-- cursos
ALTER TABLE public.cursos ADD CONSTRAINT cursos_nome_length CHECK (length(nome) <= 200);
ALTER TABLE public.cursos ADD CONSTRAINT cursos_valor_mensal_positive CHECK (valor_mensal IS NULL OR valor_mensal >= 0);

-- produtos
ALTER TABLE public.produtos ADD CONSTRAINT produtos_nome_length CHECK (length(nome) <= 200);
ALTER TABLE public.produtos ADD CONSTRAINT produtos_preco_positive CHECK (preco >= 0);
ALTER TABLE public.produtos ADD CONSTRAINT produtos_estoque_positive CHECK (estoque >= 0);

-- Make alunos-fotos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'alunos-fotos';

-- Drop public SELECT policy and replace with authenticated
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
CREATE POLICY "Authenticated users can view student photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'alunos-fotos');
