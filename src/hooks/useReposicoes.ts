import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useReposicoes() {
  return useQuery({
    queryKey: ["reposicoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reposicoes")
        .select("*, alunos(nome), professores(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReposicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (repo: {
      aluno_id: string;
      aula_id?: string;
      data_falta: string;
      tipo_falta: string;
      professor_id?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase.from("reposicoes").insert({
        ...repo,
        status: repo.tipo_falta === "justificada" ? "pendente" : "sem_direito",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reposicoes"] });
      toast({ title: "Falta registrada!" });
    },
    onError: () => toast({ title: "Erro ao registrar falta", variant: "destructive" }),
  });
}

export function useUpdateReposicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      status?: string;
      data_reposicao?: string;
      horario_reposicao?: string;
      professor_id?: string;
    }) => {
      const { error } = await supabase.from("reposicoes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reposicoes"] });
      toast({ title: "Reposição atualizada!" });
    },
    onError: () => toast({ title: "Erro ao atualizar reposição", variant: "destructive" }),
  });
}
