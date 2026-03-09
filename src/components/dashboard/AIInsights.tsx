import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, TrendingDown, AlertTriangle, Lightbulb, ChevronRight, Users, DollarSign } from "lucide-react";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { useNavigate } from "react-router-dom";

export function AIInsights() {
  const navigate = useNavigate();
  const { data: alunos } = useAlunos();
  const { data: pagamentos } = usePagamentos();
  const { data: aulas } = useAulas();

  // Generate real insights based on data
  const insights = [];

  // Check for inactive students
  const alunosInativos = alunos?.filter(a => a.status === "inativo").length || 0;
  if (alunosInativos > 0) {
    insights.push({
      id: 1,
      type: "warning",
      icon: AlertTriangle,
      title: "Alunos Inativos",
      description: `${alunosInativos} aluno(s) estão inativos. Considere entrar em contato para reativação.`,
      action: "Ver alunos",
      route: "/alunos",
    });
  }

  // Check for overdue payments
  const pagamentosAtrasados = pagamentos?.filter(p => p.status === "atrasado").length || 0;
  if (pagamentosAtrasados > 0) {
    insights.push({
      id: 2,
      type: "trend",
      icon: DollarSign,
      title: "Pagamentos Atrasados",
      description: `${pagamentosAtrasados} pagamento(s) em atraso. Acione a cobrança.`,
      action: "Ver financeiro",
      route: "/financeiro",
    });
  }

  // Check for few classes scheduled
  const totalAulas = aulas?.length || 0;
  if (totalAulas < 5) {
    insights.push({
      id: 3,
      type: "suggestion",
      icon: Lightbulb,
      title: "Poucas Aulas Agendadas",
      description: `Apenas ${totalAulas} aula(s) na agenda. Agende mais aulas para seus alunos.`,
      action: "Ver agenda",
      route: "/agenda",
    });
  }

  // Check for low student count
  const totalAlunos = alunos?.length || 0;
  if (totalAlunos < 3) {
    insights.push({
      id: 4,
      type: "trend",
      icon: Users,
      title: "Poucos Alunos Cadastrados",
      description: `Sua escola tem apenas ${totalAlunos} aluno(s). Considere campanhas de captação.`,
      action: "Novo aluno",
      route: "/alunos",
    });
  }

  // Default insight if no issues
  if (insights.length === 0) {
    insights.push({
      id: 5,
      type: "suggestion",
      icon: Sparkles,
      title: "Tudo em Ordem!",
      description: "Sua escola está funcionando bem. Continue assim!",
      action: "Ver IA",
      route: "/hub-ia",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card variant="glow" className="overflow-hidden h-fit">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Insights da IA
                  <Sparkles className="w-4 h-4 text-secondary animate-pulse-slow" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">Análises automáticas do seu negócio</p>
              </div>
            </div>
            <Badge variant="glow">{insights.length} {insights.length === 1 ? "item" : "itens"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {insights.slice(0, 3).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
              onClick={() => navigate(insight.route)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                insight.type === "warning" ? "bg-warning/20" :
                insight.type === "suggestion" ? "bg-primary/20" : "bg-destructive/20"
              }`}>
                <insight.icon className={`w-5 h-5 ${
                  insight.type === "warning" ? "text-warning" :
                  insight.type === "suggestion" ? "text-primary" : "text-destructive"
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>

              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {insight.action}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          ))}

          <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/hub-ia")}>
            <Bot className="w-4 h-4 mr-2" />
            Abrir Hub de IA
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
