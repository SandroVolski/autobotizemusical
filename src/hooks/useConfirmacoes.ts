import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ConfirmacaoConfig {
  id: string;
  aluno_id: string;
  habilitado: boolean;
  telefone_override: string | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string; telefone: string | null } | null;
}

export interface ConfirmacaoMensagem {
  id: string;
  aluno_id: string;
  aula_id: string | null;
  telefone: string;
  mensagem: string;
  status: string;
  resposta_aluno: string | null;
  data_aula: string;
  enviado_em: string | null;
  respondido_em: string | null;
  erro: string | null;
  created_at: string;
  alunos?: { nome: string } | null;
}

export function useConfirmacaoConfigs() {
  return useQuery({
    queryKey: ["confirmacao-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("confirmacao_aula_config")
        .select("*, alunos(nome, telefone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ConfirmacaoConfig[];
    },
  });
}

export function useConfirmacaoMensagensRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("confirmacao-mensagens-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "confirmacao_aula_mensagens" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["confirmacao-mensagens"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useConfirmacaoMensagens() {
  return useQuery({
    queryKey: ["confirmacao-mensagens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("confirmacao_aula_mensagens")
        .select("*, alunos(nome)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as ConfirmacaoMensagem[];
    },
  });
}

export function useToggleConfirmacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ aluno_id, habilitado }: { aluno_id: string; habilitado: boolean }) => {
      // Upsert
      const { error } = await supabase
        .from("confirmacao_aula_config")
        .upsert({ aluno_id, habilitado }, { onConflict: "aluno_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmacao-configs"] });
      toast({ title: "Configuração atualizada!" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateMensagemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("confirmacao_aula_mensagens")
        .update({ status, respondido_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmacao-mensagens"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useBulkEnableConfirmacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alunoIds: string[]) => {
      const records = alunoIds.map((aluno_id) => ({ aluno_id, habilitado: true }));
      const { error } = await supabase
        .from("confirmacao_aula_config")
        .upsert(records, { onConflict: "aluno_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmacao-configs"] });
      toast({ title: "Confirmações habilitadas para todos os alunos selecionados!" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
