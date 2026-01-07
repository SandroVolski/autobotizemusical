import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Aula {
  id: string;
  aluno_id: string | null;
  professor_id: string | null;
  curso_id: string | null;
  tipo: string;
  dia_semana: number | null;
  horario: string | null;
  duracao_minutos: number;
  sala: string | null;
  data_especifica: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  recorrente: boolean;
  status: string;
  observacoes: string | null;
  valor: number | null;
  created_at: string;
  updated_at: string;
  alunos?: { nome: string } | null;
  professores?: { nome: string } | null;
  cursos?: { nome: string } | null;
}

export interface NovaAula {
  aluno_id?: string;
  professor_id?: string;
  curso_id?: string;
  tipo?: string;
  dia_semana?: number;
  horario?: string;
  duracao_minutos?: number;
  sala?: string;
  data_especifica?: string;
  data_inicio?: string;
  data_fim?: string;
  recorrente?: boolean;
  observacoes?: string;
  valor?: number;
}

export function useAulas() {
  return useQuery({
    queryKey: ["aulas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas")
        .select(`
          *,
          alunos(nome),
          professores(nome),
          cursos(nome)
        `)
        .order("horario");
      
      if (error) throw error;
      return data as Aula[];
    },
  });
}

export function useCreateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aula: NovaAula) => {
      const { data, error } = await supabase
        .from("aulas")
        .insert(aula)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      toast({
        title: "Aula agendada!",
        description: "A aula foi agendada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, alunos, professores, cursos, ...aula }: Partial<Aula> & { id: string }) => {
      const { data, error } = await supabase
        .from("aulas")
        .update(aula)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      toast({
        title: "Aula atualizada!",
        description: "Os dados da aula foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("aulas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      toast({
        title: "Aula removida",
        description: "A aula foi removida da agenda.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
