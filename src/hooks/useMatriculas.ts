import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Matricula {
  id: string;
  aluno_id: string;
  curso_id: string;
  data_inicio: string;
  data_fim: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string } | null;
  cursos?: { nome: string; instrumento: string } | null;
}

export interface NovaMatricula {
  aluno_id: string;
  curso_id: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  observacoes?: string;
}

export function useMatriculas(alunoId?: string) {
  return useQuery({
    queryKey: ["matriculas", alunoId],
    queryFn: async () => {
      let query = supabase
        .from("matriculas")
        .select(`
          *,
          alunos(nome),
          cursos(nome, instrumento)
        `)
        .order("data_inicio", { ascending: false });
      
      if (alunoId) {
        query = query.eq("aluno_id", alunoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Matricula[];
    },
  });
}

export function useMatriculasPorCurso(cursoId?: string) {
  return useQuery({
    queryKey: ["matriculas", "curso", cursoId],
    queryFn: async () => {
      if (!cursoId) return [];
      
      const { data, error } = await supabase
        .from("matriculas")
        .select(`
          *,
          alunos(nome)
        `)
        .eq("curso_id", cursoId)
        .eq("status", "ativo");
      
      if (error) throw error;
      return data as Matricula[];
    },
    enabled: !!cursoId,
  });
}

export function useCreateMatricula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matricula: NovaMatricula) => {
      const { data, error } = await supabase
        .from("matriculas")
        .insert(matricula)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      toast({
        title: "Matrícula realizada!",
        description: "O aluno foi matriculado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao matricular",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMatricula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...matricula }: Partial<Matricula> & { id: string }) => {
      const { data, error } = await supabase
        .from("matriculas")
        .update(matricula)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      toast({
        title: "Matrícula atualizada!",
        description: "Os dados da matrícula foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar matrícula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMatricula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("matriculas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      toast({
        title: "Matrícula cancelada",
        description: "A matrícula foi removida do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cancelar matrícula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
