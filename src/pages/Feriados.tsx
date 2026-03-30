import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CalendarOff, Plus, Trash2, Loader2, Clock, CalendarDays, Send, MessageSquare,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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

  // Calendar view month
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
      // Check if there's already a holiday on this date
      const existing = feriados?.find(f => f.data === dateStr);
      if (!existing) {
        setIsDialogOpen(true);
      }
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
      // Get active students with phone numbers
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
            body: {
              action: "send",
              phone: cleanPhone,
              message,
            },
          });
          sent++;
        } catch {
          // Continue with next student
        }
      }

      await updateFeriado.mutateAsync({ id: feriado.id, notificacao_enviada: true });
      toast({
        title: "Mensagens enviadas!",
        description: `${sent} de ${activeStudents.length} alunos notificados via WhatsApp`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Feriados & Recesso</h1>
          <p className="text-muted-foreground text-sm">Gerencie os dias sem aula da escola</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Feriado</Button>
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
              <div className="flex items-center justify-between">
                <Label>Dia todo</Label>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Notificar alunos via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Enviar aviso 1 dia antes</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={calMonth}
                onMonthChange={setCalMonth}
                className={cn("p-3 pointer-events-auto")}
                modifiers={{ holiday: (date) => feriadoDates.has(date.toISOString().split("T")[0]) }}
                modifiersClassNames={{ holiday: "bg-destructive/20 text-destructive font-bold" }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarOff className="w-5 h-5 text-primary" />
                Próximos Feriados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingFeriados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum feriado cadastrado</p>
                    <p className="text-xs">Clique em uma data no calendário ou use o botão "Novo Feriado"</p>
                  </div>
                ) : (
                  upcomingFeriados.map((feriado, index) => {
                    const dateObj = new Date(feriado.data + "T00:00:00");
                    const isTomorrow = (() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return feriado.data === tomorrow.toISOString().split("T")[0];
                    })();
                    const isToday = feriado.data === new Date().toISOString().split("T")[0];

                    return (
                      <motion.div key={feriado.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          isToday ? "bg-destructive/10 border-destructive/30" :
                          isTomorrow ? "bg-warning/10 border-warning/30" : "bg-muted/30 border-border"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                          isToday ? "bg-destructive/20" : isTomorrow ? "bg-warning/20" : "bg-muted"
                        )}>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {dateObj.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                          </span>
                          <span className="text-lg font-bold">{dateObj.getDate()}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {dateObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{feriado.titulo}</p>
                          {feriado.motivo && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{feriado.motivo}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {feriado.dia_todo ? (
                              <Badge variant="outline" className="text-[10px]">Dia todo</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                <Clock className="w-3 h-3 mr-0.5" />
                                {feriado.horario_inicio?.slice(0, 5)} - {feriado.horario_fim?.slice(0, 5)}
                              </Badge>
                            )}
                            {isToday && <Badge variant="destructive" className="text-[10px]">Hoje</Badge>}
                            {isTomorrow && <Badge variant="warning" className="text-[10px]">Amanhã</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {feriado.notificar_whatsapp && !feriado.notificacao_enviada && (
                            <Button variant="outline" size="sm" className="text-xs h-8"
                              onClick={() => handleSendWhatsApp(feriado)}
                              disabled={sendingId === feriado.id}>
                              {sendingId === feriado.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <><Send className="w-3.5 h-3.5 mr-1" />Enviar</>
                              )}
                            </Button>
                          )}
                          {feriado.notificacao_enviada && (
                            <Badge variant="success" className="text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />Enviado
                            </Badge>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
                                <AlertDialogAction onClick={() => deleteFeriado.mutate(feriado.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Past holidays */}
              {pastFeriados.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Feriados Anteriores</h3>
                  <div className="space-y-2">
                    {pastFeriados.map(feriado => {
                      const dateObj = new Date(feriado.data + "T00:00:00");
                      return (
                        <div key={feriado.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 opacity-60">
                          <div className="w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">{dateObj.getDate()}</span>
                            <span className="text-[9px] text-muted-foreground">
                              {dateObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{feriado.titulo}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover feriado?</AlertDialogTitle>
                                <AlertDialogDescription>Remover "{feriado.titulo}"?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteFeriado.mutate(feriado.id)}>Remover</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
