import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, PartyPopper, Calendar } from "lucide-react";
import { useAlunos } from "@/hooks/useAlunos";
import { useNavigate } from "react-router-dom";

export function BirthdayCard() {
  const navigate = useNavigate();
  const { data: alunos } = useAlunos();

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  // Get birthdays today
  const aniversariantes = alunos?.filter((aluno) => {
    if (!aluno.data_nascimento) return false;
    const [year, month, day] = aluno.data_nascimento.split("-").map(Number);
    return day === todayDay && month === todayMonth;
  }) || [];

  // Get upcoming birthdays (next 7 days)
  const proximosAniversarios = alunos?.filter((aluno) => {
    if (!aluno.data_nascimento) return false;
    const [, month, day] = aluno.data_nascimento.split("-").map(Number);
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      if (futureDate.getDate() === day && futureDate.getMonth() + 1 === month) {
        return true;
      }
    }
    return false;
  }).map((aluno) => {
    const [, month, day] = aluno.data_nascimento!.split("-").map(Number);
    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
    if (birthdayThisYear < today) birthdayThisYear.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...aluno, diasRestantes: diffDays };
  }).sort((a, b) => a.diasRestantes - b.diasRestantes) || [];

  const calcularIdade = (dataNascimento: string) => {
    const [year] = dataNascimento.split("-").map(Number);
    return today.getFullYear() - year;
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cake className="w-5 h-5 text-primary" />
              Aniversariantes
            </CardTitle>
            {aniversariantes.length > 0 && (
              <Badge variant="glow" className="animate-pulse">
                <PartyPopper className="w-3 h-3 mr-1" />
                Hoje!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {aniversariantes.length === 0 && proximosAniversarios.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Cake className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum aniversariante hoje</p>
              <p className="text-xs mt-1">Nem nos próximos 7 dias</p>
            </div>
          ) : (
            <>
              {/* Today's birthdays */}
              {aniversariantes.map((aluno, index) => (
                <motion.div
                  key={aluno.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                >
                  {aluno.foto_url ? (
                    <img src={aluno.foto_url} alt={aluno.nome} className="w-10 h-10 rounded-full object-cover border-2 border-primary/40" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {getInitials(aluno.nome)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{aluno.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      🎂 Faz {calcularIdade(aluno.data_nascimento!)} anos hoje!
                    </p>
                  </div>
                  <PartyPopper className="w-4 h-4 text-primary animate-bounce" />
                </motion.div>
              ))}

              {/* Upcoming birthdays */}
              {aniversariantes.length > 0 && proximosAniversarios.length > 0 && (
                <p className="text-xs text-muted-foreground font-medium pt-2">Próximos dias</p>
              )}
              {proximosAniversarios.slice(0, 4).map((aluno, index) => (
                <motion.div
                  key={aluno.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * (index + aniversariantes.length) }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(`/alunos/${aluno.id}`)}
                >
                  {aluno.foto_url ? (
                    <img src={aluno.foto_url} alt={aluno.nome} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                      {getInitials(aluno.nome)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{aluno.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Faz {calcularIdade(aluno.data_nascimento!)} anos
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {aluno.diasRestantes}d
                  </Badge>
                </motion.div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
