import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export const SalesHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(() => {
    const tl = gsap.timeline();

    // Initial animations - faster durations
    tl.from(headingRef.current, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: "power3.out",
    })
    .from(subRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.out",
    }, "-=0.4")
    .from(ctaRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "back.out(1.7)",
    }, "-=0.3")
    .from(statsRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power3.out",
    }, "-=0.2");

    // Parallax effect on scroll - only background moves
    gsap.to(bgRef.current, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div ref={bgRef} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Sistema #1 para Escolas de Música
          </span>
        </div>

        <h1 
          ref={headingRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
        >
          <span className="block text-foreground">Transforme sua</span>
          <span className="block bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Escola de Música
          </span>
          <span className="block text-foreground">em uma Máquina</span>
        </h1>

        <p 
          ref={subRef}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12"
        >
          Automatize 70% das tarefas administrativas. Foque no que realmente importa: 
          <span className="text-foreground font-semibold"> ensinar música.</span>
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300 group"
            onClick={() => navigate("/login")}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
          >
            Ver Demonstração
          </Button>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { value: "500+", label: "Escolas" },
            { value: "25k+", label: "Alunos" },
            { value: "98%", label: "Satisfação" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
