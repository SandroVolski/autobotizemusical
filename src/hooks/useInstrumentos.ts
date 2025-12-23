import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Instrumento {
  id: string;
  nome: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  localizacao: string | null;
  valor_patrimonio: number | null;
  status: string;
  emprestado_para: string | null;
  data_emprestimo: string | null;
  ultima_manutencao: string | null;
  proxima_manutencao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NovoInstrumento {
  nome: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  localizacao?: string;
  valor_patrimonio?: number;
  status?: string;
}

export function useInstrumentos() {
  return useQuery({
    queryKey: ["instrumentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instrumentos")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data as Instrumento[];
    },
  });
}

export function useCreateInstrumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instrumento: NovoInstrumento) => {
      const { data, error } = await supabase
        .from("instrumentos")
        .insert(instrumento)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrumentos"] });
      toast({
        title: "Instrumento cadastrado!",
        description: "O instrumento foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar instrumento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInstrumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...instrumento }: Partial<Instrumento> & { id: string }) => {
      const { data, error } = await supabase
        .from("instrumentos")
        .update(instrumento)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrumentos"] });
      toast({
        title: "Instrumento atualizado!",
        description: "Os dados do instrumento foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar instrumento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteInstrumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("instrumentos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instrumentos"] });
      toast({
        title: "Instrumento removido",
        description: "O instrumento foi removido do patrimônio.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover instrumento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
