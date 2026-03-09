import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Music,
  BookOpen,
  DollarSign,
  Calendar,
  BarChart3,
  GraduationCap,
  Bot,
  UserCog,
  MessageSquare,
  Settings,
  LogOut,
  X,
  UsersRound,
  RefreshCw,
  FileText,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import autobotizeLogo from "@/assets/autobotize-logo-4.webp";

const menuItems = [
{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
{ icon: Users, label: "Alunos", path: "/alunos", badgeKey: "alunos" },
{ icon: UsersRound, label: "Turmas", path: "/turmas" },
{ icon: Music, label: "Instrumentos", path: "/instrumentos" },
{ icon: BookOpen, label: "Cursos", path: "/cursos" },
{ icon: DollarSign, label: "Financeiro", path: "/financeiro", badgeKey: "financeiro" },
{ icon: Calendar, label: "Agenda", path: "/agenda" },
{ icon: RefreshCw, label: "Reposições", path: "/reposicoes" },
{ icon: BarChart3, label: "Relatórios", path: "/relatorios" },
{ icon: GraduationCap, label: "Pedagógico", path: "/pedagogico" },
{ icon: FileText, label: "Contratos", path: "/contratos" },
{ icon: UserPlus, label: "Captação", path: "/crm" },
{ icon: Bot, label: "Hub IA", path: "/hub-ia" },
{ icon: UserCog, label: "Professores", path: "/professores" },
// { icon: MessageSquare, label: "Comunicação", path: "/comunicacao" },
{ icon: Settings, label: "Configurações", path: "/configuracoes" }];


export function AppSidebar() {
  const { collapsed, toggleCollapsed, isMobile, mobileOpen, setMobileOpen, setIsHovering, hoverMode } = useSidebar();
  const { signOut } = useAuth();
  const location = useLocation();

  const { data: alunos } = useAlunos();
  const { data: pagamentos } = usePagamentos();
  const { data: configuracoes } = useConfiguracoes();

  const badgeValues: Record<string, number | undefined> = {
    alunos: alunos?.length,
    financeiro: pagamentos?.filter((p) => p.status === "pendente").length
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <AnimatePresence>
          {mobileOpen &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)} />

          }
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen &&
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50">
            
              {/* Logo */}
              <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {configuracoes?.logo_url ?
                <img
                  src={configuracoes.logo_url}
                  alt="Logo"
                  className="w-10 h-10 object-contain flex-shrink-0" /> :


                <img
                  src={autobotizeLogo}
                  alt="Autobotize"
                  className="w-10 h-10 object-contain flex-shrink-0" />

                }
                  <div>
                    <h1 className="font-bold text-foreground whitespace-nowrap">
                      {configuracoes?.nome || "Escola de Música"}
                    </h1>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Gestão Musical</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 overflow-y-auto">
                <ul className="space-y-1">
                  {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const badgeValue = item.badgeKey ? badgeValues[item.badgeKey] : item.badge;

                  return (
                    <li key={item.path}>
                        <NavLink
                        to={item.path}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                          isActive ?
                          "bg-primary/20 text-primary border border-primary/30" :
                          "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                        )}>
                        
                          <item.icon className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive ? "text-primary" : "group-hover:text-secondary"
                        )} />
                          <span className="flex-1 whitespace-nowrap text-sm font-medium">
                            {item.label}
                          </span>
                          {badgeValue !== undefined && badgeValue !== 0 &&
                        <Badge
                          variant={typeof badgeValue === "string" ? "glow" : "secondary"}
                          className="text-xs">
                          
                              {badgeValue}
                            </Badge>
                        }
                        </NavLink>
                      </li>);

                })}
                </ul>
              </nav>

              {/* Bottom section */}
              <div className="p-3 border-t border-sidebar-border space-y-2">
                <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
                
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </Button>
              </div>
            </motion.aside>
          }
        </AnimatePresence>
      </>);

  }

  // Desktop sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50"
      onMouseEnter={() => hoverMode && setIsHovering(true)}
      onMouseLeave={() => hoverMode && setIsHovering(false)}>
      
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {configuracoes?.logo_url ?
          <img
            src={configuracoes.logo_url}
            alt="Logo"
            className="w-10 h-10 object-contain flex-shrink-0" /> :


          <img
            src={autobotizeLogo}
            alt="Autobotize"
            className="w-10 h-10 object-contain flex-shrink-0 rounded-sm" />

          }
          <AnimatePresence>
            {!collapsed &&
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden">
              
                <h1 className="font-bold text-foreground whitespace-nowrap">
                  {configuracoes?.nome || "Escola de Música"}
                </h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Gestão Musical</p>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 p-3 transition-all duration-200",
        collapsed ? "overflow-hidden" : "overflow-y-auto"
      )}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const badgeValue = item.badgeKey ? badgeValues[item.badgeKey] : item.badge;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive ?
                    "bg-primary/20 text-primary border border-primary/30" :
                    "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}>
                  
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-secondary"
                  )} />
                  <AnimatePresence>
                    {!collapsed &&
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 whitespace-nowrap text-sm font-medium">
                      
                        {item.label}
                      </motion.span>
                    }
                  </AnimatePresence>
                  {!collapsed && badgeValue !== undefined && badgeValue !== 0 &&
                  <Badge
                    variant={typeof badgeValue === "string" ? "glow" : "secondary"}
                    className="text-xs">
                    
                      {badgeValue}
                    </Badge>
                  }
                  {collapsed && badgeValue !== undefined && badgeValue !== 0 &&
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
                  }
                </NavLink>
              </li>);

          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center"
          )}>
          
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </motion.aside>);

}