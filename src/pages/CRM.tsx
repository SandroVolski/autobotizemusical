import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Plus, Loader2, Phone, Mail, Trash2, ArrowRight, Users, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useAlunos, useCreateAluno } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";

const columns = [
  { id: "novo_contato", label: "Novo Contato", color: "border-muted-foreground/30 bg-muted/40" },
  { id: "agendou_experimental", label: "Agendou Experimental", color: "border-primary/30 bg-primary/5" },
  { id: "fez_aula", label: "Fez a Aula", color: "border-secondary/30 bg-secondary/5" },
  { id: "lista_espera", label: "Lista de Espera", color: "border-warning/30 bg-warning/5" },
  { id: "matriculado", label: "Matriculado ✅", color: "border-success/30 bg-success/5" },
  { id: "perdido", label: "Perdido ❌", color: "border-destructive/30 bg-destructive/5" },
];

export default function CRM() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollLead, setEnrollLead] = useState<any>(null);
  const [enrollData, setEnrollData] = useState({
    nome: "", telefone: "", email: "", endereco: "", responsavel_nome: "",
    responsavel_telefone: "", objetivo: "", data_nascimento: "", observacoes: "",
  });
  const [newLead, setNewLead] = useState({
    nome: "", telefone: "", email: "", interesse: "", origem: "site", observacoes: "",
  });

  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const createAluno = useCreateAluno();

  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, typeof leads> = {};
    columns.forEach(c => { grouped[c.id] = []; });
    leads?.forEach(l => {
      const status = l.status || "novo_contato";
      if (grouped[status]) grouped[status]!.push(l);
      else grouped["novo_contato"]!.push(l);
    });
    return grouped;
  }, [leads]);

  const handleCreate = () => {
    if (!newLead.nome) return;
    createLead.mutate(newLead, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewLead({ nome: "", telefone: "", email: "", interesse: "", origem: "site", observacoes: "" });
      },
    });
  };

  const moveToNext = (lead: any) => {
    const currentIdx = columns.findIndex(c => c.id === (lead.status || "novo_contato"));
    const nextStatus = columns[currentIdx + 1]?.id;
    if (!nextStatus || nextStatus === "perdido") return;

    if (nextStatus === "matriculado") {
      setEnrollLead(lead);
      setEnrollData({
        nome: lead.nome || "",
        telefone: lead.telefone || "",
        email: lead.email || "",
        endereco: "",
        responsavel_nome: "",
        responsavel_telefone: "",
        objetivo: lead.interesse || "",
        data_nascimento: "",
        observacoes: lead.observacoes || "",
      });
      setEnrollDialogOpen(true);
      return;
    }

    updateLead.mutate({ id: lead.id, status: nextStatus });
  };

  const moveToWaitingList = (lead: any) => {
    updateLead.mutate({ id: lead.id, status: "lista_espera" });
  };

  const handleEnroll = () => {
    if (!enrollLead || !enrollData.nome) return;
    createAluno.mutate({
      nome: enrollData.nome,
      telefone: enrollData.telefone || undefined,
      email: enrollData.email || undefined,
      endereco: enrollData.endereco || undefined,
      responsavel_nome: enrollData.responsavel_nome || undefined,
      responsavel_telefone: enrollData.responsavel_telefone || undefined,
      objetivo: enrollData.objetivo || undefined,
      data_nascimento: enrollData.data_nascimento || undefined,
      observacoes: enrollData.observacoes || undefined,
    }, {
      onSuccess: () => {
        updateLead.mutate({ id: enrollLead.id, status: "matriculado" });
        setEnrollDialogOpen(false);
        setEnrollLead(null);
        toast({ title: "Aluno cadastrado e lead movido para Matriculado!" });
      },
    });
  };

  const markLost = (id: string) => updateLead.mutate({ id, status: "perdido" });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const totalLeads = leads?.length || 0;
  const convertidos = leads?.filter(l => l.status === "matriculado").length || 0;
  const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(0) : "0";
  const waitingCount = leadsByStatus["lista_espera"]?.length || 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Funil de Captação</h1>
          <p className="text-muted-foreground">CRM para gestão de interessados e lista de espera</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Conversão: {taxaConversao}%
          </Badge>
          {waitingCount > 0 && (
            <Badge variant="warning" className="text-sm px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />{waitingCount} em espera
            </Badge>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Novo Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Interessado</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome *</Label>
                  <Input placeholder="Nome do interessado" value={newLead.nome}
                    onChange={(e) => setNewLead(p => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Telefone</Label>
                    <Input placeholder="(00) 00000-0000" value={newLead.telefone}
                      onChange={(e) => setNewLead(p => ({ ...p, telefone: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@exemplo.com" value={newLead.email}
                      onChange={(e) => setNewLead(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Interesse</Label>
                    <Input placeholder="Ex: Violão, Piano..." value={newLead.interesse}
                      onChange={(e) => setNewLead(p => ({ ...p, interesse: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Origem</Label>
                    <Select value={newLead.origem} onValueChange={(v) => setNewLead(p => ({ ...p, origem: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais..." value={newLead.observacoes}
                    onChange={(e) => setNewLead(p => ({ ...p, observacoes: e.target.value }))} />
                </div>
                <Button onClick={handleCreate} disabled={createLead.isPending} className="w-full">
                  {createLead.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-6 gap-3 min-w-[900px]">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col">
              <div className={`rounded-xl border ${col.color} px-3 py-2.5 mb-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs h-5">{leadsByStatus[col.id]?.length || 0}</Badge>
                </div>
              </div>
              <div className="space-y-2 flex-1 min-h-[120px]">
                {leadsByStatus[col.id]?.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-3 border-border/50 hover:border-primary/30 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{lead.nome}</p>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteLead.mutate(lead.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {lead.interesse && (
                          <Badge variant="outline" className="text-xs">{lead.interesse}</Badge>
                        )}
                        <div className="space-y-0.5">
                          {lead.telefone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /><span className="truncate">{lead.telefone}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" /><span className="truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>
                        {lead.origem && (
                          <p className="text-xs text-muted-foreground">Origem: {lead.origem}</p>
                        )}
                        {col.id !== "matriculado" && col.id !== "perdido" && (
                          <div className="flex flex-col gap-1 pt-1">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="text-xs h-7 flex-1"
                                onClick={() => moveToNext(lead)}>
                                <ArrowRight className="w-3 h-3 mr-1" />Avançar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive"
                                onClick={() => markLost(lead.id)}>
                                ✕
                              </Button>
                            </div>
                            {col.id !== "lista_espera" && (
                              <Button variant="ghost" size="sm" className="text-xs h-6 text-warning"
                                onClick={() => moveToWaitingList(lead)}>
                                <Clock className="w-3 h-3 mr-1" />Lista de Espera
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Dialog - Complete Form */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Cadastrar Aluno</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Preencha os dados completos para matricular este aluno no sistema.
          </p>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome Completo *</Label>
                <Input value={enrollData.nome} onChange={(e) => setEnrollData(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Data de Nascimento</Label>
                <Input type="date" value={enrollData.data_nascimento} onChange={(e) => setEnrollData(p => ({ ...p, data_nascimento: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input placeholder="(00) 00000-0000" value={enrollData.telefone} onChange={(e) => setEnrollData(p => ({ ...p, telefone: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={enrollData.email} onChange={(e) => setEnrollData(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input placeholder="Rua, número, bairro..." value={enrollData.endereco} onChange={(e) => setEnrollData(p => ({ ...p, endereco: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome do Responsável</Label>
                <Input placeholder="Nome completo do responsável" value={enrollData.responsavel_nome}
                  onChange={(e) => setEnrollData(p => ({ ...p, responsavel_nome: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Telefone do Responsável</Label>
                <Input placeholder="(00) 00000-0000" value={enrollData.responsavel_telefone}
                  onChange={(e) => setEnrollData(p => ({ ...p, responsavel_telefone: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Objetivo</Label>
              <Input placeholder="Ex: Hobby, profissional, concurso..." value={enrollData.objetivo}
                onChange={(e) => setEnrollData(p => ({ ...p, objetivo: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea placeholder="Informações adicionais..." value={enrollData.observacoes}
                onChange={(e) => setEnrollData(p => ({ ...p, observacoes: e.target.value }))} />
            </div>
            <Button onClick={handleEnroll} disabled={createAluno.isPending} className="w-full">
              {createAluno.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <UserPlus className="w-4 h-4 mr-2" />
              Matricular Aluno
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
