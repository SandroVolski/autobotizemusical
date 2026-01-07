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
  user_id: string | null;
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
  logo_url?: string | null;
  descricao?: string;
  horario_funcionamento?: Json;
}

export function useConfiguracoes() {
  return useQuery({
    queryKey: ["configuracoes_escola"],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Fetch user's own config
      const { data, error } = await supabase
        .from("configuracoes_escola")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return null if no config exists yet (will be created on first save)
      if (!data) return null;
      
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Check if user already has a config
      const { data: existing, error: fetchError } = await supabase
        .from("configuracoes_escola")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching existing config:", fetchError);
        throw fetchError;
      }
      
      if (!existing) {
        // Create new config for this user
        const insertData = {
          nome: configuracoes.nome || "Minha Escola de Música",
          user_id: user.id,
          ...configuracoes,
        };
        
        const { data, error } = await supabase
          .from("configuracoes_escola")
          .insert([insertData])
          .select()
          .single();
        
        if (error) {
          console.error("Error inserting config:", error);
          throw error;
        }
        return data;
      }
      
      // Update existing config
      const { data, error } = await supabase
        .from("configuracoes_escola")
        .update({
          ...configuracoes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("user_id", user.id) // Extra safety check
        .select()
        .single();
      
      if (error) {
        console.error("Error updating config:", error);
        throw error;
      }
      
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
      console.error("Mutation error:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
