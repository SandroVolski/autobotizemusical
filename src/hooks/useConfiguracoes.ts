import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface HorarioFuncionamento {
  inicio: string;
  fim: string;
}

export interface ConfiguracoesEscola {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logo_url: string | null;
  descricao: string | null;
  horario_funcionamento: Record<string, HorarioFuncionamento> | null;
  created_at: string;
  updated_at: string;
}

export interface AtualizarConfiguracoes {
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  logo_url?: string;
  descricao?: string;
  horario_funcionamento?: Json;
}

export function useConfiguracoes() {
  return useQuery({
    queryKey: ["configuracoes_escola"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_escola")
        .select("*")
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        horario_funcionamento: data.horario_funcionamento as unknown as Record<string, HorarioFuncionamento> | null
      } as ConfiguracoesEscola;
    },
  });
}

export function useUpdateConfiguracoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configuracoes: AtualizarConfiguracoes) => {
      // Primeiro, buscar o ID da configuração existente
      const { data: existing } = await supabase
        .from("configuracoes_escola")
        .select("id")
        .single();
      
      if (!existing) {
        // Se não existir, criar
        const { data, error } = await supabase
          .from("configuracoes_escola")
          .insert([configuracoes])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Atualizar existente
      const { data, error } = await supabase
        .from("configuracoes_escola")
        .update(configuracoes)
        .eq("id", existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes_escola"] });
      toast({
        title: "Configurações salvas!",
        description: "As configurações da escola foram atualizadas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
