import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, TrendingDown, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";

const insights = [
  {
    id: 1,
    type: "warning",
    icon: AlertTriangle,
    title: "Risco de Evasão Detectado",
    description: "3 alunos apresentam baixa frequência nas últimas semanas. Recomendamos entrar em contato.",
    action: "Ver alunos",
  },
  {
    id: 2,
    type: "suggestion",
    icon: Lightbulb,
    title: "Otimização de Horários",
    description: "Identificamos 4 slots vagos que poderiam ser preenchidos. A IA sugere ajustes na grade.",
    action: "Ver sugestões",
  },
  {
    id: 3,
    type: "trend",
    icon: TrendingDown,
    title: "Queda em Matrículas",
    description: "Matrículas de piano diminuíram 15% este mês. Considere uma campanha promocional.",
    action: "Criar campanha",
  },
];

export function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card variant="glow" className="overflow-hidden">
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
            <Badge variant="glow">3 novos</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                insight.type === "warning" ? "bg-warning/20" :
                insight.type === "suggestion" ? "bg-info/20" : "bg-destructive/20"
              }`}>
                <insight.icon className={`w-5 h-5 ${
                  insight.type === "warning" ? "text-warning" :
                  insight.type === "suggestion" ? "text-info" : "text-destructive"
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

          <Button variant="outline" className="w-full mt-4">
            <Bot className="w-4 h-4 mr-2" />
            Ver todos os insights
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
