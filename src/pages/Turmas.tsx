import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Music, Clock, Loader2, UserPlus, UserMinus, CheckCircle2, X, Calendar, Pencil, Trash2
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
import { useTurmas, useTurmaAlunos, useCreateTurma, useAddAlunoTurma, useRemoveAlunoTurma, useUpdateTurma, useDeleteTurma } from "@/hooks/useTurmas";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfessores } from "@/hooks/useProfessores";
import { useCursos } from "@/hooks/useCursos";
import { useAlunos } from "@/hooks/useAlunos";
import { useCreatePresenca, usePresencas } from "@/hooks/usePresencas";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Hook to count alunos per turma
function useTurmaAlunosCounts() {
  return useQuery({
    queryKey: ["turma_alunos_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turma_alunos")
        .select("turma_id")
        .eq("status", "ativo");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(ta => {
        counts[ta.turma_id] = (counts[ta.turma_id] || 0) + 1;
      });
      return counts;
    },
  });
}

export default function Turmas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addAlunoDialogOpen, setAddAlunoDialogOpen] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAlunosIds, setSelectedAlunosIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingTurma, setEditingTurma] = useState<any | null>(null);
  const [deleteTurmaId, setDeleteTurmaId] = useState<string | null>(null);
  const [newTurma, setNewTurma] = useState({
    nome: "", professor_id: "", curso_id: "", dia_semana: 1,
    horario: "08:00", max_alunos: 10, sala: "",
  });

  const { data: turmas, isLoading } = useTurmas();
  const { data: turmaAlunos } = useTurmaAlunos(selectedTurma);
  const [editAddAlunoId, setEditAddAlunoId] = useState("");
  const { data: editTurmaAlunos } = useTurmaAlunos(editingTurma?.id || null);
  const { data: professores } = useProfessores();
  const { data: cursos } = useCursos();
  const { data: alunos } = useAlunos();
  const { data: counts } = useTurmaAlunosCounts();
  const createTurma = useCreateTurma();
  const updateTurma = useUpdateTurma();
  const deleteTurma = useDeleteTurma();
  const addAluno = useAddAlunoTurma();
  const removeAluno = useRemoveAlunoTurma();
  const createPresenca = useCreatePresenca();

  // Fetch existing attendance for the selected date
  const { data: existingPresencas } = useQuery({
    queryKey: ["presencas_turma", selectedTurma, attendanceDate],
    enabled: !!selectedTurma && sheetOpen,
    queryFn: async () => {
      const alunoIds = turmaAlunos?.map(ta => ta.aluno_id) || [];
      if (alunoIds.length === 0) return [];
      const { data, error } = await supabase
        .from("presencas")
        .select("*")
        .in("aluno_id", alunoIds)
        .eq("data", attendanceDate);
      if (error) throw error;
      return data;
    },
  });

  // Pre-fill attendance from existing records
  const effectiveAttendance = useMemo(() => {
    const result: Record<string, string> = { ...attendance };
    existingPresencas?.forEach(p => {
      if (!(p.aluno_id in attendance)) {
        result[p.aluno_id] = p.status || "presente";
      }
    });
    return result;
  }, [attendance, existingPresencas]);

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
      onSuccess: (data) => {
        // Add selected students to the new turma
        if (selectedAlunosIds.length > 0 && data?.id) {
          selectedAlunosIds.forEach(alunoId => {
            addAluno.mutate({ turma_id: data.id, aluno_id: alunoId });
          });
        }
        setIsDialogOpen(false);
        setNewTurma({ nome: "", professor_id: "", curso_id: "", dia_semana: 1, horario: "08:00", max_alunos: 10, sala: "" });
        setSelectedAlunosIds([]);
      },
    });
  };

  const toggleAlunoSelection = (alunoId: string) => {
    setSelectedAlunosIds(prev =>
      prev.includes(alunoId) ? prev.filter(id => id !== alunoId) : [...prev, alunoId]
    );
  };

  const openAttendance = (turmaId: string) => {
    setSelectedTurma(turmaId);
    setAttendance({});
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    setSheetOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!turmaAlunos) return;
    for (const ta of turmaAlunos) {
      const status = effectiveAttendance[ta.aluno_id] || "presente";
      try {
        await createPresenca.mutateAsync({
          aluno_id: ta.aluno_id,
          data: attendanceDate,
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

  const openEditTurma = (e: React.MouseEvent, turma: any) => {
    e.stopPropagation();
    setEditingTurma({
      id: turma.id,
      nome: turma.nome || "",
      professor_id: turma.professor_id || "",
      curso_id: turma.curso_id || "",
      dia_semana: turma.dia_semana ?? 1,
      horario: turma.horario || "08:00",
      max_alunos: turma.max_alunos ?? 10,
      sala: turma.sala || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingTurma) return;
    updateTurma.mutate({
      id: editingTurma.id,
      nome: editingTurma.nome,
      professor_id: editingTurma.professor_id || null,
      curso_id: editingTurma.curso_id || null,
      dia_semana: editingTurma.dia_semana,
      horario: editingTurma.horario,
      max_alunos: editingTurma.max_alunos,
      sala: editingTurma.sala || null,
    }, { onSuccess: () => setEditingTurma(null) });
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
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
              {/* Student selection with search */}
              <div className="grid gap-2">
                <Label>Alunos Participantes</Label>
                <Input
                  placeholder="Buscar aluno por nome..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="mb-1"
                />
                <div className="border border-border rounded-lg max-h-[200px] overflow-y-auto p-2 space-y-1">
                  {selectedAlunosIds.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Selecionados ({selectedAlunosIds.length})</p>
                      {alunos?.filter(a => selectedAlunosIds.includes(a.id)).map(a => (
                        <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-md bg-primary/10 cursor-pointer"
                          onClick={() => toggleAlunoSelection(a.id)}>
                          <Checkbox checked={true} />
                          <span className="text-sm">{a.nome}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {alunos?.filter(a => a.status === "ativo" && !selectedAlunosIds.includes(a.id) && a.nome.toLowerCase().includes(studentSearch.toLowerCase())).map(a => (
                    <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleAlunoSelection(a.id)}>
                      <Checkbox checked={false} />
                      <span className="text-sm">{a.nome}</span>
                    </div>
                  ))}
                  {(!alunos || alunos.filter(a => a.status === "ativo" && !selectedAlunosIds.includes(a.id) && a.nome.toLowerCase().includes(studentSearch.toLowerCase())).length === 0) && selectedAlunosIds.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Nenhum aluno encontrado</p>
                  )}
                </div>
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
          const currentAlunos = counts?.[turma.id] || 0;
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
                    <div className="flex items-center gap-1">
                      <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>
                        {turma.status === "ativa" ? "Ativa" : "Inativa"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEditTurma(e, turma)} title="Editar turma">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteTurmaId(turma.id); }}
                        title="Excluir turma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => {
                    setAttendanceDate(e.target.value);
                    setAttendance({});
                  }}
                  className="w-auto h-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setAddAlunoDialogOpen(true); }}>
                <UserPlus className="w-4 h-4 mr-1" />Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {turmaAlunos?.map((ta) => {
                const aluno = (ta as any).alunos;
                const status = effectiveAttendance[ta.aluno_id] || "presente";
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

      {/* Edit Turma Dialog */}
      <Dialog open={!!editingTurma} onOpenChange={(o) => !o && setEditingTurma(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Editar Turma</DialogTitle></DialogHeader>
          {editingTurma && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input value={editingTurma.nome} onChange={(e) => setEditingTurma((p: any) => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Professor</Label>
                  <Select value={editingTurma.professor_id} onValueChange={(v) => setEditingTurma((p: any) => ({ ...p, professor_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {professores?.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Curso</Label>
                  <Select value={editingTurma.curso_id} onValueChange={(v) => setEditingTurma((p: any) => ({ ...p, curso_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {cursos?.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Dia</Label>
                  <Select value={String(editingTurma.dia_semana)} onValueChange={(v) => setEditingTurma((p: any) => ({ ...p, dia_semana: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Horário</Label>
                  <Input type="time" value={editingTurma.horario?.slice(0, 5) || ""} onChange={(e) => setEditingTurma((p: any) => ({ ...p, horario: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Máx.</Label>
                  <Input type="number" value={editingTurma.max_alunos} onChange={(e) => setEditingTurma((p: any) => ({ ...p, max_alunos: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Sala</Label>
                <Input value={editingTurma.sala} onChange={(e) => setEditingTurma((p: any) => ({ ...p, sala: e.target.value }))} />
              </div>
              {/* Alunos da Turma */}
              <div className="grid gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <Label className="text-sm font-semibold">Alunos da Turma ({editTurmaAlunos?.length || 0})</Label>
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                  {editTurmaAlunos?.map((ta: any) => (
                    <div key={ta.id} className="flex items-center justify-between p-2 rounded-md bg-card border border-border/50">
                      <span className="text-sm">{ta.alunos?.nome || "Aluno"}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeAluno.mutate({ turma_id: editingTurma.id, aluno_id: ta.aluno_id })}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  {(!editTurmaAlunos || editTurmaAlunos.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-2">Nenhum aluno na turma</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Select value={editAddAlunoId} onValueChange={setEditAddAlunoId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Adicionar aluno..." /></SelectTrigger>
                    <SelectContent>
                      {alunos?.filter(a => a.status === "ativo" && !editTurmaAlunos?.some((ta: any) => ta.aluno_id === a.id)).map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!editAddAlunoId || addAluno.isPending}
                    onClick={() => {
                      if (!editAddAlunoId) return;
                      addAluno.mutate(
                        { turma_id: editingTurma.id, aluno_id: editAddAlunoId },
                        { onSuccess: () => setEditAddAlunoId("") }
                      );
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />Adicionar
                  </Button>
                </div>
              </div>
              <Button onClick={handleSaveEdit} disabled={updateTurma.isPending} className="w-full">
                {updateTurma.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Turma Confirmation */}
      <AlertDialog open={!!deleteTurmaId} onOpenChange={(o) => !o && setDeleteTurmaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a turma e desvincula todos os alunos. Não afeta o cadastro dos alunos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTurmaId) {
                  deleteTurma.mutate(deleteTurmaId, {
                    onSuccess: () => { setDeleteTurmaId(null); if (selectedTurma === deleteTurmaId) setSheetOpen(false); }
                  });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
