import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  CalendarIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { useAulas, useCreateAula, useDeleteAula, type NovaAula, type Aula } from "@/hooks/useAulas";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";
import { useCursos } from "@/hooks/useCursos";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Generate 30-minute intervals from 7:30 to 23:00
const timeSlots: { hour: number; minutes: number; label: string }[] = [];
// Start at 7:30
timeSlots.push({ hour: 7, minutes: 30, label: "07:30" });
// Then from 8:00 to 23:00 in 30-min intervals
for (let h = 8; h <= 23; h++) {
  timeSlots.push({ hour: h, minutes: 0, label: `${h.toString().padStart(2, '0')}:00` });
  if (h < 23) {
    timeSlots.push({ hour: h, minutes: 30, label: `${h.toString().padStart(2, '0')}:30` });
  }
}

const START_HOUR = 7.5; // 7:30 in decimal

const getClassPosition = (time: string) => {
  const [hoursVal, minsVal] = time.split(":").map(Number);
  const timeInHours = hoursVal + minsVal / 60;
  return ((timeInHours - START_HOUR) * 2) * 40; // 40px per 30-min slot
};

const getClassHeight = (duration: number) => {
  return (duration / 30) * 40; // 40px per 30-min slot
};

export default function Agenda() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newAula, setNewAula] = useState<NovaAula>({
    aluno_id: "",
    professor_id: "",
    curso_id: "",
    horario: "09:00",
    dia_semana: 1,
    duracao_minutos: 60,
    sala: "",
  });

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

  const handleCreateAula = () => {
    if (!newAula.horario) {
      toast({
        title: "Erro",
        description: "Horário é obrigatório",
        variant: "destructive",
      });
      return;
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

      {/* Calendar Navigation + Today's Classes */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Calendar Section */}
        <div className="space-y-4">
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
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-semibold">
                          {format(currentWeek, "MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={currentWeek}
                        onSelect={(date) => date && setCurrentWeek(date)}
                        initialFocus
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
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
                <div className="flex max-h-[600px] overflow-y-auto">
                  {/* Time column */}
                  <div className="w-14 flex-shrink-0 border-r border-border sticky left-0 bg-card z-20">
                    <div className="h-12 border-b border-border" />
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`h-10 border-b flex items-start justify-center pt-1 text-xs text-muted-foreground ${
                          slot.minutes === 30 ? "border-dashed border-border/50" : "border-border"
                        }`}
                      >
                        {slot.minutes === 0 || (slot.hour === 7 && slot.minutes === 30) ? slot.label : ""}
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
                            <div className={`h-12 border-b border-border flex flex-col items-center justify-center sticky top-0 bg-card z-10 ${
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
                                  className={`absolute left-1 right-1 rounded-lg p-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg z-10 overflow-hidden ${
                                    aula.status === "ativo"
                                      ? "bg-primary/20 border border-primary/30 hover:bg-primary/30"
                                      : "bg-warning/20 border border-warning/30 hover:bg-warning/30"
                                  }`}
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
        </div>

        {/* Today's Classes Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:sticky lg:top-20 lg:self-start"
        >
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Aulas de Hoje
                <Badge variant="secondary" className="ml-auto">
                  {todayClasses.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {todayClasses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma aula hoje</p>
                </div>
              ) : (
                todayClasses
                  .sort((a, b) => a.horario.localeCompare(b.horario))
                  .map((aula) => (
                    <motion.div
                      key={aula.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => openDetailsDialog(aula)}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer relative group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <span className="text-lg font-bold text-primary block leading-none">
                            {aula.horario.slice(0, 5)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {aula.duracao_minutos || 60}min
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {aula.alunos?.nome || "Sem aluno"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {aula.cursos?.nome || "Sem curso"}
                          </p>
                        </div>
                        <Badge 
                          variant={aula.status === "ativo" ? "success" : "warning"} 
                          className="text-xs shrink-0"
                        >
                          {aula.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAulaMutation.mutate(aula.id);
                        }}
                        disabled={deleteAulaMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </motion.div>
                  ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    deleteAulaMutation.mutate(selectedAula.id, {
                      onSuccess: () => setIsDetailsOpen(false)
                    });
                  }}
                  disabled={deleteAulaMutation.isPending}
                >
                  {deleteAulaMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Excluir Aula
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsDetailsOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
