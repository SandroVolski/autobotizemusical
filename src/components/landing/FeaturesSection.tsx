import { motion } from "framer-motion";
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
  return (
    <section id="recursos" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Recursos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Tudo que você precisa em{" "}
            <span className="gradient-text">um só lugar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ferramentas poderosas projetadas especificamente para escolas de música,
            integrando gestão, pedagogia e tecnologia.
          </p>
        </motion.div>

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
