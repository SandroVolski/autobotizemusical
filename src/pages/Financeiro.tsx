import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, CreditCard, AlertCircle, CheckCircle2, Clock, Download, Plus, Loader2, Trash2,
  Receipt, ShoppingCart, Wallet, ChevronLeft, ChevronRight, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { usePagamentos, useCreatePagamento, useDeletePagamento, type NovoPagamento } from "@/hooks/usePagamentos";
import { useAlunos } from "@/hooks/useAlunos";
import { useMatriculas } from "@/hooks/useMatriculas";
import { useCursos } from "@/hooks/useCursos";
import { toast } from "@/hooks/use-toast";
import { FilterPopover, type FilterValues, type FilterOption } from "@/components/ui/filter-popover";
import { exportPagamentos } from "@/lib/csv-export";
import { ContasPagarTab } from "@/components/financeiro/ContasPagarTab";
import { FluxoCaixaTab } from "@/components/financeiro/FluxoCaixaTab";
import { PDVTab } from "@/components/financeiro/PDVTab";

const filterOptions: FilterOption[] = [
  { id: "status", label: "Status", type: "select", options: [
    { value: "pago", label: "Pago" }, { value: "pendente", label: "Pendente" }, { value: "atrasado", label: "Atrasado" },
  ]},
  { id: "tipo", label: "Tipo", type: "select", options: [
    { value: "mensalidade", label: "Mensalidade" }, { value: "matricula", label: "Matrícula" }, { value: "material", label: "Material" }, { value: "outro", label: "Outro" },
  ]},
  { id: "metodo", label: "Método", type: "select", options: [
    { value: "pix", label: "PIX" }, { value: "cartao", label: "Cartão" }, { value: "boleto", label: "Boleto" }, { value: "dinheiro", label: "Dinheiro" },
  ]},
];

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const themedTooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  padding: "10px",
  color: "hsl(var(--popover-foreground))",
};

