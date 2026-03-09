import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, Plus, Loader2, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useReposicoes, useCreateReposicao, useUpdateReposicao } from "@/hooks/useReposicoes";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";

const statusColors: Record<string, string> = {
  pendente: "warning",
  agendada: "default",
  realizada: "success",
  sem_direito: "destructive",
  expirada: "secondary",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  agendada: "Agendada",
  realizada: "Realizada",
  sem_direito: "Sem Direito",
  expirada: "Expirada",
};

export default function Reposicoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState({ data_reposicao: "", horario_reposicao: "", professor_id: "" });
  const [newFalta, setNewFalta] = useState({
    aluno_id: "", data_falta: "", tipo_falta: "falta", observacoes: "",
  });

  const { data: reposicoes, isLoading } = useReposicoes();
  const { data: alunos } = useAlunos();
  const { data: professores } = useProfessores();
  const createReposicao = useCreateReposicao();
  const updateReposicao = useUpdateReposicao();

  const pendentes = useMemo(() => reposicoes?.filter(r => r.status === "pendente") || [], [reposicoes]);
  const agendadas = useMemo(() => reposicoes?.filter(r => r.status === "agendada") || [], [reposicoes]);
  const realizadas = useMemo(() => reposicoes?.filter(r => ["realizada", "sem_direito", "expirada"].includes(r.status || "")) || [], [reposicoes]);

  const handleCreate = () => {
    if (!newFalta.aluno_id || !newFalta.data_falta) return;
    createReposicao.mutate(newFalta, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewFalta({ aluno_id: "", data_falta: "", tipo_falta: "falta", observacoes: "" });
      },
    });
  };

  const handleSchedule = () => {
    if (!scheduleDialog) return;
    updateReposicao.mutate({
      id: scheduleDialog,
      status: "agendada",
      ...scheduleData,
    }, {
      onSuccess: () => {
        setScheduleDialog(null);
        setScheduleData({ data_reposicao: "", horario_reposicao: "", professor_id: "" });
      },
    });
  };

  const handleMarkDone = (id: string) => {
    updateReposicao.mutate({ id, status: "realizada" });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const renderCard = (repo: any, showScheduleBtn = false) => {
    const alunoNome = (repo as any).alunos?.nome || "Aluno";
    const profNome = (repo as any).professores?.nome;
    return (
      <motion.div key={repo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="interactive" className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium">{alunoNome}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Falta: {new Date(repo.data_falta).toLocaleDateString("pt-BR")}</span>
              </div>
              {repo.data_reposicao && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Reposição: {new Date(repo.data_reposicao).toLocaleDateString("pt-BR")} {repo.horario_reposicao?.slice(0, 5)}</span>
                </div>
              )}
              {profNome && <p className="text-xs text-muted-foreground">Prof. {profNome}</p>}
              <Badge variant={statusColors[repo.status || "pendente"] as any} className="text-xs">
                {repo.tipo_falta === "justificada" ? "Justificada" : "Falta"} • {statusLabels[repo.status || "pendente"]}
              </Badge>
            </div>
            <div className="flex gap-1">
              {showScheduleBtn && repo.status === "pendente" && (
                <Button variant="outline" size="sm" onClick={() => setScheduleDialog(repo.id)}>
                  <Calendar className="w-3 h-3 mr-1" />Agendar
                </Button>
              )}
              {repo.status === "agendada" && (
                <Button variant="default" size="sm" onClick={() => handleMarkDone(repo.id)}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />Realizada
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Faltas e Reposições</h1>
          <p className="text-muted-foreground">Controle de faltas e banco de reposições</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Registrar Falta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Falta</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Aluno *</Label>
                <Select value={newFalta.aluno_id} onValueChange={(v) => setNewFalta(p => ({ ...p, aluno_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{alunos?.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data da Falta *</Label>
                  <Input type="date" value={newFalta.data_falta}
                    onChange={(e) => setNewFalta(p => ({ ...p, data_falta: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newFalta.tipo_falta} onValueChange={(v) => setNewFalta(p => ({ ...p, tipo_falta: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="falta">Falta (sem aviso)</SelectItem>
                      <SelectItem value="justificada">Justificada (avisou 24h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {newFalta.tipo_falta === "justificada"
                  ? "✅ Gera crédito de reposição para o aluno"
                  : "⚠️ Aula cobrada normalmente, sem direito a reposição"}
              </p>
              <Button onClick={handleCreate} disabled={createReposicao.isPending} className="w-full">
                {createReposicao.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="interactive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{pendentes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="interactive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agendadas</p>
              <p className="text-2xl font-bold">{agendadas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="interactive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Realizadas</p>
              <p className="text-2xl font-bold">{realizadas.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="agendadas">Agendadas ({agendadas.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({realizadas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="space-y-2 mt-4">
          {pendentes.map(r => renderCard(r, true))}
          {pendentes.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma reposição pendente</p>}
        </TabsContent>
        <TabsContent value="agendadas" className="space-y-2 mt-4">
          {agendadas.map(r => renderCard(r))}
          {agendadas.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma reposição agendada</p>}
        </TabsContent>
        <TabsContent value="historico" className="space-y-2 mt-4">
          {realizadas.map(r => renderCard(r))}
          {realizadas.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum registro</p>}
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={!!scheduleDialog} onOpenChange={(open) => !open && setScheduleDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agendar Reposição</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={scheduleData.data_reposicao}
                  onChange={(e) => setScheduleData(p => ({ ...p, data_reposicao: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Horário</Label>
                <Input type="time" value={scheduleData.horario_reposicao}
                  onChange={(e) => setScheduleData(p => ({ ...p, horario_reposicao: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Professor</Label>
              <Select value={scheduleData.professor_id} onValueChange={(v) => setScheduleData(p => ({ ...p, professor_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{professores?.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleSchedule} disabled={updateReposicao.isPending} className="w-full">
              {updateReposicao.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
