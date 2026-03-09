import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Loader2,
  Trash2,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { usePagamentos, useCreatePagamento, useDeletePagamento, type NovoPagamento } from "@/hooks/usePagamentos";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";
import { FilterPopover, type FilterValues, type FilterOption } from "@/components/ui/filter-popover";
import { exportPagamentos } from "@/lib/csv-export";
import { ContasPagarTab } from "@/components/financeiro/ContasPagarTab";
import { FluxoCaixaTab } from "@/components/financeiro/FluxoCaixaTab";
import { PDVTab } from "@/components/financeiro/PDVTab";

const filterOptions: FilterOption[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pago", label: "Pago" },
      { value: "pendente", label: "Pendente" },
      { value: "atrasado", label: "Atrasado" },
    ],
  },
  {
    id: "tipo",
    label: "Tipo",
    type: "select",
    options: [
      { value: "mensalidade", label: "Mensalidade" },
      { value: "matricula", label: "Matrícula" },
      { value: "material", label: "Material" },
      { value: "outro", label: "Outro" },
    ],
  },
  {
    id: "metodo",
    label: "Método",
    type: "select",
    options: [
      { value: "pix", label: "PIX" },
      { value: "cartao", label: "Cartão" },
      { value: "boleto", label: "Boleto" },
      { value: "dinheiro", label: "Dinheiro" },
    ],
  },
];

