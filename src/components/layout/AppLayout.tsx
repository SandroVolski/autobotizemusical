import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";
import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/contexts/SidebarContext";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { collapsed, toggleCollapsed, isMobile, setMobileOpen } = useSidebar();
  
  // Enable realtime notifications
  useRealtimeNotifications();

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 280);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      {/* Main content area */}
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 lg:h-16 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden flex-shrink-0"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="relative max-w-md flex-1 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alunos, aulas, pagamentos..."
                  className="pl-10 bg-muted/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <NotificationsDropdown variant="icon" />
              
              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-border">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">Sandro Volski</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