export default function Financeiro() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };
  const [newPagamento, setNewPagamento] = useState<NovoPagamento>({
    aluno_id: "", valor: 0, data_vencimento: "", status: "pendente", tipo: "mensalidade", metodo_pagamento: "", referencia: "",
  });
  const [numMeses, setNumMeses] = useState(1);

  const { data: pagamentos, isLoading } = usePagamentos();
  const { data: alunos } = useAlunos();
  const { data: matriculas } = useMatriculas();
  const { data: cursos } = useCursos();
  const createPagamentoMutation = useCreatePagamento();
  const deletePagamentoMutation = useDeletePagamento();

  // Filter payments by selected month/year
  const monthPagamentos = useMemo(() => {
    if (!pagamentos) return [];
    return pagamentos.filter(p => {
      if (!p.data_vencimento) return false;
      const date = new Date(p.data_vencimento + "T00:00:00");
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [pagamentos, selectedMonth, selectedYear]);

  const filteredPagamentos = useMemo(() => {
    return monthPagamentos.filter(p => {
      if (filterValues.status && p.status !== filterValues.status) return false;
      if (filterValues.tipo && p.tipo !== filterValues.tipo) return false;
      if (filterValues.metodo && p.metodo_pagamento !== filterValues.metodo) return false;
      return true;
    });
  }, [monthPagamentos, filterValues]);

  // Stats based on selected month
  const totalRecebido = monthPagamentos.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0);
  const totalPendente = monthPagamentos.filter(p => p.status === "pendente").reduce((acc, p) => acc + Number(p.valor), 0);
  const totalAtrasado = monthPagamentos.filter(p => p.status === "atrasado").reduce((acc, p) => acc + Number(p.valor), 0);
  const qtdPendente = monthPagamentos.filter(p => p.status === "pendente").length;
  const qtdAtrasado = monthPagamentos.filter(p => p.status === "atrasado").length;
  const ticketMedio = monthPagamentos.length ? monthPagamentos.reduce((acc, p) => acc + Number(p.valor), 0) / monthPagamentos.length : 0;

  // Revenue chart: show all months of selected year
  const monthOrder = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const yearlyChartData = useMemo(() => {
    return monthOrder.map((month, index) => {
      const mp = pagamentos?.filter(p => {
        if (!p.data_vencimento) return false;
        const date = new Date(p.data_vencimento + "T00:00:00");
        return date.getMonth() === index && date.getFullYear() === selectedYear;
      }) || [];
      const recebido = mp.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0);
      const pendente = mp.filter(p => p.status !== "pago").reduce((acc, p) => acc + Number(p.valor), 0);
      return { mes: month, recebido, pendente };
    }).filter(d => d.recebido > 0 || d.pendente > 0);
  }, [pagamentos, selectedYear]);

  // Payment status pie chart for selected month
  const pagos = monthPagamentos.filter(p => p.status === "pago").length;
  const pendentes = monthPagamentos.filter(p => p.status === "pendente").length;
  const atrasados = monthPagamentos.filter(p => p.status === "atrasado").length;
  const total = pagos + pendentes + atrasados || 1;

  const paymentsByStatus = [
    { name: "Pagos", value: pagos, percent: Math.round((pagos / total) * 100), color: "hsl(142, 76%, 45%)" },
    { name: "Pendentes", value: pendentes, percent: Math.round((pendentes / total) * 100), color: "hsl(38, 92%, 50%)" },
    { name: "Atrasados", value: atrasados, percent: Math.round((atrasados / total) * 100), color: "hsl(0, 84%, 60%)" },
  ];

  const recentPayments = filteredPagamentos.slice(0, 10);

  const getAlunoName = (alunoId: string | null) => {
    if (!alunoId) return "Sem aluno";
    return alunos?.find(a => a.id === alunoId)?.nome || "Aluno não encontrado";
  };

  // Get course value for selected student
  const selectedStudentCourseValue = useMemo(() => {
    if (!newPagamento.aluno_id || !matriculas || !cursos) return null;
    const mat = matriculas.find(m => m.aluno_id === newPagamento.aluno_id && m.status === "ativo");
    if (!mat) return null;
    const curso = cursos.find(c => c.id === mat.curso_id);
    return curso?.valor_mensal ?? null;
  }, [newPagamento.aluno_id, matriculas, cursos]);

  const handleCreatePagamento = async () => {
    if (!newPagamento.valor || !newPagamento.data_vencimento) {
      toast({ title: "Erro", description: "Valor e data de vencimento são obrigatórios", variant: "destructive" });
      return;
    }
    
    const baseDate = new Date(newPagamento.data_vencimento + "T00:00:00");
    const valorPorMes = numMeses > 1 ? Number((newPagamento.valor / numMeses).toFixed(2)) : newPagamento.valor;
    const promises = [];
    
    for (let i = 0; i < numMeses; i++) {
      const vencDate = new Date(baseDate);
      vencDate.setMonth(vencDate.getMonth() + i);
      const dateStr = vencDate.toISOString().split("T")[0];
      const mesRef = vencDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const ref = numMeses > 1 ? `Mensalidade ${mesRef}` : (newPagamento.referencia || "");
      
      promises.push(
        createPagamentoMutation.mutateAsync({
          ...newPagamento,
          aluno_id: newPagamento.aluno_id || undefined,
          valor: valorPorMes,
          data_vencimento: dateStr,
          referencia: ref,
        })
      );
    }
    
    try {
      await Promise.all(promises);
      setIsDialogOpen(false);
      setNewPagamento({ aluno_id: "", valor: 0, data_vencimento: "", status: "pendente", tipo: "mensalidade", metodo_pagamento: "", referencia: "" });
      setNumMeses(1);
      if (numMeses > 1) {
        toast({ title: `${numMeses} pagamentos registrados!`, description: `Valor de ${valorPorMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por mês.` });
      }
    } catch {
      // Error already handled by mutation
    }
  };

  const handleExport = () => {
    if (!filteredPagamentos || filteredPagamentos.length === 0) {
      toast({ title: "Nenhum dado para exportar", description: "Adicione pagamentos antes de exportar", variant: "destructive" });
      return;
    }
    exportPagamentos(filteredPagamentos.map(p => ({ ...p, aluno_nome: getAlunoName(p.aluno_id) })));
    toast({ title: "Exportação concluída", description: `${filteredPagamentos.length} pagamentos exportados` });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro completo da escola</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg px-2 py-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">{meses[selectedMonth].slice(0, 3)} {selectedYear}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Novo Pagamento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Aluno</Label>
                  <Select value={newPagamento.aluno_id} onValueChange={(v) => setNewPagamento(prev => ({ ...prev, aluno_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
                    <SelectContent>{alunos?.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor Total (R$) *</Label>
                    <Input type="number" step="0.01" placeholder="0,00" value={newPagamento.valor || ""}
                      onChange={(e) => setNewPagamento(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))} />
                    {selectedStudentCourseValue !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
                        <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>Mensalidade do curso: <strong className="text-foreground">{selectedStudentCourseValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Vencimento *</Label>
                    <Input type="date" value={newPagamento.data_vencimento}
                      onChange={(e) => setNewPagamento(prev => ({ ...prev, data_vencimento: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select value={newPagamento.tipo} onValueChange={(v) => setNewPagamento(prev => ({ ...prev, tipo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensalidade">Mensalidade</SelectItem>
                        <SelectItem value="matricula">Matrícula</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={newPagamento.status} onValueChange={(v) => setNewPagamento(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Método de Pagamento</Label>
                  <Select value={newPagamento.metodo_pagamento} onValueChange={(v) => setNewPagamento(prev => ({ ...prev, metodo_pagamento: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Referência</Label>
                    <Input placeholder="Ex: Mensalidade Janeiro/2024" value={newPagamento.referencia}
                      onChange={(e) => setNewPagamento(prev => ({ ...prev, referencia: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Qtd. de Meses</Label>
                    <Input type="number" min={1} max={12} value={numMeses}
                      onChange={(e) => setNumMeses(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} />
                    {numMeses > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {numMeses} parcelas de <strong>{Number((newPagamento.valor / numMeses).toFixed(2)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <Button className="w-full mt-2" onClick={handleCreatePagamento} disabled={createPagamentoMutation.isPending}>
                  {createPagamentoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Registrar Pagamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <Tabs defaultValue="receber" className="space-y-6">
        <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-xl p-1.5 inline-flex">
          <TabsList className="bg-transparent gap-1 h-auto p-0">
            <TabsTrigger value="receber" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg px-5 py-2.5 text-sm font-medium transition-all">
              <DollarSign className="w-4 h-4 mr-2" />Receber
            </TabsTrigger>
            <TabsTrigger value="pagar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg px-5 py-2.5 text-sm font-medium transition-all">
              <Receipt className="w-4 h-4 mr-2" />Pagar
            </TabsTrigger>
            <TabsTrigger value="caixa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg px-5 py-2.5 text-sm font-medium transition-all">
              <Wallet className="w-4 h-4 mr-2" />Caixa
            </TabsTrigger>
            <TabsTrigger value="pdv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg px-5 py-2.5 text-sm font-medium transition-all">
              <ShoppingCart className="w-4 h-4 mr-2" />PDV
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="receber" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita ({meses[selectedMonth].slice(0, 3)})</p>
                      <p className="text-3xl font-bold mt-2">{totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">Recebido</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">A Receber</p>
                      <p className="text-3xl font-bold mt-2">{totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <p className="text-sm text-muted-foreground mt-2">{qtdPendente} pagamentos</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Inadimplência</p>
                      <p className="text-3xl font-bold mt-2">{totalAtrasado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <p className="text-sm text-destructive mt-2">{qtdAtrasado} alunos</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card variant="interactive">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-3xl font-bold mt-2">{ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">Por pagamento</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
              <Card variant="glass">
                <CardHeader><CardTitle className="text-lg">Recebido vs Pendente ({selectedYear})</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {yearlyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearlyChartData} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
                            tickFormatter={(v) => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                          <Tooltip contentStyle={themedTooltipStyle}
                            formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), ""]} />
                          <Legend />
                          <Bar dataKey="recebido" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} name="Recebido" />
                          <Bar dataKey="pendente" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Pendente" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Sem dados para {selectedYear}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card variant="glass" className="h-full">
                <CardHeader><CardTitle className="text-lg">Status ({meses[selectedMonth].slice(0, 3)})</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} strokeWidth={0}>
                          {paymentsByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={themedTooltipStyle}
                          formatter={(value: number, name: string) => [`${value} pagamentos`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {paymentsByStatus.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{item.value}</span>
                          <span className="text-xs text-muted-foreground">({item.percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Payments */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pagamentos de {meses[selectedMonth]} {selectedYear}</CardTitle>
                <FilterPopover filters={filterOptions} values={filterValues} onChange={setFilterValues} />
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">Nenhum pagamento em {meses[selectedMonth]} {selectedYear}</div>
                ) : (
                  <div className="space-y-3">
                    {recentPayments.map((payment, index) => (
                      <motion.div key={payment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.status === "pago" ? "bg-success/20" : payment.status === "pendente" ? "bg-warning/20" : "bg-destructive/20"
                          }`}>
                            {payment.status === "pago" ? <CheckCircle2 className="w-5 h-5 text-success" /> :
                              payment.status === "pendente" ? <Clock className="w-5 h-5 text-warning" /> :
                                <AlertCircle className="w-5 h-5 text-destructive" />}
                          </div>
                          <div>
                            <p className="font-medium">{getAlunoName(payment.aluno_id)}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.data_vencimento ? new Date(payment.data_vencimento + "T00:00:00").toLocaleDateString("pt-BR") : "—"} • {payment.metodo_pagamento || payment.tipo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{Number(payment.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                          <Badge variant={payment.status === "pago" ? "success" : payment.status === "pendente" ? "warning" : "destructive"}>
                            {payment.status}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => deletePagamentoMutation.mutate(payment.id)} disabled={deletePagamentoMutation.isPending}>
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="pagar"><ContasPagarTab /></TabsContent>
        <TabsContent value="caixa"><FluxoCaixaTab selectedMonth={selectedMonth} selectedYear={selectedYear} /></TabsContent>
        <TabsContent value="pdv"><PDVTab /></TabsContent>
      </Tabs>
    </div>
  );
}
