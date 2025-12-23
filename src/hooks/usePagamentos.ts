import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Pagamento {
  id: string;
  aluno_id: string | null;
  valor: number;
  tipo: string;
  referencia: string | null;
  data_vencimento: string;
  data_pagamento: string | null;
  metodo_pagamento: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string } | null;
}

export interface NovoPagamento {
  aluno_id?: string;
  valor: number;
  tipo?: string;
  referencia?: string;
  data_vencimento: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  status?: string;
  observacoes?: string;
}

export function usePagamentos() {
  return useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select(`
          *,
          alunos(nome)
        `)
        .order("data_vencimento", { ascending: false });
      
      if (error) throw error;
      return data as Pagamento[];
    },
  });
}

export function useCreatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pagamento: NovoPagamento) => {
      const { data, error } = await supabase
        .from("pagamentos")
        .insert(pagamento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
      toast({
        title: "Pagamento registrado!",
        description: "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...pagamento }: Partial<Pagamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("pagamentos")
        .update(pagamento)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
      toast({
        title: "Pagamento atualizado!",
        description: "Os dados do pagamento foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pagamentos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
      toast({
        title: "Pagamento removido",
        description: "O pagamento foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
