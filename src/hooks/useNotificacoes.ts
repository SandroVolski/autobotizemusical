import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Notificacao {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string | null;
  tipo: string;
  lida: boolean;
  link: string | null;
  created_at: string;
}

export function useNotificacoes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Notificacao[];
    },
    enabled: !!user,
  });
}

export function useNotificacoesNaoLidas() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["notificacoes", "nao-lidas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .eq("lida", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Notificacao[];
    },
    enabled: !!user,
  });
}

export function useMarcarComoLida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });
}

export function useMarcarTodasComoLidas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("user_id", user.id)
        .eq("lida", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      toast({
        title: "Notificações marcadas como lidas",
      });
    },
  });
}
