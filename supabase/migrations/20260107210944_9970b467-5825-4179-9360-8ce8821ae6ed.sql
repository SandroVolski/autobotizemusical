-- Fix: Restrict pagamentos table SELECT access to admin and secretaria only
-- Drop the overly permissive SELECT policy that allows all authenticated users to view financial data
DROP POLICY IF EXISTS "Authenticated users can view pagamentos" ON pagamentos;

-- Create a proper role-based SELECT policy for financial data
CREATE POLICY "Admin and Secretaria can view pagamentos"
  ON pagamentos FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'secretaria'::app_role)
  );