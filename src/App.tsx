import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import HubIA from "./pages/HubIA";
import Instrumentos from "./pages/Instrumentos";
import Cursos from "./pages/Cursos";
import Relatorios from "./pages/Relatorios";
import Pedagogico from "./pages/Pedagogico";
import Professores from "./pages/Professores";
import Comunicacao from "./pages/Comunicacao";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for authenticated pages
const AuthenticatedPage = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <AppLayout>{children}</AppLayout>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
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
                <Financeiro />
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
                <Professores />
              </AuthenticatedPage>
            }
          />
          <Route
            path="/comunicacao"
            element={
              <AuthenticatedPage>
                <Comunicacao />
              </AuthenticatedPage>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <AuthenticatedPage>
                <Configuracoes />
              </AuthenticatedPage>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
