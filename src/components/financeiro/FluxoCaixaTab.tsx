import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useContasPagar } from "@/hooks/useContasPagar";
import { useVendas } from "@/hooks/useVendas";

export function FluxoCaixaTab({ selectedMonth, selectedYear }: { selectedMonth: number; selectedYear: number }) {
  const { data: pagamentos } = usePagamentos();
  const { data: contas } = useContasPagar();
  const { data: vendas } = useVendas();

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  const entradasMes = useMemo(() => {
    let total = 0;
    pagamentos?.forEach(p => { if (p.status === "pago" && p.data_pagamento?.startsWith(monthPrefix)) total += Number(p.valor); });
    vendas?.forEach(v => { if (v.created_at.startsWith(monthPrefix)) total += Number(v.total); });
    return total;
  }, [pagamentos, vendas, monthPrefix]);

  const saidasMes = useMemo(() => {
    let total = 0;
    contas?.forEach(c => { if (c.status === "pago" && c.data_pagamento?.startsWith(monthPrefix)) total += Number(c.valor); });
    return total;
  }, [contas, monthPrefix]);

  const saldoMes = entradasMes - saidasMes;

  // Daily breakdown for the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyBreakdown = useMemo(() => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayDate = new Date(selectedYear, selectedMonth, d);
      const label = dayDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
      let entradas = 0, saidas = 0;
      pagamentos?.forEach(p => { if (p.status === "pago" && p.data_pagamento === dateStr) entradas += Number(p.valor); });
      vendas?.forEach(v => { if (v.created_at.startsWith(dateStr)) entradas += Number(v.total); });
      contas?.forEach(c => { if (c.status === "pago" && c.data_pagamento === dateStr) saidas += Number(c.valor); });
      if (entradas > 0 || saidas > 0) {
        days.push({ label, entradas, saidas, saldo: entradas - saidas, date: dateStr });
      }
    }
    return days;
  }, [pagamentos, contas, vendas, selectedMonth, selectedYear, daysInMonth]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entradas do Mês</p>
                  <p className="text-2xl font-bold text-success">{fmt(entradasMes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saídas do Mês</p>
                  <p className="text-2xl font-bold text-destructive">{fmt(saidasMes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${saldoMes >= 0 ? "bg-success/20" : "bg-destructive/20"}`}>
                  {saldoMes >= 0 ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo do Mês</p>
                  <p className={`text-2xl font-bold ${saldoMes >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldoMes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Breakdown */}
      <Card variant="glass">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Movimentações do Mês</h3>
          {dailyBreakdown.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação neste mês</p>
          ) : (
            <div className="space-y-2">
              {dailyBreakdown.map((day, i) => (
                <motion.div key={day.date} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium w-28">{day.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-success">+{fmt(day.entradas)}</span>
                    <span className="text-sm text-destructive">-{fmt(day.saidas)}</span>
                    <Badge variant={day.saldo >= 0 ? "success" : "destructive"} className="min-w-[100px] justify-center">
                      {fmt(day.saldo)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
