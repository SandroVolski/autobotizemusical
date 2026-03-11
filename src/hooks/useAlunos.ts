import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { alunoSchema } from "@/lib/validations";

export interface Aluno {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  endereco: string | null;
  nivel: string;
  objetivo: string | null;
  observacoes: string | null;
  status: string;
  data_matricula: string | null;
  foto_url: string | null;
  dia_vencimento: number | null;
  created_at: string;
  updated_at: string;
}

export interface NovoAluno {
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  endereco?: string;
  nivel?: string;
  objetivo?: string;
  observacoes?: string;
  dia_vencimento?: number;
}

export function useAlunos() {
  return useQuery({
    queryKey: ["alunos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data as Aluno[];
    },
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aluno: NovoAluno) => {
      // Validate input before sending to database
      const result = alunoSchema.safeParse(aluno);
      if (!result.success) {
        throw new Error(result.error.errors.map(e => e.message).join(", "));
      }

      const { data, error } = await supabase
        .from("alunos")
        .insert(aluno)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      toast({
        title: "Aluno cadastrado!",
        description: "O aluno foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...aluno }: Partial<Aluno> & { id: string }) => {
      // Validate input before sending to database
      const result = alunoSchema.partial().safeParse(aluno);
      if (!result.success) {
        throw new Error(result.error.errors.map(e => e.message).join(", "));
      }

      // Convert empty strings to null for date/nullable fields
      const cleanedAluno = Object.fromEntries(
        Object.entries(aluno).map(([key, value]) => [key, value === "" ? null : value])
      );

      const { data, error } = await supabase
        .from("alunos")
        .update(cleanedAluno)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      toast({
        title: "Aluno atualizado!",
        description: "Os dados do aluno foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar aluno",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alunos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      toast({
        title: "Aluno removido",
        description: "O aluno foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover aluno",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
