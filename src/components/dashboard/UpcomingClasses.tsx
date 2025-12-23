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

  // Get today's classes
  const today = new Date().getDay();
  const todayClasses = aulas?.filter(a => a.dia_semana === today).slice(0, 4) || [];

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
          {todayClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aula agendada para hoje</p>
            </div>
          ) : (
            todayClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{classItem.horario?.slice(0, 5)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{classItem.alunos?.nome || "Sem aluno"}</p>
                    <Badge 
                      variant={classItem.status === "ativo" ? "success" : "warning"}
                      className="text-xs"
                    >
                      {classItem.status === "ativo" ? "confirmada" : "pendente"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
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
                  </div>
                </div>

                <Badge variant="outline">{classItem.cursos?.nome || "Sem curso"}</Badge>
                
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
