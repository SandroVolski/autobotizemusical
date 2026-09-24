import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, PartyPopper, CalendarDays, ChevronLeft, ChevronRight, History } from "lucide-react";
import { useAlunos, type Aluno } from "@/hooks/useAlunos";
import { useNavigate } from "react-router-dom";
import { StudentPhoto } from "@/components/StudentPhoto";
import { cn } from "@/lib/utils";

type PeriodFilter = "7dias" | "30dias" | "mes";

const FILTERS: { key: PeriodFilter; label: string }[] = [
  { key: "7dias", label: "7 dias" },
  { key: "30dias", label: "30 dias" },
  { key: "mes", label: "Mês" },
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Aniversariante extends Aluno {
  dia: number;
  mes: number;
  idade: number;
  diasRestantes: number;
  ehHoje: boolean;
  jaPassou: boolean;
}

export function BirthdayCard() {
  const navigate = useNavigate();
  const { data: alunos } = useAlunos();
  const [filtro, setFiltro] = useState<PeriodFilter>("30dias");
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);

  const hoje = new Date();
  const hojeDia = hoje.getDate();
  const hojeMes = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const aniversariantes = useMemo<Aniversariante[]>(() => {
    if (!alunos) return [];
    const lista: Aniversariante[] = [];

    alunos.forEach((aluno) => {
      if (!aluno.data_nascimento) return;
      const [ano, mes, dia] = aluno.data_nascimento.split("-").map(Number);
      if (!dia || !mes) return;

      if (filtro === "mes") {
        if (mes !== mesSelecionado) return;
        // diasRestantes calculado em relação a hoje (pode ser negativo se já passou no mês)
        const dataAniv = new Date(anoAtual, mes - 1, dia);
        const diff = Math.round(
          (dataAniv.getTime() - new Date(anoAtual, hojeMes - 1, hojeDia).getTime()) / 86400000
        );
        lista.push({
          ...aluno,
          dia,
          mes,
          idade: anoAtual - ano,
          diasRestantes: diff,
          ehHoje: diff === 0,
          jaPassou: diff < 0,
        });
        return;
      }

      const limite = filtro === "7dias" ? 7 : 30;
      // Inclui os últimos 7 dias (negativo = já passou) para não esquecer ninguém
      for (let i = -7; i <= limite; i++) {
        const dataRef = new Date(hoje);
        dataRef.setDate(hoje.getDate() + i);
        if (dataRef.getDate() === dia && dataRef.getMonth() + 1 === mes) {
          lista.push({
            ...aluno,
            dia,
            mes,
            idade: (i <= 0 ? anoAtual : dataRef.getFullYear()) - ano,
            diasRestantes: i,
            ehHoje: i === 0,
            jaPassou: i < 0,
          });
          break;
        }
      }
    });

    return lista.sort((a, b) => {
      if (filtro === "mes") return a.dia - b.dia;
      // Próximos primeiro (hoje → futuro), depois os que já passaram (mais recente primeiro)
      const rankA = a.diasRestantes < 0 ? 1000 + Math.abs(a.diasRestantes) : a.diasRestantes;
      const rankB = b.diasRestantes < 0 ? 1000 + Math.abs(b.diasRestantes) : b.diasRestantes;
      return rankA - rankB;
    });
  }, [alunos, filtro, mesSelecionado, anoAtual, hojeDia, hojeMes]);

  const hojeCount = aniversariantes.filter((a) => a.ehHoje).length;

  // Agrupa por data (dia/mes) para a visualização estilo agenda
  const grupos = useMemo(() => {
    const mapa = new Map<string, Aniversariante[]>();
    aniversariantes.forEach((a) => {
      const chave = `${String(a.dia).padStart(2, "0")}/${String(a.mes).padStart(2, "0")}`;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(a);
    });
    return Array.from(mapa.entries());
  }, [aniversariantes]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const labelDias = (a: Aniversariante) => {
    if (a.ehHoje) return "Hoje!";
    if (a.diasRestantes === 1) return "Amanhã";
    if (a.diasRestantes === -1) return "Ontem";
    if (a.diasRestantes < 0) return `há ${Math.abs(a.diasRestantes)}d`;
    return `em ${a.diasRestantes}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cake className="w-5 h-5 text-primary" />
              Aniversariantes
            </CardTitle>
            {hojeCount > 0 && (
              <Badge variant="glow" className="animate-pulse">
                <PartyPopper className="w-3 h-3 mr-1" />
                {hojeCount} hoje!
              </Badge>
            )}
          </div>

          {/* Filtro de período */}
          <div className="flex items-center gap-1 p-1 mt-2 rounded-lg bg-muted/60 border border-border/50">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={cn(
                  "relative flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filtro === f.key
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filtro === f.key && (
                  <motion.span
                    layoutId="birthday-filter-pill"
                    className="absolute inset-0 rounded-md bg-primary shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>

          {/* Navegação de mês */}
          {filtro === "mes" && (
            <div className="flex items-center justify-between mt-2 px-1">
              <button
                onClick={() => setMesSelecionado((m) => (m === 1 ? 12 : m - 1))}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                {MESES[mesSelecionado - 1]}
                {mesSelecionado === hojeMes && (
                  <span className="text-[10px] font-normal text-muted-foreground">(atual)</span>
                )}
              </span>
              <button
                onClick={() => setMesSelecionado((m) => (m === 12 ? 1 : m + 1))}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-2 max-h-[340px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {aniversariantes.length === 0 ? (
              <motion.div
                key="vazio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 text-muted-foreground"
              >
                <Cake className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum aniversariante</p>
                <p className="text-xs mt-1">
                  {filtro === "mes"
                    ? `em ${MESES[mesSelecionado - 1]}`
                    : filtro === "7dias"
                      ? "nos próximos 7 dias"
                      : "nos próximos 30 dias"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${filtro}-${mesSelecionado}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {grupos.map(([data, lista]) => (
                  <div key={data}>
                    {/* Cabeçalho da data estilo calendário */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[3.2rem] px-1.5 py-0.5 rounded-md text-[11px] font-bold tabular-nums",
                          lista.some((a) => a.ehHoje)
                            ? "bg-primary text-primary-foreground"
                            : lista.every((a) => a.jaPassou)
                              ? "bg-muted/50 text-muted-foreground/60"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {data}
                      </span>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>

                    <div className="space-y-1.5">
                      {lista.map((aluno, index) => (
                        <motion.div
                          key={aluno.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.04 * index }}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border",
                            aluno.ehHoje
                              ? "bg-primary/10 border-primary/25 hover:bg-primary/15"
                              : aluno.jaPassou
                                ? "bg-muted/20 border-transparent opacity-55 hover:opacity-90 hover:bg-muted/40 grayscale"
                                : "bg-muted/40 border-transparent hover:bg-muted"
                          )}
                          onClick={() => navigate(`/alunos/${aluno.id}`)}
                        >
                          <StudentPhoto
                            fotoUrl={aluno.foto_url}
                            alt={aluno.nome}
                            className={cn(
                              "w-9 h-9 rounded-full object-cover",
                              aluno.ehHoje && "border-2 border-primary/40"
                            )}
                            fallback={
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                                  aluno.ehHoje
                                    ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {getInitials(aluno.nome)}
                              </div>
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {aluno.apelido || aluno.nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              🎂 {aluno.ehHoje
                                ? `Fez ${aluno.idade} anos hoje!`
                                : aluno.jaPassou
                                  ? `Fez ${aluno.idade} anos`
                                  : `${aluno.idade} anos`}
                            </p>
                          </div>
                          {aluno.ehHoje ? (
                            <PartyPopper className="w-4 h-4 text-primary animate-bounce shrink-0" />
                          ) : aluno.jaPassou ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 gap-1 border-dashed text-muted-foreground"
                            >
                              <History className="w-3 h-3" />
                              {labelDias(aluno)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {labelDias(aluno)}
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
