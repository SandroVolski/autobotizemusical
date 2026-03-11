import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Send,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  UserRound,
  MessageSquare,
  Bell,
  Calendar,
  Wifi,
  WifiOff,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { usePaymentStatuses } from "@/hooks/usePaymentStatus";
import { PaymentStatusDot } from "@/components/ui/payment-status-dot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Cobrancas() {
  const { data: alunos, isLoading: loadingAlunos } = useAlunos();
  const { data: pagamentos, isLoading: loadingPagamentos } = usePagamentos();
  const paymentStatuses = usePaymentStatuses(alunos);
  const [sendingFor, setSendingFor] = useState<string | null>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [cobrancaDesabilitados, setCobrancaDesabilitados] = useState<Set<string>>(new Set());
  const [cobrancaGlobal, setCobrancaGlobal] = useState(true);

  // Load prefs
  useEffect(() => {
    const saved = localStorage.getItem("cobranca_prefs");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setCobrancaDesabilitados(new Set(prefs.desabilitados || []));
        setCobrancaGlobal(prefs.global ?? true);
      } catch {}
    }
  }, []);

  const savePrefs = (desabilitados: Set<string>, global: boolean) => {
    localStorage.setItem("cobranca_prefs", JSON.stringify({
      desabilitados: Array.from(desabilitados),
      global,
    }));
  };

  const toggleAlunoCobranca = (alunoId: string) => {
    setCobrancaDesabilitados(prev => {
      const next = new Set(prev);
      if (next.has(alunoId)) next.delete(alunoId);
      else next.add(alunoId);
      savePrefs(next, cobrancaGlobal);
      return next;
    });
  };

  const toggleGlobal = (value: boolean) => {
    setCobrancaGlobal(value);
    savePrefs(cobrancaDesabilitados, value);
  };

  // Check WhatsApp
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke("whatsapp-connection", { body: { action: "status" } });
        setWhatsappConnected((data?.state || data?.instance?.state) === "open");
      } catch { setWhatsappConnected(false); }
    };
    check();
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const alunosAtrasados = useMemo(() => {
    if (!alunos || !pagamentos) return [];
    return alunos.filter(a => {
      if (a.status !== "ativo" || !a.dia_vencimento) return false;
      const dueDate = new Date(currentYear, currentMonth, a.dia_vencimento);
      if (today <= dueDate) return false;
      const isPaid = pagamentos.some(p =>
        p.aluno_id === a.id && p.status === "pago" && p.data_vencimento &&
        new Date(p.data_vencimento + "T00:00:00").getMonth() === currentMonth &&
        new Date(p.data_vencimento + "T00:00:00").getFullYear() === currentYear
      );
      return !isPaid;
    });
  }, [alunos, pagamentos, currentMonth, currentYear]);

  const alunosProximos = useMemo(() => {
    if (!alunos || !pagamentos) return [];
    return alunos.filter(a => {
      if (a.status !== "ativo" || !a.dia_vencimento) return false;
      const dueDate = new Date(currentYear, currentMonth, a.dia_vencimento);
      const threeDaysBefore = new Date(dueDate);
      threeDaysBefore.setDate(dueDate.getDate() - 3);
      if (today < threeDaysBefore || today >= dueDate) return false;
      const isPaid = pagamentos.some(p =>
        p.aluno_id === a.id && p.status === "pago" && p.data_vencimento &&
        new Date(p.data_vencimento + "T00:00:00").getMonth() === currentMonth &&
        new Date(p.data_vencimento + "T00:00:00").getFullYear() === currentYear
      );
      return !isPaid;
    });
  }, [alunos, pagamentos, currentMonth, currentYear]);

  const getWhatsAppLink = (aluno: any, tipo: "atrasado" | "lembrete") => {
    const phone = aluno.responsavel_telefone || aluno.telefone;
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const nome = aluno.responsavel_nome || aluno.nome;
    const message = tipo === "atrasado"
      ? `Olá ${nome}! 🎵\n\nGostaríamos de lembrar que o pagamento da mensalidade do(a) aluno(a) *${aluno.nome}* está pendente (vencimento dia ${aluno.dia_vencimento}).\n\nPor favor, entre em contato para regularizar. Obrigado! 😊`
      : `Olá ${nome}! 🎵\n\nLembramos que a mensalidade do(a) aluno(a) *${aluno.nome}* vence no dia *${aluno.dia_vencimento}*.\n\nQualquer dúvida, estamos à disposição! 😊`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleAutoSend = async (aluno: any, tipo: "atrasado" | "lembrete") => {
    const phone = aluno.responsavel_telefone || aluno.telefone;
    if (!phone) return;
    setSendingFor(aluno.id);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      const nome = aluno.responsavel_nome || aluno.nome;
      const message = tipo === "atrasado"
        ? `Olá ${nome}! 🎵\n\nGostaríamos de lembrar que o pagamento da mensalidade do(a) aluno(a) *${aluno.nome}* está pendente (vencimento dia ${aluno.dia_vencimento}).\n\nPor favor, entre em contato para regularizar. Obrigado! 😊`
        : `Olá ${nome}! 🎵\n\nLembramos que a mensalidade do(a) aluno(a) *${aluno.nome}* vence no dia *${aluno.dia_vencimento}*.\n\nQualquer dúvida, estamos à disposição! 😊`;

      const { error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "send", phone: fullPhone, message },
      });
      if (error) throw error;
      toast({ title: "Mensagem enviada!", description: `Cobrança enviada para ${nome}` });
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSendingFor(null);
    }
  };

  if (loadingAlunos || loadingPagamentos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStudentCard = (aluno: any, tipo: "atrasado" | "lembrete") => {
    const status = paymentStatuses.get(aluno.id);
    const waLink = getWhatsAppLink(aluno, tipo);
    const contactName = aluno.responsavel_nome || aluno.nome;
    const contactPhone = aluno.responsavel_telefone || aluno.telefone;
    const isDisabled = cobrancaDesabilitados.has(aluno.id);

    return (
      <motion.div key={aluno.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="interactive" className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                tipo === "atrasado" ? "bg-destructive/20" : "bg-warning/20"
              }`}>
                <UserRound className={`w-5 h-5 ${tipo === "atrasado" ? "text-destructive" : "text-warning"}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm truncate">{aluno.nome}</p>
                  {status && <PaymentStatusDot color={status.color} label={status.label} size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vencimento dia {aluno.dia_vencimento} • {contactName}
                </p>
                {contactPhone && <p className="text-xs text-muted-foreground">{contactPhone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={tipo === "atrasado" ? "destructive" : "warning"} className="text-[10px]">
                {tipo === "atrasado" ? (
                  <><AlertCircle className="w-3 h-3 mr-0.5" /> Atrasado</>
                ) : (
                  <><Clock className="w-3 h-3 mr-0.5" /> Próximo</>
                )}
              </Badge>
              {/* Manual WhatsApp */}
              {waLink && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(waLink, "_blank")}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cobrar</span>
                </Button>
              )}
              {/* Auto dispatch */}
              {whatsappConnected && contactPhone && cobrancaGlobal && !isDisabled && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1"
                  disabled={sendingFor === aluno.id}
                  onClick={() => handleAutoSend(aluno, tipo)}
                >
                  {sendingFor === aluno.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              )}
              {!contactPhone && <Badge variant="outline" className="text-[10px]">Sem telefone</Badge>}
              {/* Per-student toggle */}
              <Switch
                checked={!isDisabled}
                onCheckedChange={() => toggleAlunoCobranca(aluno.id)}
                className="ml-1"
              />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobranças e Lembretes</h1>
          <p className="text-muted-foreground">
            Envie lembretes de pagamento para alunos via WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={whatsappConnected ? "default" : "outline"} className="gap-1">
              {whatsappConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {whatsappConnected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Disparo automático</span>
            <Switch checked={cobrancaGlobal} onCheckedChange={toggleGlobal} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alunosAtrasados.length}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alunosProximos.length}</p>
                <p className="text-xs text-muted-foreground">Próximos (3 dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(alunos?.filter(a => a.status === "ativo").length || 0) - alunosAtrasados.length - alunosProximos.length}
                </p>
                <p className="text-xs text-muted-foreground">Em dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {today.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                </p>
                <p className="text-xs text-muted-foreground">Mês atual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="atrasados" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="atrasados" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Atrasados ({alunosAtrasados.length})
          </TabsTrigger>
          <TabsTrigger value="lembretes" className="gap-2">
            <Bell className="w-4 h-4" />
            Próximos ({alunosProximos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atrasados" className="space-y-3">
          {alunosAtrasados.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum aluno atrasado!</h3>
                <p className="text-muted-foreground">Todos os pagamentos estão em dia 🎉</p>
              </CardContent>
            </Card>
          ) : (
            alunosAtrasados.map(a => renderStudentCard(a, "atrasado"))
          )}
        </TabsContent>

        <TabsContent value="lembretes" className="space-y-3">
          {alunosProximos.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum vencimento próximo</h3>
                <p className="text-muted-foreground">Não há alunos com vencimento nos próximos 3 dias</p>
              </CardContent>
            </Card>
          ) : (
            alunosProximos.map(a => renderStudentCard(a, "lembrete"))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
