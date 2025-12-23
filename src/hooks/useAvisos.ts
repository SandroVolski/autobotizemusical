import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  destinatarios: string;
  turma_id: string | null;
  enviado_email: boolean;
  enviado_whatsapp: boolean;
  created_at: string;
}

export interface NovoAviso {
  titulo: string;
  mensagem: string;
  destinatarios?: string;
  turma_id?: string;
  enviado_email?: boolean;
  enviado_whatsapp?: boolean;
}

export function useAvisos() {
  return useQuery({
    queryKey: ["avisos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Aviso[];
    },
  });
}

export function useCreateAviso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aviso: NovoAviso) => {
      const { data, error } = await supabase
        .from("avisos")
        .insert(aviso)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
      toast({
        title: "Aviso enviado!",
        description: "O aviso foi enviado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar aviso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAviso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("avisos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
      toast({
        title: "Aviso removido",
        description: "O aviso foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover aviso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
