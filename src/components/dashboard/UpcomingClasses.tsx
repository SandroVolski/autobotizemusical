import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ChevronRight, Loader2, Calendar } from "lucide-react";
import { useAulas } from "@/hooks/useAulas";
import { useNavigate } from "react-router-dom";

export function UpcomingClasses() {
  const navigate = useNavigate();
  const { data: aulas, isLoading } = useAulas();

  const getUpcomingClasses = () => {
    if (!aulas || aulas.length === 0) return [];
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const upcoming: (typeof aulas[number] & { _displayDay: number })[] = [];
    
    for (let offset = 0; offset < 7 && upcoming.length < 6; offset++) {
      const targetDay = (currentDay + offset) % 7;
      const dayClasses = aulas
        .filter(a => a.dia_semana === targetDay && a.status !== 'cancelada')
        .filter(a => {
          if (offset === 0 && a.horario) {
            return a.horario >= currentTime;
          }
          return true;
        })
        .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))
        .map(a => ({ ...a, _displayDay: targetDay }));
      
      upcoming.push(...dayClasses);
    }
    
    return upcoming.slice(0, 6);
  };

  const upcomingClasses = getUpcomingClasses();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Próximas Aulas</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => navigate("/agenda")}
          >
            Ver agenda completa
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aula agendada nos próximos dias</p>
            </div>
          ) : (
            upcomingClasses.map((classItem, index) => {
              const isToday = classItem._displayDay === new Date().getDay();
              return (
                <motion.div
                  key={`${classItem.id}-${classItem._displayDay}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                >
                  <div className="w-11 h-10 sm:w-14 sm:h-12 rounded-lg bg-primary/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-foreground/60 uppercase">
                      {isToday ? 'Hoje' : diasSemana[classItem._displayDay]}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">{classItem.horario?.slice(0, 5)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{classItem.alunos?.nome || "Sem aluno"}</p>
                      <Badge 
                        variant={classItem.status === "ativo" || classItem.status === "agendada" ? "success" : "warning"}
                        className="text-[10px] hidden sm:inline-flex"
                      >
                        {classItem.status === "ativo" || classItem.status === "agendada" ? "confirmada" : "pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {classItem.duracao_minutos || 60}min
                      </span>
                      {classItem.sala && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {classItem.sala}
                        </span>
                      )}
                      <span className="sm:hidden text-[10px]">{classItem.cursos?.nome || ""}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className="hidden sm:inline-flex">{classItem.cursos?.nome || "Sem curso"}</Badge>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
