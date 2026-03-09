import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useTurmas() {
  return useQuery({
    queryKey: ["turmas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select("*, professores(nome), cursos(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTurmaAlunos(turmaId: string | null) {
  return useQuery({
    queryKey: ["turma_alunos", turmaId],
    enabled: !!turmaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turma_alunos")
        .select("*, alunos(id, nome, foto_url)")
        .eq("turma_id", turmaId!)
        .eq("status", "ativo");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (turma: {
      nome: string;
      professor_id?: string;
      curso_id?: string;
      dia_semana?: number;
      horario?: string;
      duracao_minutos?: number;
      max_alunos?: number;
      sala?: string;
    }) => {
      const { data, error } = await supabase.from("turmas").insert(turma).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas"] });
      toast({ title: "Turma criada com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao criar turma", variant: "destructive" }),
  });
}

export function useAddAlunoTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ turma_id, aluno_id }: { turma_id: string; aluno_id: string }) => {
      const { error } = await supabase.from("turma_alunos").insert({ turma_id, aluno_id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turma_alunos"] });
      qc.invalidateQueries({ queryKey: ["turmas"] });
      toast({ title: "Aluno adicionado à turma!" });
    },
    onError: () => toast({ title: "Erro ao adicionar aluno", variant: "destructive" }),
  });
}

export function useRemoveAlunoTurma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ turma_id, aluno_id }: { turma_id: string; aluno_id: string }) => {
      const { error } = await supabase
        .from("turma_alunos")
        .delete()
        .eq("turma_id", turma_id)
        .eq("aluno_id", aluno_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turma_alunos"] });
      qc.invalidateQueries({ queryKey: ["turmas"] });
      toast({ title: "Aluno removido da turma" });
    },
    onError: () => toast({ title: "Erro ao remover aluno", variant: "destructive" }),
  });
}
