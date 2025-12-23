import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", valor: 12400 },
  { month: "Fev", valor: 13100 },
  { month: "Mar", valor: 14800 },
  { month: "Abr", valor: 15200 },
  { month: "Mai", valor: 16100 },
  { month: "Jun", valor: 17500 },
];

const paymentsByStatus = [
  { name: "Pagos", value: 85, color: "hsl(142, 76%, 45%)" },
  { name: "Pendentes", value: 10, color: "hsl(38, 92%, 50%)" },
  { name: "Atrasados", value: 5, color: "hsl(0, 84%, 60%)" },
];

const recentPayments = [
  { id: 1, student: "Maria Silva", value: 350, status: "pago", date: "20/06/2024", method: "PIX" },
  { id: 2, student: "João Santos", value: 280, status: "pendente", date: "25/06/2024", method: "Boleto" },
  { id: 3, student: "Ana Costa", value: 420, status: "pago", date: "18/06/2024", method: "Cartão" },
  { id: 4, student: "Pedro Oliveira", value: 350, status: "atrasado", date: "15/06/2024", method: "Boleto" },
  { id: 5, student: "Carla Lima", value: 280, status: "pago", date: "22/06/2024", method: "PIX" },
];

export default function Financeiro() {
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
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
                  <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  <p className="text-3xl font-bold mt-2">R$ 17.5k</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">+12%</span>
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
                  <p className="text-3xl font-bold mt-2">R$ 2.8k</p>
                  <p className="text-sm text-muted-foreground mt-2">14 mensalidades</p>
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
                  <p className="text-3xl font-bold mt-2">R$ 980</p>
                  <p className="text-sm text-destructive mt-2">5 alunos</p>
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
                  <p className="text-3xl font-bold mt-2">R$ 320</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">+5%</span>
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
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
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
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </CardHeader>
          <CardContent>
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
                      <p className="font-medium">{payment.student}</p>
                      <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">R$ {payment.value}</span>
                    <Badge variant={
                      payment.status === "pago" ? "success" :
                      payment.status === "pendente" ? "warning" : "destructive"
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
