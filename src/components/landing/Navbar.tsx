import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import autobotizeLogo from "@/assets/autobotize-logo.webp";

const navLinks = [
  { label: "Recursos", href: "#recursos-premium" },
  { label: "Sobre", href: "#depoimentos" },
  { label: "Preços", href: "#pricing-section" },
  { label: "Contato", href: "#contato-especialista" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStartHovered, setIsStartHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${
          isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <img src={autobotizeLogo} alt="Autobotize — Gestão de Escolas de Música" className="w-10 h-10 rounded-xl object-cover" />
              <span className="font-bold text-xl">Autobotize</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Entrar
              </Button>
              <Button
                onClick={() => handleNavClick("#pricing-section")}
                onMouseEnter={() => setIsStartHovered(true)}
                onMouseLeave={() => setIsStartHovered(false)}
                className="relative overflow-hidden min-w-[120px] transition-all duration-300"
              >
                <span
                  className={`transition-all duration-300 ${isStartHovered ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}
                >
                  Começar
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isStartHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  Vamos lá!
                </span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label={isMobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
              className="md:hidden relative z-[210] p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Top Down */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[195] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel - Top Down */}
            <motion.div
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 right-0 z-[205] bg-background border-b border-border shadow-2xl md:hidden"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <div className="flex items-center gap-2">
                  <img src={autobotizeLogo} alt="Autobotize — Gestão de Escolas de Música" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="font-bold text-lg">Autobotize</span>
                </div>
                <button
                  aria-label="Fechar menu de navegação"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleNavClick(link.href)}
                    className="flex items-center justify-between w-full p-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all group"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </motion.button>
                ))}
              </nav>

              {/* Divider */}
              <div className="mx-4 h-px bg-border" />

              {/* CTA Buttons */}
              <div className="p-4 flex gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full h-11"
                  >
                    Entrar
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <Button onClick={() => handleNavClick("#pricing-section")} className="w-full h-11 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Começar
                  </Button>
                </motion.div>
              </div>

              {/* Footer tagline */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
