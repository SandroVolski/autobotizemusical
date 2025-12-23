import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, ChevronRight } from "lucide-react";

const upcomingClasses = [
  {
    id: 1,
    student: "Maria Silva",
    instrument: "Piano",
    time: "09:00",
    duration: "45min",
    room: "Sala 1",
    status: "confirmada",
  },
  {
    id: 2,
    student: "João Santos",
    instrument: "Violão",
    time: "10:00",
    duration: "45min",
    room: "Sala 2",
    status: "pendente",
  },
  {
    id: 3,
    student: "Ana Costa",
    instrument: "Bateria",
    time: "11:00",
    duration: "60min",
    room: "Sala 3",
    status: "confirmada",
  },
  {
    id: 4,
    student: "Pedro Oliveira",
    instrument: "Guitarra",
    time: "14:00",
    duration: "45min",
    room: "Sala 1",
    status: "confirmada",
  },
];

export function UpcomingClasses() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Próximas Aulas</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver agenda completa
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingClasses.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{classItem.time}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{classItem.student}</p>
                  <Badge 
                    variant={classItem.status === "confirmada" ? "success" : "warning"}
                    className="text-xs"
                  >
                    {classItem.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {classItem.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {classItem.room}
                  </span>
                </div>
              </div>

              <Badge variant="outline">{classItem.instrument}</Badge>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
