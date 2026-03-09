import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useContasPagar() {
  return useQuery({
    queryKey: ["contas_pagar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_pagar")
        .select("*")
        .order("data_vencimento", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conta: {
      descricao: string;
      valor: number;
      data_vencimento?: string;
      categoria?: string;
      fornecedor?: string;
      status?: string;
    }) => {
      const { error } = await supabase.from("contas_pagar").insert(conta);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas_pagar"] });
      toast({ title: "Conta registrada com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao registrar conta", variant: "destructive" }),
  });
}

export function useUpdateContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; data_pagamento?: string }) => {
      const { error } = await supabase.from("contas_pagar").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas_pagar"] });
      toast({ title: "Conta atualizada!" });
    },
    onError: () => toast({ title: "Erro ao atualizar conta", variant: "destructive" }),
  });
}

export function useDeleteContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas_pagar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas_pagar"] });
      toast({ title: "Conta excluída!" });
    },
    onError: () => toast({ title: "Erro ao excluir conta", variant: "destructive" }),
  });
}
