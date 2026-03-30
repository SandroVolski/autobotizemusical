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
  ChevronDown,
  CalendarOff,
  MessageCircle,
  Receipt,
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
import { useState } from "react";

interface MenuGroup {
  label: string;
  items: { icon: any; label: string; path: string; badgeKey?: string }[];
  collapsible?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    label: "Visão Geral",
    collapsible: false,
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Calendar, label: "Agenda", path: "/agenda" },
    ],
  },
  {
    label: "Comunicação",
    collapsible: true,
    items: [
      { icon: MessageSquare, label: "Confirmações", path: "/confirmacoes" },
      { icon: Receipt, label: "Cobranças", path: "/cobrancas" },
      { icon: CalendarOff, label: "Feriados", path: "/feriados" },
    ],
  },
  {
    label: "Secretaria",
    collapsible: true,
    items: [
      { icon: Users, label: "Alunos", path: "/alunos", badgeKey: "alunos" },
      { icon: UsersRound, label: "Turmas", path: "/turmas" },
      { icon: BookOpen, label: "Cursos", path: "/cursos" },
      { icon: UserCog, label: "Professores", path: "/professores" },
      { icon: Music, label: "Instrumentos", path: "/instrumentos" },
    ],
  },
  {
    label: "Pedagógico",
    collapsible: true,
    items: [
      { icon: GraduationCap, label: "Pedagógico", path: "/pedagogico" },
      { icon: RefreshCw, label: "Reposições", path: "/reposicoes" },
    ],
  },
  {
    label: "Administrativo",
    collapsible: true,
    items: [
      { icon: DollarSign, label: "Financeiro", path: "/financeiro", badgeKey: "financeiro" },
      { icon: FileText, label: "Contratos", path: "/contratos" },
      { icon: UserPlus, label: "Captação", path: "/crm" },
    ],
  },
  {
    label: "Inteligência",
    collapsible: true,
    items: [
      { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      { icon: Bot, label: "Hub IA", path: "/hub-ia" },
    ],
  },
  {
    label: "Sistema",
    collapsible: false,
    items: [
      { icon: Settings, label: "Configurações", path: "/configuracoes" },
    ],
  },
];
export function AppSidebar() {
  const { collapsed, toggleCollapsed, isMobile, mobileOpen, setMobileOpen, setIsHovering, hoverMode } = useSidebar();
  const { signOut } = useAuth();
  const location = useLocation();

  const { data: alunos } = useAlunos();
  const { data: pagamentos } = usePagamentos();
  const { data: configuracoes } = useConfiguracoes();

  const badgeValues: Record<string, number | undefined> = {
    alunos: alunos?.filter((a) => a.status === "ativo").length,
    financeiro: pagamentos?.filter((p) => p.status === "pendente").length,
  };

  // Track which groups are open — auto-open group containing active route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuGroups.forEach(g => { if (g.collapsible) initial[g.label] = true; });
    return initial;
  });

  const isGroupOpen = (group: MenuGroup) => {
    if (!group.collapsible) return true;
    if (openGroups[group.label] !== undefined) return openGroups[group.label];
    // Auto-open if active route is in the group
    return group.items.some((item) => location.pathname === item.path);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !isGroupOpen(menuGroups.find((g) => g.label === label)!) }));
  };

  const handleSignOut = async () => { await signOut(); };
  const handleNavClick = () => { if (isMobile) setMobileOpen(false); };

  const renderNavItem = (item: typeof menuGroups[0]["items"][0], showLabel: boolean) => {
    const isActive = location.pathname === item.path;
    const badgeValue = item.badgeKey ? badgeValues[item.badgeKey] : undefined;

    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          onClick={handleNavClick}
          className={cn(
            "flex items-center rounded-lg transition-all duration-200 group relative text-sm h-10 px-3 gap-3",
            collapsed && !isMobile && "justify-center overflow-hidden",
            isActive
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          )}
        >
          <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-secondary")} />
          {showLabel && (
            <span className="flex-1 whitespace-nowrap text-[13px]">{item.label}</span>
          )}
          {showLabel && badgeValue !== undefined && badgeValue !== 0 && (
            <Badge variant="secondary" className="text-xs">{badgeValue}</Badge>
          )}
        </NavLink>
      </li>
    );
  };

  const renderGroups = (showLabel: boolean) => (
    <nav className={cn("flex-1 py-2 px-2 transition-all duration-200", collapsed && !isMobile ? "overflow-hidden" : "overflow-y-auto")}>
      <div className="space-y-0">
        {menuGroups.map((group) => {
          const open = isGroupOpen(group);
          return (
            <div key={group.label}>
              {/* Group header — same height in both modes for vertical alignment */}
              {group.collapsible ? (
                <button
                  onClick={() => showLabel ? toggleGroup(group.label) : undefined}
                  className={cn(
                    "flex items-center w-full h-8 transition-colors",
                    showLabel
                      ? "justify-between px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground"
                      : "justify-center"
                  )}
                >
                  {showLabel ? (
                    <>
                      {group.label}
                      <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
                    </>
                  ) : (
                    <div className="w-5 h-px bg-sidebar-border" />
                  )}
                </button>
              ) : (
                <div
                  className={cn(
                    "flex items-center h-8",
                    showLabel
                      ? "px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                      : "justify-center"
                  )}
                >
                  {showLabel ? group.label : <div className="w-5 h-px bg-sidebar-border" />}
                </div>
              )}
              {(open || !showLabel) && (
                <ul className="space-y-0.5">
                  {group.items.map((item) => renderNavItem(item, showLabel))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );

  const renderLogo = (showLabel: boolean) => (
    <div className="border-b border-sidebar-border p-4 h-[72px] flex items-center">
      <div className="flex items-center gap-3">
        {configuracoes?.logo_url ? (
          <img src={configuracoes.logo_url} alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
        ) : (
          <img src={autobotizeLogo} alt="Autobotize" className="w-10 h-10 object-contain flex-shrink-0 rounded-sm" />
        )}
        {showLabel && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-foreground whitespace-nowrap">Autobotize</h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Gestão Musical</p>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50"
            >
              <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {configuracoes?.logo_url ? (
                    <img src={configuracoes.logo_url} alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
                  ) : (
                    <img src={autobotizeLogo} alt="Autobotize" className="w-10 h-10 object-contain flex-shrink-0" />
                  )}
                  <div>
                    <h1 className="font-bold text-foreground whitespace-nowrap">{configuracoes?.nome || "Escola de Música"}</h1>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Gestão Musical</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {renderGroups(true)}
              <div className="p-3 border-t border-sidebar-border">
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50"
      onMouseEnter={() => hoverMode && setIsHovering(true)}
      onMouseLeave={() => hoverMode && setIsHovering(false)}
    >
      {renderLogo(!collapsed)}
      {renderGroups(!collapsed)}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive overflow-hidden h-10 px-3"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
