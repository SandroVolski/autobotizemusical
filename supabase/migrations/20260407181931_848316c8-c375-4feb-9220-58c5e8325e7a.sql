-- Remove confirmacao_aula_mensagens from Realtime to prevent data leak
ALTER PUBLICATION supabase_realtime DROP TABLE public.confirmacao_aula_mensagens;