import { motion } from "framer-motion";
import { Users, DollarSign, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { BirthdayCard } from "@/components/dashboard/BirthdayCard";
import { WeeklyPayments } from "@/components/dashboard/WeeklyPayments";
import {
  StudentsByLevelChart,
  ClassesByDayChart,
  MonthlyRevenueVsPendingChart,
  StudentGrowthChart,
} from "@/components/dashboard/DashboardCharts";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: alunos, isLoading: loadingAlunos } = useAlunos();
  const { data: pagamentos, isLoading: loadingPagamentos } = usePagamentos();
  const { data: aulas, isLoading: loadingAulas } = useAulas();

  const isLoading = loadingAlunos || loadingPagamentos || loadingAulas;

  // Calculate real stats
  const totalAlunos = alunos?.length || 0;
  const alunosAtivos = alunos?.filter((a) => a.status === "ativo").length || 0;

  // Calculate monthly revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const receitaMensal =
    pagamentos
      ?.filter((p) => {
        const date = new Date(p.data_vencimento);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && p.status === "pago";
      })
      .reduce((acc, p) => acc + Number(p.valor), 0) || 0;

  // Get today's classes
  const today = new Date().getDay();
  const aulasHoje = aulas?.filter((a) => a.dia_semana === today) || [];
  const aulasConfirmadas = aulasHoje.filter((a) => a.status === "ativo").length;
  const aulasPendentes = aulasHoje.filter((a) => a.status !== "ativo").length;

  // Calculate retention rate (active / total)
  const taxaRetencao = totalAlunos > 0 ? Math.round((alunosAtivos / totalAlunos) * 100) : 0;

  // Get user name from metadata or email
  const userName = user?.user_metadata?.nome || user?.email?.split("@")[0] || "Usuário";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-3xl font-bold">
          Bem-vindo, <span className="gradient-text">{userName}</span>
        </h1>
        <p className="text-muted-foreground">Aqui está um resumo da sua escola de música</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total de Alunos"
          value={totalAlunos}
          icon={Users}
          description={`${alunosAtivos} ativos`}
          variant="primary"
          delay={0}
        />
        <StatsCard
          title="Receita Mensal"
          value={receitaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={DollarSign}
          variant="secondary"
          delay={0.1}
        />
        <StatsCard
          title="Aulas Hoje"
          value={aulasHoje.length}
          icon={Calendar}
          description={`${aulasConfirmadas} confirmadas, ${aulasPendentes} pendentes`}
          delay={0.2}
        />
        <StatsCard
          title="Taxa de Retenção"
          value={`${taxaRetencao}%`}
          icon={TrendingUp}
          variant="primary"
          delay={0.3}
        />
      </div>

      {/* Main Content - Combined Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <WeeklyPayments />
          <UpcomingClasses />
        </div>
        <div className="space-y-4 lg:space-y-6 flex flex-col">
          <BirthdayCard />
          <div className="flex-1">
            <AIInsights />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <StudentsByLevelChart />
        <ClassesByDayChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <MonthlyRevenueVsPendingChart />
        <StudentGrowthChart />
      </div>
    </div>
  );
}
