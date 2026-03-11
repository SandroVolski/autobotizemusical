import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ChevronRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAlunos } from "@/hooks/useAlunos";
import { usePaymentStatuses } from "@/hooks/usePaymentStatus";
import { PaymentStatusDot } from "@/components/ui/payment-status-dot";
import { useNavigate } from "react-router-dom";

export function WeeklyPayments() {
  const navigate = useNavigate();
  const { data: pagamentos } = usePagamentos();
  const { data: alunos } = useAlunos();
  const paymentStatuses = usePaymentStatuses(alunos);

  // Calculate week range (Sunday to Saturday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter payments due this week
  const pagamentosSemana = pagamentos?.filter((p) => {
    if (!p.data_vencimento) return false;
    const vencimento = new Date(p.data_vencimento + "T00:00:00");
    return vencimento >= startOfWeek && vencimento <= endOfWeek;
  }).sort((a, b) => {
    const dateA = new Date(a.data_vencimento!);
    const dateB = new Date(b.data_vencimento!);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  const totalSemana = pagamentosSemana.reduce((acc, p) => acc + Number(p.valor), 0);
  const totalPago = pagamentosSemana.filter(p => p.status === "pago").reduce((acc, p) => acc + Number(p.valor), 0);
  const totalPendente = totalSemana - totalPago;

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[date.getDay()];
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toDateString() === today.toDateString();
  };

  const isPast = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    date.setHours(23, 59, 59, 999);
    return date < today;
  };

  const formatWeekRange = () => {
    return `${startOfWeek.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - ${endOfWeek.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Pagamentos da Semana
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{formatWeekRange()}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/financeiro")}>
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">
                {totalSemana.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-success/10">
              <p className="text-lg font-bold text-success">
                {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] text-muted-foreground">Recebido</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-warning/10">
              <p className="text-lg font-bold text-warning">
                {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] text-muted-foreground">Pendente</p>
            </div>
          </div>

          {/* Payment list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {pagamentosSemana.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum pagamento esta semana</p>
              </div>
            ) : (
              pagamentosSemana.map((pagamento, index) => (
                <motion.div
                  key={pagamento.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    isToday(pagamento.data_vencimento!)
                      ? "bg-primary/10 border border-primary/20"
                      : pagamento.status === "pago"
                      ? "bg-success/5"
                      : isPast(pagamento.data_vencimento!) && pagamento.status !== "pago"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => navigate("/financeiro")}
                >
                  {/* Day indicator */}
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                    isToday(pagamento.data_vencimento!) 
                      ? "bg-primary/20" 
                      : pagamento.status === "pago"
                      ? "bg-success/20"
                      : isPast(pagamento.data_vencimento!) 
                      ? "bg-destructive/20"
                      : "bg-muted"
                  }`}>
                    <span className={`text-[10px] font-medium ${
                      isToday(pagamento.data_vencimento!) ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {getDayName(pagamento.data_vencimento!)}
                    </span>
                    <span className={`text-sm font-bold ${
                      isToday(pagamento.data_vencimento!) ? "text-primary" : ""
                    }`}>
                      {new Date(pagamento.data_vencimento! + "T00:00:00").getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {pagamento.alunos?.nome || "Aluno não identificado"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {pagamento.tipo || "Mensalidade"} • {pagamento.referencia || ""} 
                        {pagamento.alunos && (pagamento as any).dia_vencimento ? ` • Venc. dia ${(pagamento as any).dia_vencimento}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Value and Status */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">
                      {Number(pagamento.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    {pagamento.status === "pago" ? (
                      <Badge variant="success" className="text-[10px] mt-0.5">
                        <CheckCircle className="w-3 h-3 mr-0.5" /> Pago
                      </Badge>
                    ) : isPast(pagamento.data_vencimento!) ? (
                      <Badge variant="destructive" className="text-[10px] mt-0.5">
                        <AlertCircle className="w-3 h-3 mr-0.5" /> Atrasado
                      </Badge>
                    ) : isToday(pagamento.data_vencimento!) ? (
                      <Badge variant="warning" className="text-[10px] mt-0.5">
                        <Clock className="w-3 h-3 mr-0.5" /> Hoje
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        <Clock className="w-3 h-3 mr-0.5" /> Pendente
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
