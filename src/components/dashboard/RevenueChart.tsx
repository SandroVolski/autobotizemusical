import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", receita: 12400, despesa: 8200 },
  { month: "Fev", receita: 13100, despesa: 8400 },
  { month: "Mar", receita: 14800, despesa: 8600 },
  { month: "Abr", receita: 15200, despesa: 8800 },
  { month: "Mai", receita: 16100, despesa: 9000 },
  { month: "Jun", receita: 17500, despesa: 9200 },
];

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Receita vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158, 100%, 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(158, 100%, 50%)" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="despesa"
                  stroke="hsl(158, 100%, 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDespesa)"
                  name="Despesa"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Despesas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
