import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { collapsed, toggleCollapsed, isMobile, setMobileOpen } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  useRealtimeNotifications();

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 280);
  const userName = user?.user_metadata?.nome || user?.email?.split("@")[0] || "Usuário";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full-page gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(270_100%_50%/0.08)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(158_100%_50%/0.05)_0%,transparent_50%)]" />
      <AppSidebar />

      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen flex flex-col"
      >
        {/* Header - not sticky, transparent */}
        <header className="z-40 h-14 lg:h-16 bg-transparent">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: Mobile menu */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0 hover:bg-primary/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <NotificationsDropdown variant="icon" />

              <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2.5 pl-1">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold leading-tight">{userName}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Administrador</p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_12px_hsl(270,100%,50%,0.25)] transition-shadow hover:shadow-[0_0_20px_hsl(270,100%,50%,0.4)]">
                  <span className="text-xs lg:text-sm font-bold text-primary-foreground">{initials}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
