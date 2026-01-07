import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalidate queries to refresh notification count
          queryClient.invalidateQueries({ queryKey: ["notificacoes"] });

          // Show toast for new notification
          const notification = payload.new as {
            titulo: string;
            mensagem?: string;
            tipo?: string;
          };

          toast({
            title: notification.titulo,
            description: notification.mensagem || undefined,
            variant: notification.tipo === "erro" ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