export default function Financeiro() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [newPagamento, setNewPagamento] = useState<NovoPagamento>({
    aluno_id: "",
    valor: 0,
    data_vencimento: "",
    status: "pendente",
    tipo: "mensalidade",
    metodo_pagamento: "",
    referencia: "",
  });

  const { data: pagamentos, isLoading } = usePagamentos();
  const { data: alunos } = useAlunos();
  const createPagamentoMutation = useCreatePagamento();
  const deletePagamentoMutation = useDeletePagamento();

  // Apply filters
  const filteredPagamentos = useMemo(() => {
    if (!pagamentos) return [];
    return pagamentos.filter(p => {
      if (filterValues.status && p.status !== filterValues.status) return false;
      if (filterValues.tipo && p.tipo !== filterValues.tipo) return false;
      if (filterValues.metodo && p.metodo_pagamento !== filterValues.metodo) return false;
      return true;
    });
  }, [pagamentos, filterValues]);

  // Calculate stats
  const totalRecebido = pagamentos?.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0) || 0;
  const totalPendente = pagamentos?.filter(p => p.status === "pendente").reduce((acc, p) => acc + Number(p.valor), 0) || 0;
  const totalAtrasado = pagamentos?.filter(p => p.status === "atrasado").reduce((acc, p) => acc + Number(p.valor), 0) || 0;
  const qtdPendente = pagamentos?.filter(p => p.status === "pendente").length || 0;
  const qtdAtrasado = pagamentos?.filter(p => p.status === "atrasado").length || 0;

  const ticketMedio = pagamentos?.length 
    ? pagamentos.reduce((acc, p) => acc + Number(p.valor), 0) / pagamentos.length 
    : 0;

  // Calculate monthly data for chart
  const monthlyData = pagamentos?.reduce((acc, pagamento) => {
    const date = new Date(pagamento.data_vencimento);
    const monthKey = date.toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find(a => a.month === monthKey);
    if (existing) {
      existing.valor += Number(pagamento.valor);
    } else {
      acc.push({ month: monthKey, valor: Number(pagamento.valor) });
    }
    return acc;
  }, [] as { month: string; valor: number }[]) || [];

  // Calculate status distribution
  const pagos = pagamentos?.filter(p => p.status === "pago").length || 0;
  const pendentes = pagamentos?.filter(p => p.status === "pendente").length || 0;
  const atrasados = pagamentos?.filter(p => p.status === "atrasado").length || 0;
  const total = pagos + pendentes + atrasados || 1;

  const paymentsByStatus = [
    { name: "Pagos", value: Math.round((pagos / total) * 100), color: "hsl(142, 76%, 45%)" },
    { name: "Pendentes", value: Math.round((pendentes / total) * 100), color: "hsl(38, 92%, 50%)" },
    { name: "Atrasados", value: Math.round((atrasados / total) * 100), color: "hsl(0, 84%, 60%)" },
  ];

  const recentPayments = filteredPagamentos?.slice(0, 10) || [];

  const getAlunoName = (alunoId: string | null) => {
    if (!alunoId) return "Sem aluno";
    const aluno = alunos?.find(a => a.id === alunoId);
    return aluno?.nome || "Aluno não encontrado";
  };

  const handleCreatePagamento = () => {
    if (!newPagamento.valor || !newPagamento.data_vencimento) {
      toast({
        title: "Erro",
        description: "Valor e data de vencimento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createPagamentoMutation.mutate({
      ...newPagamento,
      aluno_id: newPagamento.aluno_id || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewPagamento({
          aluno_id: "",
          valor: 0,
          data_vencimento: "",
          status: "pendente",
          tipo: "mensalidade",
          metodo_pagamento: "",
          referencia: "",
        });
      }
    });
  };

  const handleExport = () => {
    if (!filteredPagamentos || filteredPagamentos.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Adicione pagamentos antes de exportar",
        variant: "destructive",
      });
      return;
    }
    
    const exportData = filteredPagamentos.map(p => ({
      ...p,
      aluno_nome: getAlunoName(p.aluno_id),
    }));
    
    exportPagamentos(exportData);
    toast({
      title: "Exportação concluída",
      description: `${filteredPagamentos.length} pagamentos exportados`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle financeiro da escola
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Aluno</Label>
                  <Select
                    value={newPagamento.aluno_id}
                    onValueChange={(value) => setNewPagamento(prev => ({ ...prev, aluno_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos?.map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input 
                      id="valor" 
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newPagamento.valor || ""}
                      onChange={(e) => setNewPagamento(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vencimento">Vencimento *</Label>
                    <Input 
                      id="vencimento" 
                      type="date"
                      value={newPagamento.data_vencimento}
                      onChange={(e) => setNewPagamento(prev => ({ ...prev, data_vencimento: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newPagamento.tipo}
                      onValueChange={(value) => setNewPagamento(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                    <Select
                      value={newPagamento.status}
                      onValueChange={(value) => setNewPagamento(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                  <Select
                    value={newPagamento.metodo_pagamento}
                    onValueChange={(value) => setNewPagamento(prev => ({ ...prev, metodo_pagamento: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referencia">Referência</Label>
                  <Input 
                    id="referencia" 
                    placeholder="Ex: Mensalidade Janeiro/2024"
                    value={newPagamento.referencia}
                    onChange={(e) => setNewPagamento(prev => ({ ...prev, referencia: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={handleCreatePagamento}
                  disabled={createPagamentoMutation.isPending}
                >
                  {createPagamentoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Registrar Pagamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{qtdPendente} pagamentos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inadimplência</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalAtrasado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <p className="text-sm text-destructive mt-2">{qtdAtrasado} alunos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-3xl font-bold mt-2">
                    {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Evolução da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis dataKey="month" stroke="hsl(0, 0%, 60%)" fontSize={12} />
                      <YAxis stroke="hsl(0, 0%, 60%)" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 8%)",
                          border: "1px solid hsl(0, 0%, 15%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString()}`, "Receita"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="valor"
                        stroke="hsl(270, 100%, 50%)"
                        strokeWidth={2}
                        fill="url(#colorValor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Status dos Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {paymentsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 8%)",
                        border: "1px solid hsl(0, 0%, 15%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {paymentsByStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Últimos Pagamentos</CardTitle>
            <FilterPopover 
              filters={filterOptions} 
              values={filterValues} 
              onChange={setFilterValues} 
            />
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum pagamento registrado
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === "pago" ? "bg-success/20" :
                        payment.status === "pendente" ? "bg-warning/20" : "bg-destructive/20"
                      }`}>
                        {payment.status === "pago" ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : payment.status === "pendente" ? (
                          <Clock className="w-5 h-5 text-warning" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{getAlunoName(payment.aluno_id)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.data_vencimento).toLocaleDateString("pt-BR")} • {payment.metodo_pagamento || payment.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {Number(payment.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <Badge variant={
                        payment.status === "pago" ? "success" :
                        payment.status === "pendente" ? "warning" : "destructive"
                      }>
                        {payment.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deletePagamentoMutation.mutate(payment.id)}
                        disabled={deletePagamentoMutation.isPending}
                      >
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
    </div>
  );
}
