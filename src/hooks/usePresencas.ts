import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Presenca {
  id: string;
  aula_id: string | null;
  aluno_id: string;
  data: string;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string } | null;
  aulas?: { horario: string; dia_semana: number } | null;
}

export interface NovaPresenca {
  aula_id?: string;
  aluno_id: string;
  data: string;
  status?: string;
  observacoes?: string;
}

export function usePresencas(alunoId?: string) {
  return useQuery({
    queryKey: ["presencas", alunoId],
    queryFn: async () => {
      let query = supabase
        .from("presencas")
        .select(`
          *,
          alunos(nome),
          aulas(horario, dia_semana)
        `)
        .order("data", { ascending: false });
      
      if (alunoId) {
        query = query.eq("aluno_id", alunoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Presenca[];
    },
  });
}

export function usePresencasPorAula(aulaId?: string, data?: string) {
  return useQuery({
    queryKey: ["presencas", "aula", aulaId, data],
    queryFn: async () => {
      if (!aulaId || !data) return [];
      
      const { data: presencas, error } = await supabase
        .from("presencas")
        .select(`
          *,
          alunos(nome)
        `)
        .eq("aula_id", aulaId)
        .eq("data", data);
      
      if (error) throw error;
      return presencas as Presenca[];
    },
    enabled: !!aulaId && !!data,
  });
}

export function useCreatePresenca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presenca: NovaPresenca) => {
      const { data, error } = await supabase
        .from("presencas")
        .insert(presenca)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presencas"] });
      toast({
        title: "Presença registrada!",
        description: "A presença foi registrada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar presença",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePresenca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...presenca }: Partial<Presenca> & { id: string }) => {
      const { data, error } = await supabase
        .from("presencas")
        .update(presenca)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presencas"] });
      toast({
        title: "Presença atualizada!",
        description: "A presença foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar presença",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePresenca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("presencas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presencas"] });
      toast({
        title: "Presença removida",
        description: "O registro de presença foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover presença",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreatePresencas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presencas: NovaPresenca[]) => {
      const { data, error } = await supabase
        .from("presencas")
        .upsert(presencas, { onConflict: 'aula_id,aluno_id,data' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presencas"] });
      toast({
        title: "Presenças registradas!",
        description: "Todas as presenças foram registradas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar presenças",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
