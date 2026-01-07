-- Add user_id column to configuracoes_escola for multi-tenant isolation
ALTER TABLE public.configuracoes_escola 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_configuracoes_escola_user_id ON public.configuracoes_escola(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Admin can manage configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Authenticated users can view configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Secretaria can insert configuracoes" ON public.configuracoes_escola;
DROP POLICY IF EXISTS "Secretaria can update configuracoes" ON public.configuracoes_escola;

-- Create new RLS policies for user isolation
CREATE POLICY "Users can view their own configuracoes"
ON public.configuracoes_escola
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configuracoes"
ON public.configuracoes_escola
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuracoes"
ON public.configuracoes_escola
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configuracoes"
ON public.configuracoes_escola
FOR DELETE
USING (auth.uid() = user_id);