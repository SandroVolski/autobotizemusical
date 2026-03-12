
-- Fix contratos SELECT policy: restrict to admin, secretaria, professor
DROP POLICY IF EXISTS "Authenticated users can view contratos" ON public.contratos;

CREATE POLICY "Authorized roles can view contratos"
  ON public.contratos FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'secretaria'::app_role) OR 
    has_role(auth.uid(), 'professor'::app_role)
  );
