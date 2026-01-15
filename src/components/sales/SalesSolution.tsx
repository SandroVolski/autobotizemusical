import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, Zap, Bot, Shield } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const solutions = [
  "Gestão completa de alunos e matrículas",
  "Agenda inteligente com detecção de conflitos",
  "Cobranças automáticas e lembretes",
  "Dashboard com métricas em tempo real",
  "Assistente de IA para planos de aula",
  "Controle de presença simplificado",
  "Relatórios financeiros detalhados",
  "Notificações e avisos automatizados",
];

export const SalesSolution = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Left content reveal
    gsap.from(leftRef.current, {
      opacity: 0,
      x: -100,
      filter: "blur(15px)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        end: "top 30%",
        scrub: 1,
      },
    });

    // Right content reveal
    gsap.from(rightRef.current, {
      opacity: 0,
      x: 100,
      filter: "blur(15px)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        end: "top 30%",
        scrub: 1,
      },
    });

    // Floating elements
    gsap.to(floatingRef.current, {
      y: -30,
      rotation: 5,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    // Check items stagger
    const items = leftRef.current?.querySelectorAll(".solution-item");
    if (items) {
      gsap.from(items, {
        opacity: 0,
        x: -30,
        stagger: 0.1,
        scrollTrigger: {
          trigger: leftRef.current,
          start: "top 60%",
          end: "center center",
          scrub: 1,
        },
      });
    }
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div ref={leftRef}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              A Solução
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conheça o{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Autobotize
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              O sistema completo que automatiza sua escola de música, 
              liberando você para fazer o que ama: ensinar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solutions.map((solution, index) => (
                <div 
                  key={solution} 
                  className="solution-item flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{solution}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div ref={rightRef} className="relative">
            <div 
              ref={floatingRef}
              className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-8 border border-primary/20 shadow-2xl shadow-primary/10"
            >
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-2xl blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-2xl blur-xl" />
              
              {/* Feature highlights */}
              <div className="relative space-y-6">
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Automação Inteligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Reduza 70% do trabalho manual
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="p-3 bg-secondary/20 rounded-xl">
                    <Bot className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">IA Pedagógica</h4>
                    <p className="text-sm text-muted-foreground">
                      Planos de aula personalizados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="p-3 bg-success/20 rounded-xl">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Dados Seguros</h4>
                    <p className="text-sm text-muted-foreground">
                      Criptografia de ponta a ponta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
