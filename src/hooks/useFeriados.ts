import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Feriado {
  id: string;
  data: string;
  titulo: string;
  motivo: string | null;
  dia_todo: boolean;
  horario_inicio: string | null;
  horario_fim: string | null;
  notificar_whatsapp: boolean;
  notificacao_enviada: boolean;
  created_at: string;
  updated_at: string;
}

export interface NovoFeriado {
  data: string;
  titulo: string;
  motivo?: string;
  dia_todo?: boolean;
  horario_inicio?: string;
  horario_fim?: string;
  notificar_whatsapp?: boolean;
}

export function useFeriados() {
  return useQuery({
    queryKey: ["feriados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feriados")
        .select("*")
        .order("data", { ascending: true });
      if (error) throw error;
      return data as Feriado[];
    },
  });
}

export function useCreateFeriado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feriado: NovoFeriado) => {
      const { data, error } = await supabase
        .from("feriados")
        .insert(feriado)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({ title: "Feriado cadastrado!", description: "O feriado foi registrado com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao cadastrar feriado", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateFeriado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...feriado }: Partial<Feriado> & { id: string }) => {
      const { data, error } = await supabase
        .from("feriados")
        .update(feriado)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({ title: "Feriado atualizado!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar feriado", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteFeriado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feriados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({ title: "Feriado removido" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover feriado", description: error.message, variant: "destructive" });
    },
  });
}
