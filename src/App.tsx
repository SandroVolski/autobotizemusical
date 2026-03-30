import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import LandingPage from "./pages/LandingPage";
import SalesLandingPage from "./pages/SalesLandingPage";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import AlunoPerfil from "./pages/AlunoPerfil";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import HubIA from "./pages/HubIA";
import Instrumentos from "./pages/Instrumentos";
import Cursos from "./pages/Cursos";
import Relatorios from "./pages/Relatorios";
import Pedagogico from "./pages/Pedagogico";
import Professores from "./pages/Professores";
// import Comunicacao from "./pages/Comunicacao";
import Configuracoes from "./pages/Configuracoes";
import Turmas from "./pages/Turmas";
import Reposicoes from "./pages/Reposicoes";
import Contratos from "./pages/Contratos";
import CRM from "./pages/CRM";
import Confirmacoes from "./pages/Confirmacoes";
import Cobrancas from "./pages/Cobrancas";
import Feriados from "./pages/Feriados";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landingpage" element={<SalesLandingPage />} />
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
                  <RoleRoute allowedRoles={['admin']}>
                    <Configuracoes />
                  </RoleRoute>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
