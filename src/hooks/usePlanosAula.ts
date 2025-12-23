import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PlanoAula {
  id: string;
  titulo: string;
  instrumento: string;
  nivel: string;
  duracao: string | null;
  conteudo: string | null;
  objetivos: string | null;
  materiais: string | null;
  professor_id: string | null;
  created_at: string;
  updated_at: string;
  professores?: { nome: string } | null;
}

export interface NovoPlanoAula {
  titulo: string;
  instrumento: string;
  nivel?: string;
  duracao?: string;
  conteudo?: string;
  objetivos?: string;
  materiais?: string;
  professor_id?: string;
}

export function usePlanosAula() {
  return useQuery({
    queryKey: ["planos_aula"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos_aula")
        .select(`
          *,
          professores(nome)
        `)
        .order("titulo");
      
      if (error) throw error;
      return data as PlanoAula[];
    },
  });
}

export function useCreatePlanoAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plano: NovoPlanoAula) => {
      const { data, error } = await supabase
        .from("planos_aula")
        .insert(plano)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_aula"] });
      toast({
        title: "Plano de aula criado!",
        description: "O plano de aula foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano de aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePlanoAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plano }: Partial<PlanoAula> & { id: string }) => {
      const { data, error } = await supabase
        .from("planos_aula")
        .update(plano)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_aula"] });
      toast({
        title: "Plano de aula atualizado!",
        description: "Os dados do plano foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar plano de aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePlanoAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("planos_aula")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_aula"] });
      toast({
        title: "Plano de aula removido",
        description: "O plano de aula foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover plano de aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
