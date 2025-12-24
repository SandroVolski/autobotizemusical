import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  hoverMode: boolean;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hoverMode = true;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapsed = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const effectiveCollapsed = hoverMode && !isMobile ? !isHovering : collapsed;

  return (
    <SidebarContext.Provider value={{ 
      collapsed: effectiveCollapsed, 
      setCollapsed, 
      toggleCollapsed,
      hoverMode,
      isHovering,
      setIsHovering,
      isMobile,
      mobileOpen,
      setMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
