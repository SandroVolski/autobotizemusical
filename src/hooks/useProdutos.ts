import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (produto: {
      nome: string;
      preco: number;
      estoque?: number;
      categoria?: string;
      descricao?: string;
    }) => {
      const { error } = await supabase.from("produtos").insert(produto);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto cadastrado!" });
    },
    onError: () => toast({ title: "Erro ao cadastrar produto", variant: "destructive" }),
  });
}

export function useUpdateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; estoque?: number; preco?: number; status?: string }) => {
      const { error } = await supabase.from("produtos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: () => toast({ title: "Erro ao atualizar produto", variant: "destructive" }),
  });
}
