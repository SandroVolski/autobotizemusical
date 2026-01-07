import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Avaliacao {
  id: string;
  aluno_id: string;
  professor_id: string | null;
  data: string;
  nota: number | null;
  feedback: string | null;
  aspectos: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string } | null;
  professores?: { nome: string } | null;
}

export interface NovaAvaliacao {
  aluno_id: string;
  professor_id?: string;
  data?: string;
  nota?: number;
  feedback?: string;
  aspectos?: Record<string, number>;
}

export function useAvaliacoes(alunoId?: string) {
  return useQuery({
    queryKey: ["avaliacoes", alunoId],
    queryFn: async () => {
      let query = supabase
        .from("avaliacoes")
        .select(`
          *,
          alunos(nome),
          professores(nome)
        `)
        .order("data", { ascending: false });
      
      if (alunoId) {
        query = query.eq("aluno_id", alunoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Avaliacao[];
    },
  });
}

export function useCreateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avaliacao: NovaAvaliacao) => {
      const { data, error } = await supabase
        .from("avaliacoes")
        .insert(avaliacao)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      toast({
        title: "Avaliação registrada!",
        description: "A avaliação foi salva com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar avaliação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...avaliacao }: Partial<Avaliacao> & { id: string }) => {
      const { data, error } = await supabase
        .from("avaliacoes")
        .update(avaliacao)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      toast({
        title: "Avaliação atualizada!",
        description: "Os dados da avaliação foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar avaliação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("avaliacoes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      toast({
        title: "Avaliação removida",
        description: "A avaliação foi removida do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover avaliação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
