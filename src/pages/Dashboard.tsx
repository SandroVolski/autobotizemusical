import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Music
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
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
          Bem-vindo, <span className="gradient-text">Sandro</span>
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua escola de música
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Alunos"
          value="142"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatsCard
          title="Receita Mensal"
          value="R$ 17.5k"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          variant="secondary"
          delay={0.1}
        />
        <StatsCard
          title="Aulas Hoje"
          value="24"
          icon={Calendar}
          description="4 confirmadas, 2 pendentes"
          delay={0.2}
        />
        <StatsCard
          title="Taxa de Retenção"
          value="94%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          variant="primary"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingClasses />
          <RevenueChart />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <AIInsights />
        </div>
      </div>
    </div>
  );
}
