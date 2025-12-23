import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Loader2 } from "lucide-react";

export function RevenueChart() {
  const { data: pagamentos, isLoading } = usePagamentos();

  // Calculate monthly data from real payments
  const monthlyData = pagamentos?.reduce((acc, pagamento) => {
    const date = new Date(pagamento.data_vencimento);
    const monthKey = date.toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find(a => a.month === monthKey);
    
    const valor = Number(pagamento.valor) || 0;
    const isReceita = pagamento.status === "pago";
    
    if (existing) {
      if (isReceita) {
        existing.receita += valor;
      }
    } else {
      acc.push({ 
        month: monthKey, 
        receita: isReceita ? valor : 0,
        despesa: 0 // Would need a separate expenses table for real data
      });
    }
    return acc;
  }, [] as { month: string; receita: number; despesa: number }[]) || [];

  // Sort by month order
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
                      <stop offset="5%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(0, 0%, 60%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(0, 0%, 60%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 8%)",
                      border: "1px solid hsl(0, 0%, 15%)",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                    labelStyle={{ color: "hsl(0, 0%, 94%)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="hsl(270, 100%, 50%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    name="Receita"
                  />
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
