import { useState } from "react";
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

const frequenciaData = [
  { mes: "Jan", presencas: 85, faltas: 15 },
  { mes: "Fev", presencas: 88, faltas: 12 },
  { mes: "Mar", presencas: 82, faltas: 18 },
  { mes: "Abr", presencas: 90, faltas: 10 },
  { mes: "Mai", presencas: 87, faltas: 13 },
  { mes: "Jun", presencas: 92, faltas: 8 },
];

const evolucaoAlunosData = [
  { mes: "Jan", alunos: 120 },
  { mes: "Fev", alunos: 128 },
  { mes: "Mar", alunos: 135 },
  { mes: "Abr", alunos: 138 },
  { mes: "Mai", alunos: 140 },
  { mes: "Jun", alunos: 142 },
];

const instrumentosData = [
  { name: "Piano", value: 35, color: "hsl(var(--primary))" },
  { name: "Violão", value: 28, color: "hsl(var(--secondary))" },
  { name: "Guitarra", value: 18, color: "hsl(var(--warning))" },
  { name: "Bateria", value: 12, color: "hsl(var(--success))" },
  { name: "Outros", value: 7, color: "hsl(var(--muted-foreground))" },
];

const relatoriosDisponiveis = [
  { id: 1, nome: "Relatório Financeiro Mensal", tipo: "Financeiro", data: "01/06/2024" },
  { id: 2, nome: "Frequência por Turma", tipo: "Pedagógico", data: "28/05/2024" },
  { id: 3, nome: "Desempenho de Alunos", tipo: "Pedagógico", data: "25/05/2024" },
  { id: 4, nome: "Ocupação de Salas", tipo: "Operacional", data: "20/05/2024" },
  { id: 5, nome: "Análise de Evasão", tipo: "IA Analytics", data: "15/05/2024" },
];

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("mensal");

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
                <p className="text-sm text-muted-foreground">Taxa de Frequência</p>
                <p className="text-2xl font-bold">89.2%</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+2.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                <p className="text-2xl font-bold">94.5%</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+1.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupação de Salas</p>
                <p className="text-2xl font-bold">78.3%</p>
              </div>
              <div className="flex items-center gap-1 text-warning">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">-0.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inadimplência</p>
                <p className="text-2xl font-bold">3.2%</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">-0.5%</span>
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
            {/* Frequência Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Taxa de Frequência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={frequenciaData}>
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
                    <Bar dataKey="presencas" fill="hsl(var(--success))" name="Presenças" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="faltas" fill="hsl(var(--destructive))" name="Faltas" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
              </CardContent>
            </Card>
          </div>

          {/* Evolução de Alunos */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Evolução de Alunos Matriculados
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
        </TabsContent>

        <TabsContent value="pedagogico" className="space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Relatórios Pedagógicos</h3>
                <p className="text-muted-foreground mb-4">
                  Análise de desempenho, evolução de turmas e taxa de aprovação
                </p>
                <Button>Ver Relatórios Completos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Relatórios Financeiros</h3>
                <p className="text-muted-foreground mb-4">
                  Faturamento, inadimplência e projeções de receita
                </p>
                <Button>Ver Relatórios Completos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Reports */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatórios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
