import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingGate } from "@/components/OnboardingGate";
import { RoleRoute } from "@/components/RoleRoute";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";

// Route imports - lazy for code splitting, but pre-fetched on idle to keep navigation instant.
const loaders = {
  Login: () => import("./pages/Login"),
  RedefinirSenha: () => import("./pages/RedefinirSenha"),
  Dashboard: () => import("./pages/Dashboard"),
  Alunos: () => import("./pages/Alunos"),
  AlunoPerfil: () => import("./pages/AlunoPerfil"),
  Agenda: () => import("./pages/Agenda"),
  Financeiro: () => import("./pages/Financeiro"),
  HubIA: () => import("./pages/HubIA"),
  Instrumentos: () => import("./pages/Instrumentos"),
  Cursos: () => import("./pages/Cursos"),
  Relatorios: () => import("./pages/Relatorios"),
  Pedagogico: () => import("./pages/Pedagogico"),
  Professores: () => import("./pages/Professores"),
  Configuracoes: () => import("./pages/Configuracoes"),
  Turmas: () => import("./pages/Turmas"),
  Reposicoes: () => import("./pages/Reposicoes"),
  Contratos: () => import("./pages/Contratos"),
  CRM: () => import("./pages/CRM"),
  Confirmacoes: () => import("./pages/Confirmacoes"),
  Cobrancas: () => import("./pages/Cobrancas"),
  Feriados: () => import("./pages/Feriados"),
  NotFound: () => import("./pages/NotFound"),
};
const Login = lazy(loaders.Login);
const RedefinirSenha = lazy(loaders.RedefinirSenha);
const Dashboard = lazy(loaders.Dashboard);
const Alunos = lazy(loaders.Alunos);
const AlunoPerfil = lazy(loaders.AlunoPerfil);
const Agenda = lazy(loaders.Agenda);
const Financeiro = lazy(loaders.Financeiro);
const HubIA = lazy(loaders.HubIA);
const Instrumentos = lazy(loaders.Instrumentos);
const Cursos = lazy(loaders.Cursos);
const Relatorios = lazy(loaders.Relatorios);
const Pedagogico = lazy(loaders.Pedagogico);
const Professores = lazy(loaders.Professores);
const Configuracoes = lazy(loaders.Configuracoes);
const Turmas = lazy(loaders.Turmas);
const Reposicoes = lazy(loaders.Reposicoes);
const Contratos = lazy(loaders.Contratos);
const CRM = lazy(loaders.CRM);
const Confirmacoes = lazy(loaders.Confirmacoes);
const Cobrancas = lazy(loaders.Cobrancas);
const Feriados = lazy(loaders.Feriados);
const NotFound = lazy(loaders.NotFound);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Minimal inline fallback - kept invisible briefly to avoid flashing on fast chunk loads.
const RouteFallback = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-6 h-6 animate-spin text-primary opacity-60" />
  </div>
);

const PagePrefetcher = () => {
  useEffect(() => {
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 1500);
    idle(() => {
      Object.values(loaders).forEach((load) => {
        try { load(); } catch {}
      });
    });
  }, []);
  return null;
};

// Wrapper component for authenticated pages
const AuthenticatedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SidebarProvider>
      <AppLayout>
        <Suspense fallback={<RouteFallback />}>{children}</Suspense>
      </AppLayout>
    </SidebarProvider>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PagePrefetcher />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route
              path="/dashboard"
              element={
                <AuthenticatedPage>
                  <Dashboard />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/alunos"
              element={
                <AuthenticatedPage>
                  <Alunos />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/alunos/:id"
              element={
                <AuthenticatedPage>
                  <AlunoPerfil />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/agenda"
              element={
                <AuthenticatedPage>
                  <Agenda />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/financeiro"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Financeiro />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/hub-ia"
              element={
                <AuthenticatedPage>
                  <HubIA />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/instrumentos"
              element={
                <AuthenticatedPage>
                  <Instrumentos />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/cursos"
              element={
                <AuthenticatedPage>
                  <Cursos />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/relatorios"
              element={
                <AuthenticatedPage>
                  <Relatorios />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/pedagogico"
              element={
                <AuthenticatedPage>
                  <Pedagogico />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/professores"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Professores />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            {/* <Route
              path="/comunicacao"
              element={
                <AuthenticatedPage>
                  <Comunicacao />
                </AuthenticatedPage>
              }
            /> */}
            <Route
              path="/configuracoes"
              element={
                <AuthenticatedPage>
                  <Configuracoes />
                </AuthenticatedPage>
              }
            />
            <Route
              path="/turmas"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria', 'professor']}>
                    <Turmas />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/reposicoes"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria', 'professor']}>
                    <Reposicoes />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/contratos"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Contratos />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/crm"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <CRM />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/confirmacoes"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Confirmacoes />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/cobrancas"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Cobrancas />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route
              path="/feriados"
              element={
                <AuthenticatedPage>
                  <RoleRoute allowedRoles={['admin', 'secretaria']}>
                    <Feriados />
                  </RoleRoute>
                </AuthenticatedPage>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
