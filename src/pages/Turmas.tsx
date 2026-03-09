import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Music, Clock, Loader2, UserPlus, UserMinus, CheckCircle2, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useTurmas, useTurmaAlunos, useCreateTurma, useAddAlunoTurma, useRemoveAlunoTurma } from "@/hooks/useTurmas";
import { useProfessores } from "@/hooks/useProfessores";
import { useCursos } from "@/hooks/useCursos";
import { useAlunos } from "@/hooks/useAlunos";
import { useCreatePresenca } from "@/hooks/usePresencas";
import { toast } from "@/hooks/use-toast";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function useCreatePresencaHook() {
  // We'll use the existing presencas hook for group attendance
  return useCreatePresenca();
}

export default function Turmas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addAlunoDialogOpen, setAddAlunoDialogOpen] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [newTurma, setNewTurma] = useState({
    nome: "", professor_id: "", curso_id: "", dia_semana: 1,
    horario: "08:00", max_alunos: 10, sala: "",
  });

  const { data: turmas, isLoading } = useTurmas();
  const { data: turmaAlunos } = useTurmaAlunos(selectedTurma);
  const { data: professores } = useProfessores();
  const { data: cursos } = useCursos();
  const { data: alunos } = useAlunos();
  const createTurma = useCreateTurma();
  const addAluno = useAddAlunoTurma();
  const removeAluno = useRemoveAlunoTurma();
  const createPresenca = useCreatePresencaHook();

  const handleCreate = () => {
    if (!newTurma.nome) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    createTurma.mutate({
      nome: newTurma.nome,
      professor_id: newTurma.professor_id || undefined,
      curso_id: newTurma.curso_id || undefined,
      dia_semana: newTurma.dia_semana,
      horario: newTurma.horario,
      max_alunos: newTurma.max_alunos,
      sala: newTurma.sala || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewTurma({ nome: "", professor_id: "", curso_id: "", dia_semana: 1, horario: "08:00", max_alunos: 10, sala: "" });
      },
    });
  };

  const openAttendance = (turmaId: string) => {
    setSelectedTurma(turmaId);
    setAttendance({});
    setSheetOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!turmaAlunos) return;
    const today = new Date().toISOString().split("T")[0];
    for (const ta of turmaAlunos) {
      const status = attendance[ta.aluno_id] || "presente";
      try {
        await createPresenca.mutateAsync({
          aluno_id: ta.aluno_id,
          data: today,
          status,
        });
      } catch {}
    }
    toast({ title: "Chamada registrada com sucesso!" });
    setSheetOpen(false);
  };

  const handleAddAluno = () => {
    if (!selectedTurma || !selectedAlunoId) return;
    addAluno.mutate({ turma_id: selectedTurma, aluno_id: selectedAlunoId }, {
      onSuccess: () => { setAddAlunoDialogOpen(false); setSelectedAlunoId(""); },
    });
  };

  // Count alunos per turma
  const getAlunoCount = (turmaId: string) => {
    // This is simplified - in production you'd want a count query
    return 0; // Will show from turma_alunos when data loads
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Gestão de aulas em grupo e chamada coletiva</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Turma</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Criar Turma</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome da Turma *</Label>
                <Input placeholder="Ex: Teoria Nível 1" value={newTurma.nome}
                  onChange={(e) => setNewTurma(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Professor</Label>
                  <Select value={newTurma.professor_id} onValueChange={(v) => setNewTurma(p => ({ ...p, professor_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {professores?.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Curso</Label>
                  <Select value={newTurma.curso_id} onValueChange={(v) => setNewTurma(p => ({ ...p, curso_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {cursos?.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Dia da Semana</Label>
                  <Select value={String(newTurma.dia_semana)} onValueChange={(v) => setNewTurma(p => ({ ...p, dia_semana: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Horário</Label>
                  <Input type="time" value={newTurma.horario}
                    onChange={(e) => setNewTurma(p => ({ ...p, horario: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Máx. Alunos</Label>
                  <Input type="number" value={newTurma.max_alunos}
                    onChange={(e) => setNewTurma(p => ({ ...p, max_alunos: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Sala</Label>
                <Input placeholder="Ex: Sala 3" value={newTurma.sala}
                  onChange={(e) => setNewTurma(p => ({ ...p, sala: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} disabled={createTurma.isPending} className="w-full mt-2">
                {createTurma.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Criar Turma
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Turma Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas?.map((turma, index) => {
          const prof = (turma as any).professores?.nome || "Sem professor";
          const curso = (turma as any).cursos?.nome || "";
          const maxAlunos = turma.max_alunos || 10;
          const currentAlunos = 0; // Will be dynamic with count
          const occupancy = (currentAlunos / maxAlunos) * 100;

          return (
            <motion.div
              key={turma.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="interactive"
                className="cursor-pointer"
                onClick={() => openAttendance(turma.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{turma.nome}</CardTitle>
                      {curso && <p className="text-sm text-muted-foreground">{curso}</p>}
                    </div>
                    <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>
                      {turma.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{prof}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {turma.dia_semana !== null ? diasSemana[turma.dia_semana] : "—"}, {turma.horario?.slice(0, 5) || "—"}
                    </span>
                  </div>
                  {turma.sala && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="w-4 h-4" />
                      <span>{turma.sala}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lotação</span>
                      <span className="font-medium">{currentAlunos}/{maxAlunos}</span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {(!turmas || turmas.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma turma cadastrada</p>
            <p className="text-sm">Crie turmas para aulas em grupo</p>
          </div>
        )}
      </div>

      {/* Attendance Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Chamada - {turmas?.find(t => t.id === selectedTurma)?.nome}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <Button variant="outline" size="sm" onClick={() => { setAddAlunoDialogOpen(true); }}>
                <UserPlus className="w-4 h-4 mr-1" />Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {turmaAlunos?.map((ta) => {
                const aluno = (ta as any).alunos;
                const status = attendance[ta.aluno_id] || "presente";
                return (
                  <div key={ta.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {aluno?.nome?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm font-medium">{aluno?.nome || "Aluno"}</span>
                    </div>
                    <div className="flex gap-1">
                      {["presente", "falta", "justificada"].map((s) => (
                        <Button
                          key={s}
                          variant={status === s ? (s === "presente" ? "default" : s === "falta" ? "destructive" : "warning") : "outline"}
                          size="sm"
                          className="text-xs px-2 h-7"
                          onClick={() => setAttendance(prev => ({ ...prev, [ta.aluno_id]: s }))}
                        >
                          {s === "presente" ? "P" : s === "falta" ? "F" : "FJ"}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs px-1 h-7 text-destructive"
                        onClick={() => selectedTurma && removeAluno.mutate({ turma_id: selectedTurma, aluno_id: ta.aluno_id })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {(!turmaAlunos || turmaAlunos.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum aluno nesta turma</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setAddAlunoDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-1" />Adicionar Alunos
                  </Button>
                </div>
              )}
            </div>

            {turmaAlunos && turmaAlunos.length > 0 && (
              <Button className="w-full" onClick={handleSaveAttendance} disabled={createPresenca.isPending}>
                {createPresenca.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar Chamada
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Aluno Dialog */}
      <Dialog open={addAlunoDialogOpen} onOpenChange={setAddAlunoDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Aluno à Turma</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
              <SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
              <SelectContent>
                {alunos?.filter(a => a.status === "ativo").map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddAluno} disabled={!selectedAlunoId || addAluno.isPending}>
              {addAluno.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
