import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { Users, Music, TrendingUp, BarChart3 } from "lucide-react";

const themedTooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  padding: "10px",
  color: "hsl(var(--popover-foreground))",
};

const LEVEL_COLORS = {
  iniciante: "hsl(var(--primary))",
  intermediario: "hsl(200, 100%, 50%)",
  avancado: "hsl(142, 76%, 45%)",
};

export function StudentsByLevelChart() {
  const { data: alunos } = useAlunos();

  const nivelData = [
    { name: "Iniciante", value: alunos?.filter(a => (a.nivel || "iniciante") === "iniciante" && a.status === "ativo").length || 0, color: LEVEL_COLORS.iniciante },
    { name: "Intermediário", value: alunos?.filter(a => a.nivel === "intermediario" && a.status === "ativo").length || 0, color: LEVEL_COLORS.intermediario },
    { name: "Avançado", value: alunos?.filter(a => a.nivel === "avancado" && a.status === "ativo").length || 0, color: LEVEL_COLORS.avancado },
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
          <div className="h-[240px]">
            {nivelData.length > 0 ? (
              <div className="flex items-center h-full gap-6">
                <div className="flex-1 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={nivelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {nivelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={themedTooltipStyle}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        formatter={(value: number, name: string) => [`${value} alunos (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{total}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">alunos</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 min-w-[130px]">
                  {nivelData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{entry.name}</span>
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
    aulas: aulas?.filter(a => a.dia_semana === index && a.status !== "cancelada").length || 0,
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
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aulasPorDia} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={themedTooltipStyle}
                  formatter={(value: number) => [`${value} aulas`, "Total"]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <Bar dataKey="aulas" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Aulas" />
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
      const date = new Date(p.data_vencimento + "T00:00:00");
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
            Recebido vs Pendente ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={2} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip 
                    contentStyle={themedTooltipStyle}
                    formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), ""]}
                  />
                  <Legend />
                  <Bar dataKey="recebido" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} name="Recebido" />
                  <Bar dataKey="pendente" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Pendente" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados financeiros para {currentYear}
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
      const date = new Date(a.data_matricula + "T00:00:00");
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
            <BarChart3 className="w-4 h-4 text-primary" />
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
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={themedTooltipStyle}
                    formatter={(value: number) => [`${value} alunos`, "Total"]} />
                  <Area type="monotone" dataKey="alunos" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorAlunos)" name="Total de Alunos" />
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
