import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useContasPagar } from "@/hooks/useContasPagar";
import { useVendas } from "@/hooks/useVendas";

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function FluxoCaixaTab() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: pagamentos } = usePagamentos();
  const { data: contas } = useContasPagar();
  const { data: vendas } = useVendas();

  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Today's summary
  const entradasHoje = useMemo(() => {
    let total = 0;
    pagamentos?.forEach(p => { if (p.status === "pago" && p.data_pagamento === today) total += Number(p.valor); });
    vendas?.forEach(v => { if (v.created_at.startsWith(today)) total += Number(v.total); });
    return total;
  }, [pagamentos, vendas, today]);

  const saidasHoje = useMemo(() => {
    let total = 0;
    contas?.forEach(c => { if (c.status === "pago" && c.data_pagamento === today) total += Number(c.valor); });
    return total;
  }, [contas, today]);

  const saldoHoje = entradasHoje - saidasHoje;

  // Monthly summary
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

  // Last 7 days breakdown
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
      let entradas = 0, saidas = 0;
      pagamentos?.forEach(p => { if (p.status === "pago" && p.data_pagamento === dateStr) entradas += Number(p.valor); });
      vendas?.forEach(v => { if (v.created_at.startsWith(dateStr)) entradas += Number(v.total); });
      contas?.forEach(c => { if (c.status === "pago" && c.data_pagamento === dateStr) saidas += Number(c.valor); });
      days.push({ label, entradas, saidas, saldo: entradas - saidas, date: dateStr });
    }
    return days;
  }, [pagamentos, contas, vendas]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
        <div className="flex items-center gap-2 min-w-[200px] justify-center">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-lg font-semibold">{meses[selectedMonth]} {selectedYear}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
      </div>

      {/* Today's Summary */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Resumo de Hoje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="interactive">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas Hoje</p>
                    <p className="text-2xl font-bold text-success">{fmt(entradasHoje)}</p>
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
                    <p className="text-sm text-muted-foreground">Saídas Hoje</p>
                    <p className="text-2xl font-bold text-destructive">{fmt(saidasHoje)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card variant="interactive">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${saldoHoje >= 0 ? "bg-success/20" : "bg-destructive/20"}`}>
                    {saldoHoje >= 0 ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo do Dia</p>
                    <p className={`text-2xl font-bold ${saldoHoje >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldoHoje)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Resumo de {meses[selectedMonth]}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Last 7 Days */}
      <Card variant="glass">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Últimos 7 dias</h3>
          <div className="space-y-2">
            {last7Days.map((day, i) => (
              <motion.div key={day.date} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium w-24">{day.label}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
