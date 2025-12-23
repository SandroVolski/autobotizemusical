import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Alunos", path: "/alunos", badge: 142 },
  { icon: Music, label: "Instrumentos", path: "/instrumentos" },
  { icon: BookOpen, label: "Cursos", path: "/cursos" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro", badge: 5 },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: GraduationCap, label: "Pedagógico", path: "/pedagogico" },
  { icon: Bot, label: "Hub IA", path: "/hub-ia", badge: "Novo" },
  { icon: UserCog, label: "Professores", path: "/professores" },
  { icon: MessageSquare, label: "Comunicação", path: "/comunicacao" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50"
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-foreground whitespace-nowrap">Sandro Volski</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Escola de Música</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-secondary"
                  )} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 whitespace-nowrap text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <Badge 
                      variant={typeof item.badge === "string" ? "glow" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {collapsed && item.badge && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <Bell className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Notificações</span>}
          {!collapsed && <Badge variant="destructive" className="ml-auto">3</Badge>}
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
