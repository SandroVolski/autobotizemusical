import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  Music,
  Loader2,
  Trash2,
  User,
  GraduationCap,
  X,
  ClipboardCheck,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAulas, useCreateAula, useDeleteAula, type NovaAula, type Aula } from "@/hooks/useAulas";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";
import { useCursos } from "@/hooks/useCursos";
import { toast } from "@/hooks/use-toast";
import { AttendanceDialog } from "@/components/agenda/AttendanceDialog";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
// Generate 30-minute intervals from 8:00 to 20:00
const timeSlots = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minutes = (i % 2) * 30;
  return { hour, minutes, label: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` };
});

const getClassPosition = (time: string) => {
  const [hoursVal, minsVal] = time.split(":").map(Number);
  return ((hoursVal - 8) * 2 + minsVal / 30) * 40; // 40px per 30-min slot
};

const getClassHeight = (duration: number) => {
  return (duration / 30) * 40; // 40px per 30-min slot
};

// Generate color for each professor
const professorColors = [
  "bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30",
  "bg-green-500/20 border-green-500/40 hover:bg-green-500/30",
  "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30",
  "bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30",
  "bg-pink-500/20 border-pink-500/40 hover:bg-pink-500/30",
  "bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30",
  "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30",
  "bg-red-500/20 border-red-500/40 hover:bg-red-500/30",
];

export default function Agenda() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [newAula, setNewAula] = useState<NovaAula>({
    aluno_id: "",
    professor_id: "",
    curso_id: "",
    horario: "09:00",
    dia_semana: 1,
    duracao_minutos: 60,
    sala: "",
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const openCreateDialog = (dayIndex: number, time: string) => {
    setNewAula({
      aluno_id: "",
      professor_id: "",
      curso_id: "",
      horario: time,
      dia_semana: dayIndex,
      duracao_minutos: 60,
      sala: "",
    });
    setIsDialogOpen(true);
  };

  const openDetailsDialog = (aula: Aula) => {
    setSelectedAula(aula);
    setIsDetailsOpen(true);
  };

  const { data: aulas, isLoading } = useAulas();
  const { data: alunos } = useAlunos();
  const { data: professores } = useProfessores();
  const { data: cursos } = useCursos();
  const createAulaMutation = useCreateAula();
  const deleteAulaMutation = useDeleteAula();

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Create professor color map
  const professorColorMap = useMemo(() => {
    const map = new Map<string, string>();
    professores?.forEach((prof, idx) => {
      map.set(prof.id, professorColors[idx % professorColors.length]);
    });
    return map;
  }, [professores]);

  const getAulaColor = (aula: Aula) => {
    if (aula.professor_id && professorColorMap.has(aula.professor_id)) {
      return professorColorMap.get(aula.professor_id)!;
    }
    return "bg-primary/20 border-primary/30 hover:bg-primary/30";
  };

  // Check for time conflicts
  const checkConflict = (dayIndex: number, horario: string, duracao: number, excludeId?: string) => {
    const [hours, mins] = horario.split(":").map(Number);
    const startMins = hours * 60 + mins;
    const endMins = startMins + duracao;

    const dayClasses = aulas?.filter(a => a.dia_semana === dayIndex && a.id !== excludeId) || [];
    
    return dayClasses.some(aula => {
      if (!aula.horario) return false;
      const [aH, aM] = aula.horario.split(":").map(Number);
      const aStart = aH * 60 + aM;
      const aEnd = aStart + (aula.duracao_minutos || 60);
      return (startMins < aEnd && endMins > aStart);
    });
  };

  const hasConflict = useMemo(() => {
    if (!newAula.horario || newAula.dia_semana === undefined) return false;
    return checkConflict(newAula.dia_semana, newAula.horario, newAula.duracao_minutos || 60);
  }, [newAula.dia_semana, newAula.horario, newAula.duracao_minutos, aulas]);

  const handleCreateAula = () => {
    if (!newAula.horario) {
      toast({
        title: "Erro",
        description: "Horário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (hasConflict) {
      toast({
        title: "Conflito de Horário",
        description: "Já existe uma aula neste horário. Deseja continuar mesmo assim?",
        variant: "destructive",
      });
    }

    createAulaMutation.mutate({
      ...newAula,
      aluno_id: newAula.aluno_id || undefined,
      professor_id: newAula.professor_id || undefined,
      curso_id: newAula.curso_id || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewAula({
          aluno_id: "",
          professor_id: "",
          curso_id: "",
          horario: "09:00",
          dia_semana: 1,
          duracao_minutos: 60,
          sala: "",
        });
      }
    });
  };

  // Get classes for a specific day of week
  const getClassesForDay = (dayIndex: number) => {
    return aulas?.filter(aula => aula.dia_semana === dayIndex) || [];
  };

  // Generate month calendar dates
  const getMonthDates = () => {
    const year = currentWeek.getFullYear();
    const month = currentWeek.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const dates: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) dates.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }
    return dates;
  };

  // Get today's classes (Monday = 1 in our system)
  const today = new Date().getDay();
  const todayClasses = aulas?.filter(aula => aula.dia_semana === today) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie as aulas e horários da escola
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Aula</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Aluno</Label>
                <Select
                  value={newAula.aluno_id}
                  onValueChange={(value) => setNewAula(prev => ({ ...prev, aluno_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos?.map(aluno => (
                      <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Professor</Label>
                <Select
                  value={newAula.professor_id}
                  onValueChange={(value) => setNewAula(prev => ({ ...prev, professor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {professores?.map(prof => (
                      <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Curso</Label>
                <Select
                  value={newAula.curso_id}
                  onValueChange={(value) => setNewAula(prev => ({ ...prev, curso_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos?.map(curso => (
                      <SelectItem key={curso.id} value={curso.id}>{curso.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Dia da Semana</Label>
                  <Select
                    value={String(newAula.dia_semana)}
                    onValueChange={(value) => setNewAula(prev => ({ ...prev, dia_semana: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Segunda</SelectItem>
                      <SelectItem value="2">Terça</SelectItem>
                      <SelectItem value="3">Quarta</SelectItem>
                      <SelectItem value="4">Quinta</SelectItem>
                      <SelectItem value="5">Sexta</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="horario">Horário *</Label>
                  <Input 
                    id="horario" 
                    type="time"
                    value={newAula.horario}
                    onChange={(e) => setNewAula(prev => ({ ...prev, horario: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Duração (minutos)</Label>
                  <Select
                    value={String(newAula.duracao_minutos)}
                    onValueChange={(value) => setNewAula(prev => ({ ...prev, duracao_minutos: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h30</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sala">Sala</Label>
                  <Input 
                    id="sala" 
                    placeholder="Ex: Sala 1"
                    value={newAula.sala}
                    onChange={(e) => setNewAula(prev => ({ ...prev, sala: e.target.value }))}
                  />
                </div>
              </div>
              {hasConflict && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/20 border border-warning/40">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <p className="text-sm text-warning">Já existe aula neste horário!</p>
                </div>
              )}
              <Button 
                className="w-full mt-2" 
                onClick={handleCreateAula}
                disabled={createAulaMutation.isPending}
              >
                {createAulaMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Agendar Aula
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentWeek(newDate);
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {currentWeek.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentWeek(newDate);
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0 border-r border-border">
                <div className="h-12 border-b border-border" />
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`h-10 border-b border-border flex items-start justify-center pt-1 text-xs text-muted-foreground ${
                      slot.minutes === 30 ? "border-dashed" : ""
                    }`}
                  >
                    {slot.minutes === 0 ? slot.label : ""}
                  </div>
                ))}
              </div>

              {/* Days columns */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex min-w-[700px]">
                  {weekDates.map((date, dayIndex) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayClasses = getClassesForDay(dayIndex);

                    return (
                      <div key={dayIndex} className="flex-1 border-r border-border last:border-r-0">
                        {/* Day header */}
                        <div className={`h-12 border-b border-border flex flex-col items-center justify-center ${
                          isToday ? "bg-primary/10" : ""
                        }`}>
                          <span className="text-xs text-muted-foreground">{weekDays[dayIndex]}</span>
                          <span className={`text-sm font-semibold ${
                            isToday ? "text-primary" : ""
                          }`}>
                            {date.getDate()}
                          </span>
                        </div>

                        {/* Time slots */}
                        <div className="relative">
                          {timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              onClick={() => openCreateDialog(dayIndex, slot.label)}
                              className={`h-10 border-b hover:bg-primary/10 transition-colors cursor-pointer ${
                                slot.minutes === 30 ? "border-dashed border-border/50" : "border-border"
                              }`}
                              title={`Criar aula às ${slot.label}`}
                            />
                          ))}

                          {/* Classes */}
                          {dayClasses.map((aula) => (
                            <motion.div
                              key={aula.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetailsDialog(aula);
                              }}
                              className={`absolute left-1 right-1 rounded-lg p-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg z-10 overflow-hidden border ${getAulaColor(aula)}`}
                              style={{
                                top: getClassPosition(aula.horario),
                                height: Math.max(getClassHeight(aula.duracao_minutos || 60), 36),
                              }}
                            >
                              <p className="text-xs font-medium truncate">
                                {aula.alunos?.nome || "Sem aluno"}
                              </p>
                              {(aula.duracao_minutos || 60) >= 45 && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {aula.cursos?.nome || "Sem curso"}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Classes Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Aulas de Hoje ({todayClasses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma aula agendada para hoje
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {todayClasses.map((aula) => (
                  <motion.div
                    key={aula.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => openDetailsDialog(aula)}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">{aula.horario}</span>
                      <Badge variant={aula.status === "ativo" ? "success" : "warning"}>
                        {aula.status}
                      </Badge>
                    </div>
                    <p className="font-medium">{aula.alunos?.nome || "Sem aluno"}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Music className="w-3 h-3" />
                      <span>{aula.cursos?.nome || "Sem curso"}</span>
                      <span>•</span>
                      <span>{aula.duracao_minutos || 60}min</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAulaMutation.mutate(aula.id);
                      }}
                      disabled={deleteAulaMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Detalhes da Aula
            </DialogTitle>
          </DialogHeader>
          {selectedAula && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{selectedAula.horario}</span>
                <Badge variant={selectedAula.status === "ativo" ? "success" : "warning"} className="text-sm">
                  {selectedAula.status}
                </Badge>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Aluno</p>
                    <p className="font-medium">{selectedAula.alunos?.nome || "Não definido"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Professor</p>
                    <p className="font-medium">{selectedAula.professores?.nome || "Não definido"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Music className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Curso</p>
                    <p className="font-medium">{selectedAula.cursos?.nome || "Não definido"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duração</p>
                      <p className="font-medium">{selectedAula.duracao_minutos || 60} min</p>
                    </div>
                  </div>

                  {selectedAula.sala && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sala</p>
                        <p className="font-medium">{selectedAula.sala}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedAula.observacoes && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{selectedAula.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setIsAttendanceOpen(true);
                  }}
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Registrar Presença
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    deleteAulaMutation.mutate(selectedAula.id, {
                      onSuccess: () => setIsDetailsOpen(false)
                    });
                  }}
                  disabled={deleteAulaMutation.isPending}
                >
                  {deleteAulaMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Attendance Dialog */}
      <AttendanceDialog
        aula={selectedAula}
        open={isAttendanceOpen}
        onOpenChange={setIsAttendanceOpen}
        date={todayStr}
      />
    </div>
  );
}
