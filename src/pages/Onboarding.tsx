import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, GraduationCap, Guitar, Users, Clock, PartyPopper,
  ArrowLeft, ArrowRight, Loader2, Check, Sparkles, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InstrumentoSelect } from "@/components/ui/instrumento-select";
import { toast } from "sonner";
import { useOnboarding, useUpdateOnboarding, TOTAL_PASSOS } from "@/hooks/useOnboarding";
import { useUpdateConfiguracoes, useConfiguracoes } from "@/hooks/useConfiguracoes";
import { useCreateProfessor } from "@/hooks/useProfessores";
import { useCreateInstrumento } from "@/hooks/useInstrumentos";
import { useCreateAluno } from "@/hooks/useAlunos";
import { seedDemoData } from "@/lib/demo-data";
import { Json } from "@/integrations/supabase/types";
import logo from "@/assets/autobotize-logo-sm.webp";

const diasSemana = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const passosMeta = [
  { titulo: "Dados da escola", descricao: "Como sua escola se identifica no sistema", icon: Building2 },
  { titulo: "Primeiro professor", descricao: "Quem vai dar as aulas?", icon: GraduationCap },
  { titulo: "Primeiro instrumento", descricao: "Patrimônio da escola", icon: Guitar },
  { titulo: "Primeiro aluno", descricao: "Comece sua base de alunos", icon: Users },
  { titulo: "Horário de funcionamento", descricao: "Usado na agenda de aulas", icon: Clock },
  { titulo: "Tudo pronto!", descricao: "Sua escola está configurada", icon: PartyPopper },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { data: progresso, isLoading } = useOnboarding();
  const { data: configuracoes } = useConfiguracoes();
  const updateOnboarding = useUpdateOnboarding();
  const updateConfiguracoes = useUpdateConfiguracoes();
  const createProfessor = useCreateProfessor();
  const createInstrumento = useCreateInstrumento();
  const createAluno = useCreateAluno();

  const [passo, setPasso] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Passo 1
  const [nomeEscola, setNomeEscola] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"pj" | "pf">("pj");
  const [documento, setDocumento] = useState("");
  const [emailEscola, setEmailEscola] = useState("");
  const [telefoneEscola, setTelefoneEscola] = useState("");
  const [descricao, setDescricao] = useState("");

  // Passo 2
  const [profNome, setProfNome] = useState("");
  const [profInstrumento, setProfInstrumento] = useState("");
  const [profTelefone, setProfTelefone] = useState("");
  const [profEmail, setProfEmail] = useState("");

  // Passo 3
  const [instNome, setInstNome] = useState("");
  const [instTipo, setInstTipo] = useState("");
  const [instMarca, setInstMarca] = useState("");
  const [instValor, setInstValor] = useState("");

  // Passo 4
  const [alunoNome, setAlunoNome] = useState("");
  const [alunoApelido, setAlunoApelido] = useState("");
  const [alunoTelefone, setAlunoTelefone] = useState("");
  const [alunoEmail, setAlunoEmail] = useState("");

  // Passo 5
  const [horarios, setHorarios] = useState<Record<string, { inicio: string; fim: string; ativo: boolean }>>({
    segunda: { inicio: "08:00", fim: "21:00", ativo: true },
    terca: { inicio: "08:00", fim: "21:00", ativo: true },
    quarta: { inicio: "08:00", fim: "21:00", ativo: true },
    quinta: { inicio: "08:00", fim: "21:00", ativo: true },
    sexta: { inicio: "08:00", fim: "21:00", ativo: true },
    sabado: { inicio: "08:00", fim: "14:00", ativo: true },
    domingo: { inicio: "09:00", fim: "12:00", ativo: false },
  });

  // Retoma exatamente do passo salvo no banco
  useEffect(() => {
    if (progresso?.passo_atual) {
      setPasso(Math.min(Math.max(progresso.passo_atual, 1), TOTAL_PASSOS));
    }
  }, [progresso?.passo_atual]);

  useEffect(() => {
    if (!configuracoes) return;
    setNomeEscola((v) => v || configuracoes.nome || "");
    setDocumento((v) => v || configuracoes.cnpj || "");
    setEmailEscola((v) => v || configuracoes.email || "");
    setTelefoneEscola((v) => v || configuracoes.telefone || "");
    setDescricao((v) => v || configuracoes.descricao || "");
  }, [configuracoes]);

  const meta = passosMeta[passo - 1];
  const progressoPct = useMemo(() => (passo / TOTAL_PASSOS) * 100, [passo]);

  const irPara = async (novoPasso: number) => {
    const alvo = Math.min(Math.max(novoPasso, 1), TOTAL_PASSOS);
    setPasso(alvo);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      await updateOnboarding.mutateAsync({ passo_atual: alvo });
    } catch {
      /* progresso local mantido */
    }
  };

  const finalizar = async () => {
    try {
      await updateOnboarding.mutateAsync({ passo_atual: TOTAL_PASSOS, concluido: true });
    } catch {
      /* segue mesmo assim */
    }
  };

  const handleAvancar = async () => {
    setSalvando(true);
    try {
      if (passo === 1) {
        if (!nomeEscola.trim()) {
          toast.error("Informe o nome da escola para continuar.");
          return;
        }
        await updateConfiguracoes.mutateAsync({
          nome: nomeEscola.trim(),
          cnpj: documento,
          email: emailEscola,
          telefone: telefoneEscola,
          descricao,
        });
      }

      if (passo === 2 && profNome.trim()) {
        await createProfessor.mutateAsync({
          nome: profNome.trim(),
          email: profEmail || undefined,
          telefone: profTelefone || undefined,
          especialidade: profInstrumento || undefined,
          instrumentos: profInstrumento ? [profInstrumento] : undefined,
          status: "ativo",
        });
      }

      if (passo === 3 && instNome.trim()) {
        await createInstrumento.mutateAsync({
          nome: instNome.trim(),
          tipo: instTipo || undefined,
          marca: instMarca || undefined,
          valor_patrimonio: instValor ? Number(instValor) : undefined,
          status: "disponivel",
        });
      }

      if (passo === 4 && alunoNome.trim()) {
        await createAluno.mutateAsync({
          nome: alunoNome.trim(),
          apelido: alunoApelido || undefined,
          telefone: alunoTelefone || undefined,
          email: alunoEmail || undefined,
        });
      }

      if (passo === 5) {
        const horariosFuncionamento: Record<string, { inicio: string; fim: string }> = {};
        Object.entries(horarios).forEach(([dia, { inicio, fim, ativo }]) => {
          if (ativo) horariosFuncionamento[dia] = { inicio, fim };
        });
        await updateConfiguracoes.mutateAsync({
          horario_funcionamento: horariosFuncionamento as Json,
        });
      }

      if (passo === TOTAL_PASSOS - 1) await finalizar();
      await irPara(passo + 1);
    } catch (error) {
      // erros já exibem toast nos hooks
    } finally {
      setSalvando(false);
    }
  };

  const handlePular = async () => {
    if (passo === TOTAL_PASSOS - 1) await finalizar();
    await irPara(passo + 1);
  };

  const handleIrDashboard = async () => {
    await finalizar();
    navigate("/dashboard", { replace: true });
  };

  const handleDadosExemplo = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await updateOnboarding.mutateAsync({
        passo_atual: TOTAL_PASSOS,
        concluido: true,
        dados_exemplo_criados: true,
      });
      toast.success("Dados de exemplo criados! Eles começam com [Exemplo] e podem ser excluídos depois.");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível criar os dados de exemplo.");
    } finally {
      setSeeding(false);
    }
  };

  const updateHorario = (dia: string, campo: "inicio" | "fim" | "ativo", valor: string | boolean) =>
    setHorarios((prev) => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  const Icone = meta.icon;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,hsl(270_100%_50%/0.10)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(158_100%_50%/0.06)_0%,transparent_50%)]" />

      <div className="relative max-w-3xl mx-auto px-4 py-8 lg:py-14">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Autobotize" className="w-10 h-10 rounded-xl object-cover" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">Configuração inicial</h1>
              <p className="text-xs text-muted-foreground">Leva menos de 3 minutos</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            {passo}/{TOTAL_PASSOS}
          </span>
        </header>

        <Progress value={progressoPct} className="h-2 mb-3" />
        <div className="hidden sm:flex items-center justify-between mb-8">
          {passosMeta.map((p, i) => (
            <div
              key={p.titulo}
              className={`flex items-center gap-1.5 text-[11px] ${
                i + 1 === passo ? "text-primary font-semibold" : i + 1 < passo ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                i + 1 < passo ? "bg-primary/20 border-primary/40" : i + 1 === passo ? "border-primary" : "border-border"
              }`}>
                {i + 1 < passo ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden md:inline">{p.titulo}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={passo}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icone className="w-5 h-5 text-primary" />
                  {meta.titulo}
                </CardTitle>
                <CardDescription>{meta.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passo === 1 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-nome">Nome da escola *</Label>
                      <Input id="ob-nome" value={nomeEscola} onChange={(e) => setNomeEscola(e.target.value)} placeholder="Escola de Música Harmonia" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo de pessoa</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant={tipoPessoa === "pj" ? "default" : "outline"} onClick={() => setTipoPessoa("pj")} className="flex-1">
                          Pessoa Jurídica
                        </Button>
                        <Button type="button" variant={tipoPessoa === "pf" ? "default" : "outline"} onClick={() => setTipoPessoa("pf")} className="flex-1">
                          Pessoa Física
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="ob-doc">{tipoPessoa === "pj" ? "CNPJ" : "CPF"}</Label>
                        <Input id="ob-doc" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder={tipoPessoa === "pj" ? "00.000.000/0000-00" : "000.000.000-00"} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ob-tel">Telefone / WhatsApp</Label>
                        <Input id="ob-tel" value={telefoneEscola} onChange={(e) => setTelefoneEscola(e.target.value)} placeholder="(11) 99999-9999" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-email">E-mail de contato</Label>
                      <Input id="ob-email" type="email" value={emailEscola} onChange={(e) => setEmailEscola(e.target.value)} placeholder="contato@suaescola.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-desc">Descrição (opcional)</Label>
                      <Textarea id="ob-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} />
                    </div>
                  </>
                )}

                {passo === 2 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-prof">Nome do professor</Label>
                      <Input id="ob-prof" value={profNome} onChange={(e) => setProfNome(e.target.value)} placeholder="Ana Souza" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Instrumento principal</Label>
                      <InstrumentoSelect value={profInstrumento} onChange={setProfInstrumento} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="ob-prof-tel">Telefone</Label>
                        <Input id="ob-prof-tel" value={profTelefone} onChange={(e) => setProfTelefone(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ob-prof-email">E-mail</Label>
                        <Input id="ob-prof-email" type="email" value={profEmail} onChange={(e) => setProfEmail(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {passo === 3 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-inst">Nome do instrumento</Label>
                      <Input id="ob-inst" value={instNome} onChange={(e) => setInstNome(e.target.value)} placeholder="Violão Clássico" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="ob-inst-tipo">Tipo</Label>
                        <Input id="ob-inst-tipo" value={instTipo} onChange={(e) => setInstTipo(e.target.value)} placeholder="Cordas" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ob-inst-marca">Marca</Label>
                        <Input id="ob-inst-marca" value={instMarca} onChange={(e) => setInstMarca(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ob-inst-valor">Valor de patrimônio (R$)</Label>
                      <Input id="ob-inst-valor" type="number" value={instValor} onChange={(e) => setInstValor(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se sua escola não empresta instrumentos, use "Pular por enquanto".
                    </p>
                  </>
                )}

                {passo === 4 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="ob-aluno">Nome do aluno</Label>
                        <Input id="ob-aluno" value={alunoNome} onChange={(e) => setAlunoNome(e.target.value)} placeholder="João Pereira" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ob-aluno-apelido">Apelido</Label>
                        <Input id="ob-aluno-apelido" value={alunoApelido} onChange={(e) => setAlunoApelido(e.target.value)} placeholder="João" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="ob-aluno-tel">Telefone / WhatsApp</Label>
                        <Input id="ob-aluno-tel" value={alunoTelefone} onChange={(e) => setAlunoTelefone(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ob-aluno-email">E-mail</Label>
                        <Input id="ob-aluno-email" type="email" value={alunoEmail} onChange={(e) => setAlunoEmail(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {passo === 5 && (
                  <div className="grid gap-3">
                    {diasSemana.map(({ key, label }) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30">
                        <span className="font-medium w-24">{label}</span>
                        <div className="flex items-center gap-2">
                          <Input type="time" value={horarios[key].inicio} onChange={(e) => updateHorario(key, "inicio", e.target.value)} className="w-24 sm:w-28" disabled={!horarios[key].ativo} />
                          <span className="text-muted-foreground text-sm">até</span>
                          <Input type="time" value={horarios[key].fim} onChange={(e) => updateHorario(key, "fim", e.target.value)} className="w-24 sm:w-28" disabled={!horarios[key].ativo} />
                          <Switch checked={horarios[key].ativo} onCheckedChange={(c) => updateHorario(key, "ativo", c)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {passo === 6 && (
                  <div className="text-center py-6 space-y-5">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <PartyPopper className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Sua escola está pronta!</h2>
                      <p className="text-muted-foreground mt-1">
                        Você pode ajustar tudo depois em Configurações.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <Button onClick={handleIrDashboard} className="gap-2" size="lg">
                        <LayoutDashboard className="w-4 h-4" />
                        Ir para o Dashboard
                      </Button>
                      <Button onClick={handleDadosExemplo} variant="outline" className="gap-2" size="lg" disabled={seeding}>
                        {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Explorar com dados de exemplo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Os dados de exemplo são criados com o prefixo [Exemplo] e podem ser excluídos a qualquer momento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {passo < TOTAL_PASSOS && (
          <div className="flex items-center justify-between gap-3 mt-6">
            <Button variant="ghost" onClick={() => irPara(passo - 1)} disabled={passo === 1 || salvando} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              {passo > 1 && (
                <Button variant="outline" onClick={handlePular} disabled={salvando}>
                  Pular por enquanto
                </Button>
              )}
              <Button onClick={handleAvancar} disabled={salvando} className="gap-2">
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {passo === TOTAL_PASSOS - 1 ? "Concluir" : "Continuar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
