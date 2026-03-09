import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Plus, Loader2, Phone, Mail, GripVertical, Trash2, Calendar, ArrowRight
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
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";

const columns = [
  { id: "novo_contato", label: "Novo Contato", color: "bg-muted" },
  { id: "agendou_experimental", label: "Agendou Experimental", color: "bg-primary/10" },
  { id: "fez_aula", label: "Fez a Aula", color: "bg-secondary/10" },
  { id: "matriculado", label: "Matriculado ✅", color: "bg-success/10" },
  { id: "perdido", label: "Perdido ❌", color: "bg-destructive/10" },
];

export default function CRM() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    nome: "", telefone: "", email: "", interesse: "", origem: "site",
  });

  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

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
        setNewLead({ nome: "", telefone: "", email: "", interesse: "", origem: "site" });
      },
    });
  };

  const moveToNext = (lead: any) => {
    const currentIdx = columns.findIndex(c => c.id === (lead.status || "novo_contato"));
    if (currentIdx < columns.length - 2) {
      updateLead.mutate({ id: lead.id, status: columns[currentIdx + 1].id });
    }
  };

  const markLost = (id: string) => {
    updateLead.mutate({ id, status: "perdido" });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const totalLeads = leads?.length || 0;
  const convertidos = leads?.filter(l => l.status === "matriculado").length || 0;
  const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Funil de Captação</h1>
          <p className="text-muted-foreground">CRM básico para gestão de interessados</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Taxa de conversão: {taxaConversao}%
          </Badge>
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="min-w-[260px] flex-shrink-0">
            <div className={`rounded-t-lg px-3 py-2 ${col.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{leadsByStatus[col.id]?.length || 0}</Badge>
              </div>
            </div>
            <div className="space-y-2 mt-2 min-h-[200px]">
              {leadsByStatus[col.id]?.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="p-3 border-border/50">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm">{lead.nome}</p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive"
                          onClick={() => deleteLead.mutate(lead.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {lead.interesse && (
                        <Badge variant="outline" className="text-xs">{lead.interesse}</Badge>
                      )}
                      <div className="space-y-1">
                        {lead.telefone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />{lead.telefone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />{lead.email}
                          </div>
                        )}
                      </div>
                      {lead.origem && (
                        <p className="text-xs text-muted-foreground">Origem: {lead.origem}</p>
                      )}
                      <div className="flex gap-1 pt-1">
                        {col.id !== "matriculado" && col.id !== "perdido" && (
                          <>
                            <Button variant="outline" size="sm" className="text-xs h-6 flex-1"
                              onClick={() => moveToNext(lead)}>
                              <ArrowRight className="w-3 h-3 mr-1" />Avançar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive"
                              onClick={() => markLost(lead.id)}>
                              Perdido
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
