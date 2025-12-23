import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  UserPlus, 
  CalendarPlus, 
  Receipt, 
  FileText, 
  Send, 
  Bot,
  LucideIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  route: string;
  gradient: string;
}

const actions: QuickAction[] = [
  { 
    icon: UserPlus, 
    label: "Novo Aluno", 
    description: "Cadastrar aluno",
    route: "/alunos",
    gradient: "from-blue-500 to-blue-600"
  },
  { 
    icon: CalendarPlus, 
    label: "Agendar Aula", 
    description: "Nova aula",
    route: "/agenda",
    gradient: "from-emerald-500 to-emerald-600"
  },
  { 
    icon: Receipt, 
    label: "Pagamento", 
    description: "Registrar",
    route: "/financeiro",
    gradient: "from-amber-500 to-amber-600"
  },
  { 
    icon: FileText, 
    label: "Relatório", 
    description: "Gerar novo",
    route: "/relatorios",
    gradient: "from-purple-500 to-purple-600"
  },
  { 
    icon: Send, 
    label: "Mensagem", 
    description: "Enviar aviso",
    route: "/comunicacao",
    gradient: "from-pink-500 to-pink-600"
  },
  { 
    icon: Bot, 
    label: "Hub IA", 
    description: "Consultar",
    route: "/hub-ia",
    gradient: "from-indigo-500 to-indigo-600"
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.route)}
                className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon container */}
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Text */}
                <div className="relative text-center">
                  <p className="text-sm font-semibold text-foreground leading-tight">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
