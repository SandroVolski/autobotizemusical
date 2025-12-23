import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import HubIA from "./pages/HubIA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for authenticated pages
const AuthenticatedPage = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
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
          {/* Placeholder routes for other menu items */}
          <Route
            path="/instrumentos"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Gestão de Instrumentos</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/cursos"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Gestão de Cursos</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/relatorios"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Relatórios</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/pedagogico"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Gestão Pedagógica</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/professores"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Gestão de Professores</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/comunicacao"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Comunicação</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
              </AuthenticatedPage>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <AuthenticatedPage>
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold">Configurações</h1>
                  <p className="text-muted-foreground">Em desenvolvimento</p>
                </div>
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
