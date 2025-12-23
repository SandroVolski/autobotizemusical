import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Curso {
  id: string;
  nome: string;
  instrumento: string;
  nivel: string;
  descricao: string | null;
  duracao: string | null;
  carga_horaria: string | null;
  valor_mensal: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NovoCurso {
  nome: string;
  instrumento: string;
  nivel?: string;
  descricao?: string;
  duracao?: string;
  carga_horaria?: string;
  valor_mensal?: number;
  status?: string;
}

export function useCursos() {
  return useQuery({
    queryKey: ["cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data as Curso[];
    },
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (curso: NovoCurso) => {
      const { data, error } = await supabase
        .from("cursos")
        .insert(curso)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      toast({
        title: "Curso criado!",
        description: "O curso foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar curso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...curso }: Partial<Curso> & { id: string }) => {
      const { data, error } = await supabase
        .from("cursos")
        .update(curso)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      toast({
        title: "Curso atualizado!",
        description: "Os dados do curso foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar curso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cursos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      toast({
        title: "Curso removido",
        description: "O curso foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover curso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
