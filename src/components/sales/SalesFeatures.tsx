import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Users, Calendar, CreditCard, BarChart3, 
  Brain, Bell, FileText, Music 
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: "Gestão de Alunos",
    description: "Cadastro completo com histórico, progresso e acompanhamento individualizado de cada aluno.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Visualização semanal e mensal com detecção automática de conflitos e otimização de horários.",
    color: "secondary",
  },
  {
    icon: CreditCard,
    title: "Controle Financeiro",
    description: "Cobranças automáticas, lembretes de vencimento e relatórios de inadimplência em tempo real.",
    color: "success",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Métricas de performance, receita, retenção e crescimento em um só lugar.",
    color: "info",
  },
  {
    icon: Brain,
    title: "IA Pedagógica",
    description: "Geração de planos de aula, sugestões de repertório e análise de progresso com inteligência artificial.",
    color: "warning",
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "Alertas automáticos para pagamentos, aulas e comunicados importantes.",
    color: "destructive",
  },
  {
    icon: FileText,
    title: "Relatórios",
    description: "Exporte dados de alunos, financeiro e performance para análise detalhada.",
    color: "primary",
  },
  {
    icon: Music,
    title: "Multi-Instrumento",
    description: "Gerencie cursos de diferentes instrumentos com controle de patrimônio e empréstimos.",
    color: "secondary",
  },
];

export const SalesFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header animation
    gsap.from(headerRef.current, {
      opacity: 0,
      y: 80,
      filter: "blur(20px)",
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Cards zoom in from center
    const cards = gridRef.current?.querySelectorAll(".feature-card");
    if (cards) {
      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          scale: 0.5,
          filter: "blur(15px)",
          rotation: index % 2 === 0 ? -5 : 5,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        });
      });
    }

    // Hover effect setup
    const cards2 = gridRef.current?.querySelectorAll(".feature-card");
    cards2?.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }, { scope: containerRef });

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
      secondary: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/20" },
      success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
      info: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
      warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
      destructive: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Funcionalidades
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Tudo que você{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              precisa
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para gerenciar todos os aspectos da sua escola de música.
          </p>
        </div>

        {/* Features Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {features.map((feature) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={feature.title}
                className={`feature-card p-6 rounded-2xl bg-card/80 backdrop-blur-sm border ${colors.border} hover:shadow-xl transition-shadow duration-300`}
              >
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
