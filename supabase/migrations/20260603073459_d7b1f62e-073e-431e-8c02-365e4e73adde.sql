DROP POLICY IF EXISTS "System can insert notifications" ON public.notificacoes;
CREATE POLICY "Only service role can insert notifications"
  ON public.notificacoes FOR INSERT
  TO authenticated
  WITH CHECK (false);