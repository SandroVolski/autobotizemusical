import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";

const Login = lazy(() => import("./pages/Login"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Alunos = lazy(() => import("./pages/Alunos"));
const AlunoPerfil = lazy(() => import("./pages/AlunoPerfil"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const HubIA = lazy(() => import("./pages/HubIA"));
const Instrumentos = lazy(() => import("./pages/Instrumentos"));
const Cursos = lazy(() => import("./pages/Cursos"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Pedagogico = lazy(() => import("./pages/Pedagogico"));
const Professores = lazy(() => import("./pages/Professores"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Turmas = lazy(() => import("./pages/Turmas"));
const Reposicoes = lazy(() => import("./pages/Reposicoes"));
const Contratos = lazy(() => import("./pages/Contratos"));
const CRM = lazy(() => import("./pages/CRM"));
const Confirmacoes = lazy(() => import("./pages/Confirmacoes"));
const Cobrancas = lazy(() => import("./pages/Cobrancas"));
const Feriados = lazy(() => import("./pages/Feriados"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Wrapper component for authenticated pages
const AuthenticatedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SidebarProvider>
      <AppLayout>{children}</AppLayout>
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
