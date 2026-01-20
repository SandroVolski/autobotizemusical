import { motion } from "framer-motion";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Brain, 
  BookOpen, 
  Bell,
  BarChart3,
  Music2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: "Gestão de Alunos",
    description: "Cadastro completo, histórico de matrículas, progresso individual e comunicação direta.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Agendamento automático, controle de presença e sincronização com calendários externos.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: CreditCard,
    title: "Controle Financeiro",
    description: "Mensalidades, cobranças automáticas, relatórios de inadimplência e projeções.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Brain,
    title: "IA Pedagógica",
    description: "Sugestões de repertório, planos de aula personalizados e análise de evolução.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: BookOpen,
    title: "Material Didático",
    description: "Biblioteca digital, partituras, vídeo-aulas e recursos compartilhados.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Bell,
    title: "Comunicação",
    description: "Avisos automáticos, lembretes de aulas e notificações personalizadas.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: BarChart3,
    title: "Relatórios Avançados",
    description: "Dashboards em tempo real, métricas de desempenho e insights acionáveis.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Music2,
    title: "Multi-instrumentos",
    description: "Suporte a todos os instrumentos com configurações específicas para cada um.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

export const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const revealTextRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!revealTextRef.current || !maskRef.current) return;

    // Scroll reveal effect - left to right
    gsap.to(maskRef.current, {
      width: "0%",
      ease: "none",
      scrollTrigger: {
        trigger: revealTextRef.current,
        start: "top 80%",
        end: "top 30%",
        scrub: 1,
      },
    });
  }, { scope: sectionRef });

  return (
    <section id="recursos" className="py-24 relative" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Section Header with Scroll Reveal */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary font-medium text-sm uppercase tracking-wider"
          >
            Recursos
          </motion.span>
          
          {/* Scroll Reveal Container */}
          <div ref={revealTextRef} className="relative mt-4 mb-6 overflow-hidden">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Tudo o que precisa em{" "}
              <span className="gradient-text">um só lugar</span>
            </h2>
            {/* Mask overlay that shrinks from right to left */}
            <div 
              ref={maskRef}
              className="absolute top-0 right-0 h-full w-full bg-background pointer-events-none"
              style={{ width: "100%" }}
            />
          </div>
          
          <div className="relative overflow-hidden">
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas projetadas especificamente para escolas de música,
              integrando gestão, pedagogia e tecnologia.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full glass glass-hover group cursor-default">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
