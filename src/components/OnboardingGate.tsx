import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";

/**
 * Redireciona escolas novas (onboarding não concluído) para o wizard,
 * em vez de deixá-las cair num Dashboard vazio.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useOnboarding();
  const location = useLocation();

  if (isLoading || isError) return <>{children}</>;

  if (data && !data.concluido && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
