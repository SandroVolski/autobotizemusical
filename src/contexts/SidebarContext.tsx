import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  hoverMode: boolean;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true); // Start collapsed
  const [isHovering, setIsHovering] = useState(false);
  const hoverMode = true; // Always use hover mode

  const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), []);

  // In hover mode, sidebar expands when hovering
  const effectiveCollapsed = hoverMode ? !isHovering : collapsed;

  return (
    <SidebarContext.Provider value={{ 
      collapsed: effectiveCollapsed, 
      setCollapsed, 
      toggleCollapsed,
      hoverMode,
      isHovering,
      setIsHovering
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
