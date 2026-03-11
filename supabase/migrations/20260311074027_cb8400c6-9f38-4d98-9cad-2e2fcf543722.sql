ALTER TABLE public.configuracoes_escola 
ADD COLUMN IF NOT EXISTS mensagem_confirmacao text DEFAULT 'Olá {nome}! 🎵

Lembramos que você tem aula amanhã ({dia}) às {horario}.

Você confirma presença?

✅ Responda *SIM* para confirmar
❌ Responda *NÃO* para cancelar';