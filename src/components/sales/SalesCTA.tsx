import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export const SalesCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(() => {
    // Content zoom in
    gsap.from(contentRef.current, {
      opacity: 0,
      scale: 0.8,
      filter: "blur(20px)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        end: "top 30%",
        scrub: 1,
      },
    });

    // Background parallax
    gsap.to(".cta-bg-element", {
      y: -100,
      rotation: 180,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />
        <div className="cta-bg-element absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="cta-bg-element absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4">
        <div 
          ref={contentRef}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Comece sua transformação hoje
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Pronto para{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              automatizar
            </span>{" "}
            sua escola?
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Junte-se a mais de 500 escolas que já transformaram sua gestão com o Autobotize.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 group shadow-2xl shadow-primary/30"
              onClick={() => navigate("/login")}
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm">14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm">Suporte em português</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm">Dados seguros</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
