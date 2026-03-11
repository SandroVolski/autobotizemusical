import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { collapsed, toggleCollapsed, isMobile, setMobileOpen } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light"));

  const handleThemeToggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  useRealtimeNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sidebarWidth = isMobile ? 0 : collapsed ? 72 : 280;
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
          width: `calc(100% - ${sidebarWidth}px)`
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen flex flex-col">
        
        {/* Header - sticky, transparent at top, gradient on scroll */}
        <header className={cn(
          "sticky top-0 z-40 h-14 lg:h-16 transition-all duration-500 ease-in-out border-b",
          scrolled ?
          "bg-background/80 backdrop-blur-xl border-border/50 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.1)]" :
          "bg-transparent border-transparent"
        )}>
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left: Mobile menu */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0 hover:bg-primary/10"
                onClick={() => setMobileOpen(true)}>
                
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <NotificationsDropdown variant="icon" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="relative w-9 h-9 overflow-hidden hover:bg-primary/10">
                
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ?
                  <motion.div
                    key="moon"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    
                      <Moon className="w-[18px] h-[18px] text-white" />
                    </motion.div> :

                  <motion.div
                    key="sun"
                    initial={{ y: -20, opacity: 0, rotate: 90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    
                      <Sun className="w-[18px] h-[18px] text-[#1a1a1a]" />
                    </motion.div>
                  }
                </AnimatePresence>
              </Button>

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
    </div>);

}