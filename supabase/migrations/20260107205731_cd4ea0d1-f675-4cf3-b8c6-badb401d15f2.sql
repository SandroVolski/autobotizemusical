-- Make materiais bucket private
UPDATE storage.buckets SET public = false WHERE id = 'materiais';

-- Drop existing permissive storage policy if exists
DROP POLICY IF EXISTS "Anyone can view materials" ON storage.objects;

-- Create authenticated access policy for storage
DROP POLICY IF EXISTS "Authenticated users can view materials" ON storage.objects;
CREATE POLICY "Authenticated users can view materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'materiais' AND auth.role() = 'authenticated');

-- Drop existing permissive RLS policies for alunos
DROP POLICY IF EXISTS "Authenticated users can insert alunos" ON alunos;
DROP POLICY IF EXISTS "Authenticated users can update alunos" ON alunos;
DROP POLICY IF EXISTS "Authenticated users can delete alunos" ON alunos;

-- Drop existing permissive RLS policies for professores
DROP POLICY IF EXISTS "Authenticated users can insert professores" ON professores;
DROP POLICY IF EXISTS "Authenticated users can update professores" ON professores;
DROP POLICY IF EXISTS "Authenticated users can delete professores" ON professores;

-- Drop existing permissive RLS policies for cursos
DROP POLICY IF EXISTS "Authenticated users can insert cursos" ON cursos;
DROP POLICY IF EXISTS "Authenticated users can update cursos" ON cursos;
DROP POLICY IF EXISTS "Authenticated users can delete cursos" ON cursos;

-- Drop existing permissive RLS policies for instrumentos
DROP POLICY IF EXISTS "Authenticated users can insert instrumentos" ON instrumentos;
DROP POLICY IF EXISTS "Authenticated users can update instrumentos" ON instrumentos;
DROP POLICY IF EXISTS "Authenticated users can delete instrumentos" ON instrumentos;

-- Drop existing permissive RLS policies for aulas
DROP POLICY IF EXISTS "Authenticated users can insert aulas" ON aulas;
DROP POLICY IF EXISTS "Authenticated users can update aulas" ON aulas;
DROP POLICY IF EXISTS "Authenticated users can delete aulas" ON aulas;

-- Drop existing permissive RLS policies for pagamentos
DROP POLICY IF EXISTS "Authenticated users can insert pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Authenticated users can update pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Authenticated users can delete pagamentos" ON pagamentos;

-- Drop existing permissive RLS policies for planos_aula
DROP POLICY IF EXISTS "Authenticated users can insert planos_aula" ON planos_aula;
DROP POLICY IF EXISTS "Authenticated users can update planos_aula" ON planos_aula;
DROP POLICY IF EXISTS "Authenticated users can delete planos_aula" ON planos_aula;

-- Drop existing permissive RLS policies for avisos
DROP POLICY IF EXISTS "Authenticated users can insert avisos" ON avisos;
DROP POLICY IF EXISTS "Authenticated users can update avisos" ON avisos;
DROP POLICY IF EXISTS "Authenticated users can delete avisos" ON avisos;

-- Drop existing permissive RLS policies for materiais
DROP POLICY IF EXISTS "Authenticated users can insert materiais" ON materiais;
DROP POLICY IF EXISTS "Authenticated users can update materiais" ON materiais;
DROP POLICY IF EXISTS "Authenticated users can delete materiais" ON materiais;

-- Drop existing permissive RLS policies for avaliacoes
DROP POLICY IF EXISTS "Authenticated users can insert avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "Authenticated users can update avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "Authenticated users can delete avaliacoes" ON avaliacoes;

-- Drop existing permissive RLS policies for presencas
DROP POLICY IF EXISTS "Authenticated users can insert presencas" ON presencas;
DROP POLICY IF EXISTS "Authenticated users can update presencas" ON presencas;
DROP POLICY IF EXISTS "Authenticated users can delete presencas" ON presencas;

-- Drop existing permissive RLS policies for matriculas
DROP POLICY IF EXISTS "Authenticated users can insert matriculas" ON matriculas;
DROP POLICY IF EXISTS "Authenticated users can update matriculas" ON matriculas;
DROP POLICY IF EXISTS "Authenticated users can delete matriculas" ON matriculas;

-- Drop existing permissive RLS policies for configuracoes_escola
DROP POLICY IF EXISTS "Authenticated users can insert configuracoes" ON configuracoes_escola;
DROP POLICY IF EXISTS "Authenticated users can update configuracoes" ON configuracoes_escola;

-- Create role-based policies for alunos
CREATE POLICY "Admin and Secretaria can manage alunos"
  ON alunos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can insert alunos"
  ON alunos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'professor'));

CREATE POLICY "Professor can update alunos"
  ON alunos FOR UPDATE
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for professores
CREATE POLICY "Admin and Secretaria can manage professores"
  ON professores FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- Create role-based policies for cursos
CREATE POLICY "Admin and Secretaria can manage cursos"
  ON cursos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can insert cursos"
  ON cursos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'professor'));

CREATE POLICY "Professor can update cursos"
  ON cursos FOR UPDATE
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for instrumentos
CREATE POLICY "Admin and Secretaria can manage instrumentos"
  ON instrumentos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- Create role-based policies for aulas
CREATE POLICY "Admin and Secretaria can manage aulas"
  ON aulas FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can manage own aulas"
  ON aulas FOR ALL
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for pagamentos
CREATE POLICY "Admin and Secretaria can manage pagamentos"
  ON pagamentos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- Create role-based policies for planos_aula
CREATE POLICY "Admin and Secretaria can manage planos_aula"
  ON planos_aula FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can manage planos_aula"
  ON planos_aula FOR ALL
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for avisos
CREATE POLICY "Admin and Secretaria can manage avisos"
  ON avisos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- Create role-based policies for materiais
CREATE POLICY "Admin and Secretaria can manage materiais"
  ON materiais FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can manage materiais"
  ON materiais FOR ALL
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for avaliacoes
CREATE POLICY "Admin and Secretaria can manage avaliacoes"
  ON avaliacoes FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can manage avaliacoes"
  ON avaliacoes FOR ALL
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for presencas
CREATE POLICY "Admin and Secretaria can manage presencas"
  ON presencas FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Professor can manage presencas"
  ON presencas FOR ALL
  USING (has_role(auth.uid(), 'professor'));

-- Create role-based policies for matriculas
CREATE POLICY "Admin and Secretaria can manage matriculas"
  ON matriculas FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretaria'));

-- Create role-based policies for configuracoes_escola
CREATE POLICY "Admin can manage configuracoes"
  ON configuracoes_escola FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Secretaria can update configuracoes"
  ON configuracoes_escola FOR UPDATE
  USING (has_role(auth.uid(), 'secretaria'));

CREATE POLICY "Secretaria can insert configuracoes"
  ON configuracoes_escola FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'secretaria'));