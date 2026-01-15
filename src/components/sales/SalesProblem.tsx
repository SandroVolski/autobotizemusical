import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Clock, FileX, Calculator, Users, AlertTriangle, TrendingDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    icon: Clock,
    title: "Horas Perdidas",
    description: "Você gasta mais tempo com planilhas do que ensinando música.",
    stat: "15h/semana",
  },
  {
    icon: FileX,
    title: "Dados Desorganizados",
    description: "Informações de alunos espalhadas em cadernos e arquivos.",
    stat: "40% erro",
  },
  {
    icon: Calculator,
    title: "Cobranças Manuais",
    description: "Inadimplência alta por falta de lembretes automáticos.",
    stat: "25% perda",
  },
  {
    icon: Users,
    title: "Alunos Evadindo",
    description: "Sem acompanhamento, você perde alunos sem entender o porquê.",
    stat: "30% evasão",
  },
  {
    icon: AlertTriangle,
    title: "Conflitos de Agenda",
    description: "Aulas sobrepostas e professores sem visibilidade de horários.",
    stat: "5x/mês",
  },
  {
    icon: TrendingDown,
    title: "Crescimento Limitado",
    description: "Sem dados, não consegue tomar decisões para crescer.",
    stat: "Estagnado",
  },
];

export const SalesProblem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Heading animation - rápida
    gsap.from(headingRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    // Cards stagger animation - mais rápida
    const cards = cardsRef.current?.querySelectorAll(".problem-card");
    if (cards && cards.length > 0) {
      gsap.set(cards, { opacity: 1, y: 0 }); // Garantir estado inicial
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
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
      <div className="problem-bg absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/10 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20">
          <span className="text-destructive font-semibold text-sm uppercase tracking-wider mb-4 block">
            O Problema
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Sua escola está{" "}
            <span className="text-destructive">sangrando dinheiro</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enquanto você luta com tarefas administrativas, sua concorrência está automatizando tudo.
          </p>
        </div>

        {/* Problem Cards */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="problem-card group p-6 rounded-2xl bg-card/50 border border-destructive/10 hover:border-destructive/30 transition-all duration-500 hover:shadow-lg hover:shadow-destructive/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform duration-300">
                  <problem.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{problem.title}</h3>
                    <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">
                      {problem.stat}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
