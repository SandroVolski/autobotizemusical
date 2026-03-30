import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CalendarOff, Plus, Trash2, Loader2, Clock, CalendarDays, Send, MessageSquare,
  AlertCircle, CheckCircle2, Calendar as CalendarIcon, PartyPopper, History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFeriados, useCreateFeriado, useDeleteFeriado, useUpdateFeriado, type NovoFeriado } from "@/hooks/useFeriados";
import { useAlunos } from "@/hooks/useAlunos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Feriados() {
  const { data: feriados, isLoading } = useFeriados();
  const { data: alunos } = useAlunos();
  const createFeriado = useCreateFeriado();
  const deleteFeriado = useDeleteFeriado();
  const updateFeriado = useUpdateFeriado();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [form, setForm] = useState<NovoFeriado>({
    data: "", titulo: "", motivo: "", dia_todo: true,
    horario_inicio: "", horario_fim: "", notificar_whatsapp: false,
  });
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(new Date());

  const feriadoDates = useMemo(() => {
    return new Set(feriados?.map(f => f.data) || []);
  }, [feriados]);

  const upcomingFeriados = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return feriados?.filter(f => f.data >= today).slice(0, 10) || [];
  }, [feriados]);

  const pastFeriados = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return feriados?.filter(f => f.data < today).reverse().slice(0, 10) || [];
  }, [feriados]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      setForm(prev => ({ ...prev, data: dateStr }));
      const existing = feriados?.find(f => f.data === dateStr);
      if (!existing) setIsDialogOpen(true);
    }
  };

  const handleCreate = async () => {
    if (!form.data || !form.titulo) {
      toast({ title: "Erro", description: "Data e título são obrigatórios", variant: "destructive" });
      return;
    }
    await createFeriado.mutateAsync({
      ...form,
      horario_inicio: form.dia_todo ? undefined : form.horario_inicio || undefined,
      horario_fim: form.dia_todo ? undefined : form.horario_fim || undefined,
    });
    setIsDialogOpen(false);
    setForm({ data: "", titulo: "", motivo: "", dia_todo: true, horario_inicio: "", horario_fim: "", notificar_whatsapp: false });
    setSelectedDate(undefined);
  };

  const handleSendWhatsApp = async (feriado: typeof upcomingFeriados[0]) => {
    setSendingId(feriado.id);
    try {
      const activeStudents = alunos?.filter(a => a.status === "ativo" && (a.responsavel_telefone || a.telefone)) || [];
      if (activeStudents.length === 0) {
        toast({ title: "Sem alunos", description: "Nenhum aluno ativo com telefone cadastrado", variant: "destructive" });
        return;
      }

      const dateFormatted = new Date(feriado.data + "T00:00:00").toLocaleDateString("pt-BR", {
        weekday: "long", day: "2-digit", month: "long",
      });
      let horarioInfo = "";
      if (!feriado.dia_todo && feriado.horario_inicio && feriado.horario_fim) {
        horarioInfo = ` das ${feriado.horario_inicio.slice(0, 5)} às ${feriado.horario_fim.slice(0, 5)}`;
      }

      let sent = 0;
      for (const aluno of activeStudents) {
        const phone = aluno.responsavel_telefone || aluno.telefone;
        if (!phone) continue;
        let cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone.startsWith("55")) cleanPhone = "55" + cleanPhone;
        const message = `📢 *Aviso Importante*\n\nOlá! Informamos que *não haverá aula* no dia *${dateFormatted}*${horarioInfo}.\n\n📌 *Motivo:* ${feriado.motivo || feriado.titulo}\n\nQualquer dúvida, entre em contato! 🎵`;
        try {
          await supabase.functions.invoke("whatsapp-connection", {
            body: { action: "send", phone: cleanPhone, message },
          });
          sent++;
        } catch { /* continue */ }
      }

      await updateFeriado.mutateAsync({ id: feriado.id, notificacao_enviada: true });
      toast({ title: "Mensagens enviadas!", description: `${sent} de ${activeStudents.length} alunos notificados via WhatsApp` });
    } catch (error: any) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const renderFeriadoCard = (feriado: typeof upcomingFeriados[0], index: number, isPast = false) => {
    const dateObj = new Date(feriado.data + "T00:00:00");
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
    const isToday = feriado.data === todayStr;
    const isTomorrow = feriado.data === tomorrowStr;

    return (
      <motion.div
        key={feriado.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 * index }}
        className={cn(
          "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all",
          isPast
            ? "bg-muted/20 border-border/50 opacity-70"
            : isToday
            ? "bg-destructive/8 border-destructive/25 shadow-sm"
            : isTomorrow
            ? "bg-warning/8 border-warning/25 shadow-sm"
            : "bg-card/50 border-border hover:border-primary/20 hover:shadow-sm"
        )}
      >
        {/* Date block */}
        <div className={cn(
          "w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-semibold",
          isPast ? "bg-muted" :
          isToday ? "bg-destructive/15 text-destructive" :
          isTomorrow ? "bg-warning/15 text-warning" :
          "bg-primary/10 text-primary"
        )}>
          <span className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
            {dateObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
          </span>
          <span className="text-lg sm:text-xl font-bold leading-tight">{dateObj.getDate()}</span>
          <span className="text-[10px] opacity-70">
            {dateObj.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm sm:text-base truncate">{feriado.titulo}</p>
            {isToday && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Hoje</Badge>}
            {isTomorrow && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Amanhã</Badge>}
          </div>
          {feriado.motivo && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{feriado.motivo}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-normal">
              {feriado.dia_todo ? (
                <><CalendarIcon className="w-3 h-3 mr-1" />Dia todo</>
              ) : (
                <><Clock className="w-3 h-3 mr-1" />{feriado.horario_inicio?.slice(0, 5)} – {feriado.horario_fim?.slice(0, 5)}</>
              )}
            </Badge>
            {feriado.notificacao_enviada && (
              <Badge variant="success" className="text-[10px] font-normal px-1.5 py-0">
                <CheckCircle2 className="w-3 h-3 mr-0.5" />Notificado
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isPast && feriado.notificar_whatsapp && !feriado.notificacao_enviada && (
            <Button variant="outline" size="sm" className="text-xs h-8 hidden sm:flex"
              onClick={() => handleSendWhatsApp(feriado)}
              disabled={sendingId === feriado.id}>
              {sendingId === feriado.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><Send className="w-3.5 h-3.5 mr-1" />Notificar</>
              )}
            </Button>
          )}
          {!isPast && feriado.notificar_whatsapp && !feriado.notificacao_enviada && (
            <Button variant="outline" size="icon" className="h-8 w-8 sm:hidden"
              onClick={() => handleSendWhatsApp(feriado)}
              disabled={sendingId === feriado.id}>
              {sendingId === feriado.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover feriado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja remover "{feriado.titulo}" ({dateObj.toLocaleDateString("pt-BR")})?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteFeriado.mutate(feriado.id)}>Remover</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <PartyPopper className="w-7 h-7 text-primary" />
            Feriados & Recesso
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os dias sem aula e notifique seus alunos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Novo Feriado</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Feriado / Recesso</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data *</Label>
                <Input type="date" value={form.data}
                  onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Título *</Label>
                <Input placeholder="Ex: Feriado Nacional, Recesso Escolar"
                  value={form.titulo} onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Motivo / Descrição</Label>
                <Textarea placeholder="Descreva o motivo..." rows={2}
                  value={form.motivo || ""} onChange={(e) => setForm(prev => ({ ...prev, motivo: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Dia todo</Label>
                <Switch checked={form.dia_todo}
                  onCheckedChange={(v) => setForm(prev => ({ ...prev, dia_todo: v }))} />
              </div>
              {!form.dia_todo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Início</Label>
                    <Input type="time" value={form.horario_inicio || ""}
                      onChange={(e) => setForm(prev => ({ ...prev, horario_inicio: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fim</Label>
                    <Input type="time" value={form.horario_fim || ""}
                      onChange={(e) => setForm(prev => ({ ...prev, horario_fim: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Notificar via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Enviar aviso aos alunos</p>
                  </div>
                </div>
                <Switch checked={form.notificar_whatsapp}
                  onCheckedChange={(v) => setForm(prev => ({ ...prev, notificar_whatsapp: v }))} />
              </div>
              <Button className="w-full mt-2" onClick={handleCreate} disabled={createFeriado.isPending}>
                {createFeriado.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Cadastrar Feriado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total cadastrados", value: feriados?.length || 0, icon: CalendarDays, color: "text-primary" },
          { label: "Próximos", value: upcomingFeriados.length, icon: CalendarOff, color: "text-warning" },
          { label: "Notificados", value: feriados?.filter(f => f.notificacao_enviada).length || 0, icon: CheckCircle2, color: "text-success" },
          { label: "Pendente notif.", value: feriados?.filter(f => f.notificar_whatsapp && !f.notificacao_enviada).length || 0, icon: AlertCircle, color: "text-destructive" },
        ].map((stat, i) => (
          <Card key={i} variant="glass" className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
              <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4">
          <Card variant="glass" className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={calMonth}
                onMonthChange={setCalMonth}
                className="p-2 pointer-events-auto"
                modifiers={{ holiday: (date) => feriadoDates.has(date.toISOString().split("T")[0]) }}
                modifiersClassNames={{ holiday: "bg-destructive/20 text-destructive font-bold rounded-full" }}
              />
            </CardContent>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive/30" />
                <span>Dias com feriado/recesso</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Holidays List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-8">
          <Card variant="glass">
            <Tabs defaultValue="upcoming">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarOff className="w-4 h-4 text-primary" />
                    Feriados
                  </CardTitle>
                  <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="upcoming" className="text-xs h-7 px-3">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />Próximos
                    </TabsTrigger>
                    <TabsTrigger value="past" className="text-xs h-7 px-3">
                      <History className="w-3.5 h-3.5 mr-1" />Anteriores
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="upcoming" className="mt-0">
                  <div className="space-y-2">
                    {upcomingFeriados.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <PartyPopper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Nenhum feriado cadastrado</p>
                        <p className="text-xs mt-1">Clique em uma data no calendário ou use o botão "Novo Feriado"</p>
                      </div>
                    ) : (
                      upcomingFeriados.map((f, i) => renderFeriadoCard(f, i))
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="past" className="mt-0">
                  <div className="space-y-2">
                    {pastFeriados.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhum feriado anterior</p>
                      </div>
                    ) : (
                      pastFeriados.map((f, i) => renderFeriadoCard(f, i, true))
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
