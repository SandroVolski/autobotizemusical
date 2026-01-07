import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Professor {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  instrumentos: string[] | null;
  bio: string | null;
  status: string;
  data_contratacao: string | null;
  salario: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NovoProfessor {
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  instrumentos?: string[];
  bio?: string;
  salario?: number;
  status?: string;
}

export function useProfessores() {
  return useQuery({
    queryKey: ["professores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professores")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data as Professor[];
    },
  });
}

export function useCreateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professor: NovoProfessor) => {
      const { data, error } = await supabase
        .from("professores")
        .insert(professor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professores"] });
      toast({
        title: "Professor cadastrado!",
        description: "O professor foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar professor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...professor }: Partial<Professor> & { id: string }) => {
      const { data, error } = await supabase
        .from("professores")
        .update(professor)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professores"] });
      toast({
        title: "Professor atualizado!",
        description: "Os dados do professor foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar professor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("professores")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professores"] });
      toast({
        title: "Professor removido",
        description: "O professor foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover professor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
