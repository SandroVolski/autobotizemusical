import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BookOpen,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useCursos } from "@/hooks/useCursos";
import { useProfessores } from "@/hooks/useProfessores";
import { useAulas } from "@/hooks/useAulas";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("mensal");

  const { data: alunos, isLoading: loadingAlunos } = useAlunos();
  const { data: pagamentos, isLoading: loadingPagamentos } = usePagamentos();
  const { data: cursos, isLoading: loadingCursos } = useCursos();
  const { data: professores } = useProfessores();
  const { data: aulas } = useAulas();

  const isLoading = loadingAlunos || loadingPagamentos || loadingCursos;

  // Calculate real stats
  const stats = useMemo(() => {
    const totalAlunos = alunos?.length || 0;
    const alunosAtivos = alunos?.filter(a => a.status === "ativo").length || 0;
    const taxaRetencao = totalAlunos > 0 ? ((alunosAtivos / totalAlunos) * 100).toFixed(1) : "0.0";

    const pagamentosPendentes = pagamentos?.filter(p => p.status === "pendente").length || 0;
    const totalPagamentos = pagamentos?.length || 0;
    const inadimplencia = totalPagamentos > 0 ? ((pagamentosPendentes / totalPagamentos) * 100).toFixed(1) : "0.0";

    const totalAulas = aulas?.length || 0;
    const aulasAtivas = aulas?.filter(a => a.status === "ativo").length || 0;
    const ocupacao = totalAulas > 0 ? ((aulasAtivas / Math.max(totalAulas, 10)) * 100).toFixed(1) : "0.0";

    return {
      taxaRetencao,
      inadimplencia,
      ocupacao,
      totalAlunos,
    };
  }, [alunos, pagamentos, aulas]);

  // Generate chart data based on real data
  const evolucaoAlunosData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const alunosNoMes = alunos?.filter(a => {
        const dataMatricula = a.data_matricula ? new Date(a.data_matricula) : new Date(a.created_at);
        return dataMatricula <= monthEnd;
      }).length || 0;

      months.push({
        mes: format(date, "MMM", { locale: ptBR }),
        alunos: alunosNoMes,
      });
    }
    return months;
  }, [alunos]);

  // Instrument distribution from cursos
  const instrumentosData = useMemo(() => {
    const instrumentCount: Record<string, number> = {};
    cursos?.forEach(curso => {
      const instrumento = curso.instrumento || "Outros";
      instrumentCount[instrumento] = (instrumentCount[instrumento] || 0) + 1;
    });

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--warning))",
      "hsl(var(--success))",
      "hsl(var(--muted-foreground))",
    ];

    return Object.entries(instrumentCount)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .slice(0, 5);
  }, [cursos]);

  // Revenue data from pagamentos
  const receitaData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const receitaMes = pagamentos?.filter(p => {
        if (!p.data_pagamento) return false;
        const dataPagamento = new Date(p.data_pagamento);
        return isWithinInterval(dataPagamento, { start: monthStart, end: monthEnd }) && p.status === "pago";
      }).reduce((acc, p) => acc + Number(p.valor), 0) || 0;

      const pendenteMes = pagamentos?.filter(p => {
        const dataVencimento = new Date(p.data_vencimento);
        return isWithinInterval(dataVencimento, { start: monthStart, end: monthEnd }) && p.status === "pendente";
      }).reduce((acc, p) => acc + Number(p.valor), 0) || 0;

      months.push({
        mes: format(date, "MMM", { locale: ptBR }),
        receita: receitaMes,
        pendente: pendenteMes,
      });
    }
    return months;
  }, [pagamentos]);

  // Recent reports based on real data
  const relatoriosDisponiveis = useMemo(() => {
    const reports = [];
    
    if (alunos && alunos.length > 0) {
      reports.push({
        id: "1",
        nome: `Relatório de Alunos (${alunos.length} cadastrados)`,
        tipo: "Operacional",
        data: format(new Date(), "dd/MM/yyyy"),
      });
    }

    if (pagamentos && pagamentos.length > 0) {
      const totalReceita = pagamentos.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0);
      reports.push({
        id: "2",
        nome: `Relatório Financeiro (${totalReceita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`,
        tipo: "Financeiro",
        data: format(new Date(), "dd/MM/yyyy"),
      });
    }

    if (cursos && cursos.length > 0) {
      reports.push({
        id: "3",
        nome: `Cursos Ativos (${cursos.filter(c => c.status === "ativo").length} cursos)`,
        tipo: "Pedagógico",
        data: format(new Date(), "dd/MM/yyyy"),
      });
    }

    if (professores && professores.length > 0) {
      reports.push({
        id: "4",
        nome: `Equipe de Professores (${professores.length} professores)`,
        tipo: "Operacional",
        data: format(new Date(), "dd/MM/yyyy"),
      });
    }

    return reports;
  }, [alunos, pagamentos, cursos, professores]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Visualize dados e métricas da sua escola
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{stats.totalAlunos}</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                <p className="text-2xl font-bold">{stats.taxaRetencao}%</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupação de Aulas</p>
                <p className="text-2xl font-bold">{stats.ocupacao}%</p>
              </div>
              <div className="flex items-center gap-1 text-warning">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inadimplência</p>
                <p className="text-2xl font-bold">{stats.inadimplencia}%</p>
              </div>
              <div className="flex items-center gap-1 text-destructive">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="operacional" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="pedagogico">Pedagógico</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="operacional" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Evolução de Alunos */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Evolução de Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evolucaoAlunosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="alunos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Instrumento */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Distribuição por Instrumento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instrumentosData.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    <p>Nenhum curso cadastrado</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={instrumentosData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {instrumentosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pedagogico" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Cursos por Nível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["iniciante", "intermediario", "avancado"].map((nivel) => {
                    const count = cursos?.filter(c => c.nivel === nivel).length || 0;
                    const total = cursos?.length || 1;
                    const percentage = (count / total) * 100;
                    
                    return (
                      <div key={nivel} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{nivel}</span>
                          <span className="text-muted-foreground">{count} cursos</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Professores por Especialidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {professores?.slice(0, 5).map((prof) => (
                    <div key={prof.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="font-medium">{prof.nome}</span>
                      <div className="flex gap-1">
                        {prof.instrumentos?.slice(0, 2).map((inst) => (
                          <Badge key={inst} variant="outline" className="text-xs">
                            {inst}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(!professores || professores.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">Nenhum professor cadastrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Receita x Pendências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={receitaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--success))" name="Receita" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendente" fill="hsl(var(--warning))" name="Pendente" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Reports */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatoriosDisponiveis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum relatório disponível ainda</p>
              <p className="text-sm">Cadastre alunos, pagamentos e cursos para gerar relatórios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatoriosDisponiveis.map((relatorio) => (
                <div
                  key={relatorio.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{relatorio.nome}</p>
                      <p className="text-sm text-muted-foreground">{relatorio.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{relatorio.tipo}</Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
