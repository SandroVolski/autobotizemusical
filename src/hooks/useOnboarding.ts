import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const TOTAL_PASSOS = 6;

export interface OnboardingProgresso {
  id: string;
  user_id: string;
  passo_atual: number;
  concluido: boolean;
  dados_exemplo_criados: boolean;
  rascunho: Record<string, unknown>;
}

/**
 * Progresso do onboarding, persistido no banco (sobrevive a fechar o navegador
 * e a trocar de dispositivo).
 */
export function useOnboarding() {
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["onboarding", user?.id],
    enabled: !loading && !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<OnboardingProgresso> => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("onboarding_progresso")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as OnboardingProgresso;

      // Sem registro: escolas que já possuem configuração são consideradas
      // antigas e não devem ser jogadas no wizard.
      const { data: config } = await supabase
        .from("configuracoes_escola")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const novo = {
        user_id: user.id,
        passo_atual: 1,
        concluido: !!config,
      };

      const { data: inserido, error: insertError } = await supabase
        .from("onboarding_progresso")
        .upsert(novo, { onConflict: "user_id" })
        .select()
        .single();

      if (insertError) throw insertError;
      return inserido as unknown as OnboardingProgresso;
    },
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (patch: Partial<Pick<OnboardingProgresso, "passo_atual" | "concluido" | "dados_exemplo_criados" | "rascunho">>) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("onboarding_progresso")
        .upsert({ user_id: user.id, ...patch } as never, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["onboarding", user?.id], data);
    },
  });
}
