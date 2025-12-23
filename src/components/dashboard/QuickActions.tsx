import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CalendarPlus, 
  Receipt, 
  FileText, 
  Send, 
  Bot,
  Plus
} from "lucide-react";

const actions = [
  { icon: UserPlus, label: "Novo Aluno", color: "primary" },
  { icon: CalendarPlus, label: "Agendar Aula", color: "secondary" },
  { icon: Receipt, label: "Registrar Pagamento", color: "success" },
  { icon: FileText, label: "Gerar Relatório", color: "info" },
  { icon: Send, label: "Enviar Mensagem", color: "warning" },
  { icon: Bot, label: "Consultar IA", color: "primary" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 p-4 hover:border-primary/50 hover:bg-primary/5"
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
