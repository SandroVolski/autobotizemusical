import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin,
  User,
  Music
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

const classes = [
  { id: 1, student: "Maria Silva", instrument: "Piano", time: "09:00", duration: 45, room: "Sala 1", day: 1, status: "confirmada" },
  { id: 2, student: "João Santos", instrument: "Violão", time: "10:00", duration: 45, room: "Sala 2", day: 1, status: "pendente" },
  { id: 3, student: "Ana Costa", instrument: "Bateria", time: "11:00", duration: 60, room: "Sala 3", day: 1, status: "confirmada" },
  { id: 4, student: "Pedro Oliveira", instrument: "Guitarra", time: "14:00", duration: 45, room: "Sala 1", day: 1, status: "confirmada" },
  { id: 5, student: "Carla Lima", instrument: "Canto", time: "09:00", duration: 60, room: "Sala 2", day: 2, status: "confirmada" },
  { id: 6, student: "Lucas Mendes", instrument: "Violino", time: "15:00", duration: 45, room: "Sala 1", day: 2, status: "pendente" },
  { id: 7, student: "Julia Ferreira", instrument: "Piano", time: "10:00", duration: 45, room: "Sala 1", day: 3, status: "confirmada" },
  { id: 8, student: "Rafael Souza", instrument: "Baixo", time: "16:00", duration: 60, room: "Sala 3", day: 3, status: "confirmada" },
];

const getClassPosition = (time: string) => {
  const [hours] = time.split(":").map(Number);
  return (hours - 8) * 80; // 80px per hour
};

const getClassHeight = (duration: number) => {
  return (duration / 60) * 80;
};

export default function Agenda() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Aula
        </Button>
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
                <div className="h-16 border-b border-border" />
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-b border-border flex items-start justify-center pt-2 text-xs text-muted-foreground"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Days columns */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex min-w-[700px]">
                  {weekDates.map((date, dayIndex) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayClasses = classes.filter((c) => c.day === dayIndex);

                    return (
                      <div key={dayIndex} className="flex-1 border-r border-border last:border-r-0">
                        {/* Day header */}
                        <div className={`h-16 border-b border-border flex flex-col items-center justify-center ${
                          isToday ? "bg-primary/10" : ""
                        }`}>
                          <span className="text-xs text-muted-foreground">{weekDays[dayIndex]}</span>
                          <span className={`text-lg font-semibold ${
                            isToday ? "text-primary" : ""
                          }`}>
                            {date.getDate()}
                          </span>
                        </div>

                        {/* Time slots */}
                        <div className="relative">
                          {hours.map((hour) => (
                            <div
                              key={hour}
                              className="h-20 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                            />
                          ))}

                          {/* Classes */}
                          {dayClasses.map((classItem) => (
                            <motion.div
                              key={classItem.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all hover:scale-[1.02] ${
                                classItem.status === "confirmada"
                                  ? "bg-primary/20 border border-primary/30"
                                  : "bg-warning/20 border border-warning/30"
                              }`}
                              style={{
                                top: getClassPosition(classItem.time),
                                height: getClassHeight(classItem.duration),
                              }}
                            >
                              <p className="text-xs font-medium truncate">{classItem.student}</p>
                              <p className="text-xs text-muted-foreground truncate">{classItem.instrument}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{classItem.room}</span>
                              </div>
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
            <CardTitle className="text-lg">Aulas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {classes.filter(c => c.day === 1).map((classItem) => (
                <motion.div
                  key={classItem.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">{classItem.time}</span>
                    <Badge variant={classItem.status === "confirmada" ? "success" : "warning"}>
                      {classItem.status}
                    </Badge>
                  </div>
                  <p className="font-medium">{classItem.student}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Music className="w-3 h-3" />
                    <span>{classItem.instrument}</span>
                    <span>•</span>
                    <span>{classItem.duration}min</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
