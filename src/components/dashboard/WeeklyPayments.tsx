import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ChevronRight, AlertCircle, CheckCircle, Clock, UserRound } from "lucide-react";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAlunos } from "@/hooks/useAlunos";
import { usePaymentStatuses } from "@/hooks/usePaymentStatus";
import { PaymentStatusDot } from "@/components/ui/payment-status-dot";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // TOTAL: All payments with status "pago" in the current month
  const pagamentosPagosMes = pagamentos?.filter(p => {
    if (p.status !== "pago" || !p.data_pagamento) return false;
    const pagto = new Date(p.data_pagamento + "T00:00:00");
    return pagto.getMonth() === currentMonth && pagto.getFullYear() === currentYear;
  }) || [];
  const totalMes = pagamentosPagosMes.reduce((acc, p) => acc + Number(p.valor), 0);

  // RECEBIDO: Payments with status "pago" received THIS WEEK
  const recebidoSemana = pagamentos?.filter(p => {
    if (p.status !== "pago" || !p.data_pagamento) return false;
    const pagto = new Date(p.data_pagamento + "T00:00:00");
    return pagto >= startOfWeek && pagto <= endOfWeek;
  }).reduce((acc, p) => acc + Number(p.valor), 0) || 0;

  // ALL active students who haven't paid this month - not just this week
  const alunosDevedores = alunos?.filter(a => {
    if (a.status !== "ativo" || !a.dia_vencimento) return false;
    // Check if there's a paid payment for current month
    const isPaidThisMonth = pagamentos?.some(p =>
      p.aluno_id === a.id &&
      p.status === "pago" &&
      p.data_vencimento &&
      new Date(p.data_vencimento + "T00:00:00").getMonth() === currentMonth &&
      new Date(p.data_vencimento + "T00:00:00").getFullYear() === currentYear
    );
    return !isPaidThisMonth;
  }).sort((a, b) => {
    // Sort: overdue first (dia_vencimento already passed), then upcoming
    const aOverdue = a.dia_vencimento! <= today.getDate();
    const bOverdue = b.dia_vencimento! <= today.getDate();
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return a.dia_vencimento! - b.dia_vencimento!;
  }) || [];

  // PENDENTE: Sum of unpaid payments for current month + estimates for devedores without records
  const totalPendenteRegistrado = pagamentos?.filter(p => {
    if (!p.data_vencimento || p.status === "pago") return false;
    const venc = new Date(p.data_vencimento + "T00:00:00");
    return venc.getMonth() === currentMonth && venc.getFullYear() === currentYear;
  }).reduce((acc, p) => acc + Number(p.valor), 0) || 0;

  const alunosComRegistroPendente = new Set(
    pagamentos?.filter(p => {
      if (!p.data_vencimento || p.status === "pago") return false;
      const venc = new Date(p.data_vencimento + "T00:00:00");
      return venc.getMonth() === currentMonth && venc.getFullYear() === currentYear;
    }).map(p => p.aluno_id) || []
  );

  const totalPendenteSemRegistro = alunosDevedores
    .filter(a => !alunosComRegistroPendente.has(a.id))
    .reduce((acc, aluno) => {
      const ultimoPagamento = pagamentos?.filter(p => p.aluno_id === aluno.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      return acc + (ultimoPagamento ? Number(ultimoPagamento.valor) : 0);
    }, 0);

  const totalPendente = totalPendenteRegistrado + totalPendenteSemRegistro;

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

  const getDayOfWeekName = (diaVenc: number) => {
    // Find which day of this week matches dia_vencimento
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      if (d.getDate() === diaVenc) {
        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        return days[d.getDay()];
      }
    }
    return "";
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
           <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50 min-w-0">
              <p className="text-xs sm:text-2xl font-bold truncate">
                {totalMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Mês</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-success/10 min-w-0">
              <p className="text-xs sm:text-2xl font-bold text-success truncate">
                {recebidoSemana.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Recebido</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-warning/10 min-w-0">
              <p className="text-xs sm:text-2xl font-bold text-warning truncate">
                {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>

          <Tabs defaultValue="cobrar" className="w-full">
            <TabsList className="w-full mb-3 bg-muted/50">
              <TabsTrigger value="cobrar" className="flex-1 text-xs">
                <UserRound className="w-3.5 h-3.5 mr-1" />A Cobrar ({alunosDevedores.length})
              </TabsTrigger>
              <TabsTrigger value="pagamentos" className="flex-1 text-xs">
                <DollarSign className="w-3.5 h-3.5 mr-1" />Pagamentos ({pagamentosSemana.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pagamentos" className="mt-0">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm truncate">
                            {pagamento.alunos?.nome || "Aluno não identificado"}
                          </p>
                          {pagamento.aluno_id && (() => {
                            const status = paymentStatuses.get(pagamento.aluno_id);
                            return status ? <PaymentStatusDot color={status.color} label={status.label} size="sm" /> : null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {pagamento.tipo || "Mensalidade"} • {pagamento.referencia || ""}
                          </span>
                        </div>
                      </div>

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
            </TabsContent>

            <TabsContent value="cobrar" className="mt-0">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alunosDevedores.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Todos os alunos estão em dia! 🎉</p>
                  </div>
                ) : (
                  alunosDevedores.map((aluno, index) => {
                    const status = paymentStatuses.get(aluno.id);
                    const isOverdue = aluno.dia_vencimento! <= today.getDate();
                    return (
                      <motion.div
                        key={aluno.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.03 * index }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          status?.color === "red"
                            ? "bg-destructive/10 border border-destructive/20 hover:bg-destructive/15"
                            : isOverdue
                            ? "bg-destructive/5 border border-destructive/10 hover:bg-destructive/10"
                            : "bg-warning/5 border border-warning/15 hover:bg-warning/10"
                        }`}
                        onClick={() => navigate(`/alunos/${aluno.id}`)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          status?.color === "red" || isOverdue ? "bg-destructive/20" : "bg-warning/20"
                        }`}>
                          <UserRound className={`w-5 h-5 ${status?.color === "red" || isOverdue ? "text-destructive" : "text-warning"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">{aluno.nome}</p>
                            {status && <PaymentStatusDot color={status.color} label={status.label} size="sm" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Vencimento dia {aluno.dia_vencimento}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant={status?.color === "red" || isOverdue ? "destructive" : "warning"} className="text-[10px]">
                            <AlertCircle className="w-3 h-3 mr-0.5" /> {status?.color === "red" || isOverdue ? "Devendo" : "Cobrar"}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}