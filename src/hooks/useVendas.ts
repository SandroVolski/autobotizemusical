import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useVendas() {
  return useQuery({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("*, alunos(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (venda: {
      aluno_id?: string;
      itens: Array<{ produto_id: string; nome: string; quantidade: number; preco: number }>;
      total: number;
      metodo_pagamento?: string;
    }) => {
      const { error } = await supabase.from("vendas").insert({
        aluno_id: venda.aluno_id || null,
        itens: venda.itens as any,
        total: venda.total,
        metodo_pagamento: venda.metodo_pagamento,
      });
      if (error) throw error;

      // Update stock for each item
      for (const item of venda.itens) {
        const { data: produto } = await supabase
          .from("produtos")
          .select("estoque")
          .eq("id", item.produto_id)
          .single();
        if (produto) {
          await supabase
            .from("produtos")
            .update({ estoque: produto.estoque - item.quantidade })
            .eq("id", item.produto_id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Venda registrada!" });
    },
    onError: () => toast({ title: "Erro ao registrar venda", variant: "destructive" }),
  });
}
