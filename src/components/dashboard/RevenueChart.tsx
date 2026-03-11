import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Loader2 } from "lucide-react";

export function RevenueChart() {
  const { data: pagamentos, isLoading } = usePagamentos();

  const monthlyData = pagamentos?.reduce((acc, pagamento) => {
    if (!pagamento.data_vencimento) return acc;
    const date = new Date(pagamento.data_vencimento + "T00:00:00");
    if (isNaN(date.getTime())) return acc;
    const monthKey = date.toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find(a => a.month === monthKey);
    
    const valor = Number(pagamento.valor) || 0;
    const isReceita = pagamento.status === "pago";
    
    if (existing) {
      if (isReceita) existing.receita += valor;
    } else {
      acc.push({ month: monthKey, receita: isReceita ? valor : 0, despesa: 0 });
    }
    return acc;
  }, [] as { month: string; receita: number; despesa: number }[]) || [];

  const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  monthlyData.sort((a, b) => {
    const aIndex = monthOrder.findIndex(m => a.month.toLowerCase().startsWith(m));
    const bIndex = monthOrder.findIndex(m => b.month.toLowerCase().startsWith(m));
    return aIndex - bIndex;
  });

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(value) => `R$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sem dados de pagamentos para exibir
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Receita</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
