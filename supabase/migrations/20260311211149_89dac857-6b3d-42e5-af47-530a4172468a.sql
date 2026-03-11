-- Fix leads table: drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Admin and Secretaria can view leads"
  ON public.leads FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretaria'::app_role));