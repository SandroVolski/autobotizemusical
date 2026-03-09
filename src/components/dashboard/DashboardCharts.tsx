import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { usePresencas } from "@/hooks/usePresencas";
import { Users, Music, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "hsl(270, 100%, 50%)",
  "hsl(200, 100%, 50%)",
  "hsl(140, 70%, 45%)",
  "hsl(40, 100%, 50%)",
  "hsl(340, 80%, 55%)",
  "hsl(180, 70%, 45%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(0, 0%, 8%)",
  border: "1px solid hsl(0, 0%, 15%)",
  borderRadius: "8px",
  padding: "10px",
};

const themedTooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  padding: "10px",
  color: "hsl(var(--popover-foreground))",
};

export function StudentsByLevelChart() {
  const { data: alunos } = useAlunos();

  const nivelData = [
    { name: "Iniciante", value: alunos?.filter(a => (a.nivel || "iniciante") === "iniciante" && a.status === "ativo").length || 0, color: COLORS[0] },
    { name: "Intermediário", value: alunos?.filter(a => a.nivel === "intermediario" && a.status === "ativo").length || 0, color: COLORS[1] },
    { name: "Avançado", value: alunos?.filter(a => a.nivel === "avancado" && a.status === "ativo").length || 0, color: COLORS[2] },
  ].filter(d => d.value > 0);

  const total = nivelData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Alunos por Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            {nivelData.length > 0 ? (
              <div className="flex items-center h-full gap-4">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nivelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {nivelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={themedTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 min-w-[120px]">
                  {nivelData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{entry.name}</span>
                        <span className="text-xs text-muted-foreground">{entry.value} ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados de alunos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClassesByDayChart() {
  const { data: aulas } = useAulas();

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const aulasPorDia = diasSemana.map((dia, index) => ({
    dia,
    aulas: aulas?.filter(a => a.dia_semana === index && a.status === "ativo").length || 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Aulas por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aulasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                <XAxis dataKey="dia" stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={themedTooltipStyle} />
                <Bar dataKey="aulas" fill="hsl(270, 100%, 50%)" radius={[6, 6, 0, 0]} name="Aulas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonthlyRevenueVsPendingChart() {
  const { data: pagamentos } = usePagamentos();

  const monthOrder = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentYear = new Date().getFullYear();

  const monthlyData = monthOrder.map((month, index) => {
    const monthPagamentos = pagamentos?.filter(p => {
      if (!p.data_vencimento) return false;
      const date = new Date(p.data_vencimento);
      return date.getMonth() === index && date.getFullYear() === currentYear;
    }) || [];

    const recebido = monthPagamentos.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0);
    const pendente = monthPagamentos.filter(p => p.status !== "pago").reduce((acc, p) => acc + Number(p.valor), 0);

    return { mes: month, recebido, pendente };
  }).filter(d => d.recebido > 0 || d.pendente > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Recebido vs Pendente (Mensal)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="mes" stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip 
                    contentStyle={themedTooltipStyle}
                    formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), ""]}
                  />
                  <Legend />
                  <Bar dataKey="recebido" fill="hsl(140, 70%, 45%)" radius={[4, 4, 0, 0]} name="Recebido" />
                  <Bar dataKey="pendente" fill="hsl(40, 100%, 50%)" radius={[4, 4, 0, 0]} name="Pendente" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados financeiros
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StudentGrowthChart() {
  const { data: alunos } = useAlunos();

  const monthOrder = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentYear = new Date().getFullYear();

  const growthData = monthOrder.map((month, index) => {
    const alunosAteMes = alunos?.filter(a => {
      if (!a.data_matricula) return false;
      const date = new Date(a.data_matricula);
      return (date.getFullYear() < currentYear) || 
             (date.getFullYear() === currentYear && date.getMonth() <= index);
    }).length || 0;

    return { mes: month, alunos: alunosAteMes };
  }).filter(d => d.alunos > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}>
      <Card variant="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" />
            Evolução de Alunos ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="mes" stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="alunos" stroke="hsl(270, 100%, 50%)" strokeWidth={2} fill="url(#colorAlunos)" name="Total de Alunos" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados de alunos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
