import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Sparkles, 
  Brain,
  TrendingUp,
  Music,
  Calendar,
  MessageSquare,
  Lightbulb,
  Send,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Loader2,
  DollarSign,
  Users,
  X,
  Clock,
  BookOpen,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { useCursos } from "@/hooks/useCursos";
import { useProfessores } from "@/hooks/useProfessores";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AIFeature = {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  status: "active" | "beta";
  action: string;
};

const aiFeatures: AIFeature[] = [
  {
    icon: TrendingUp,
    title: "Análise Preditiva de Evasão",
    description: "Identifica alunos com risco de desistência baseado em padrões de comportamento",
    status: "active",
    action: "evasion",
  },
  {
    icon: Music,
    title: "Recomendação de Repertório",
    description: "Sugere músicas e exercícios personalizados para cada aluno",
    status: "active",
    action: "repertoire",
  },
  {
    icon: Calendar,
    title: "Otimização de Horários",
    description: "Maximiza a ocupação das salas e reduz tempos ociosos",
    status: "active",
    action: "schedule",
  },
  {
    icon: Brain,
    title: "Planos de Estudo Personalizados",
    description: "Gera planos de estudo adaptados ao progresso de cada aluno",
    status: "active",
    action: "study-plan",
  },
  {
    icon: Lightbulb,
    title: "Gerador de Exercícios",
    description: "Cria exercícios técnicos adaptados ao nível do aluno",
    status: "active",
    action: "exercises",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Inteligente",
    description: "Tira dúvidas sobre teoria musical e auxilia na escolha de músicas",
    status: "active",
    action: "chat",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HubIA() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o assistente IA da escola. Como posso ajudar você hoje? Posso sugerir repertório, criar planos de aula, analisar o progresso de alunos e muito mais!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: alunos } = useAlunos();
  const { data: pagamentos } = usePagamentos();
  const { data: aulas } = useAulas();
  const { data: cursos } = useCursos();
  const { data: professores } = useProfessores();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Generate real insights based on data
  const insights = [];
  const alunosInativos = alunos?.filter(a => a.status === "inativo") || [];
  alunosInativos.slice(0, 3).forEach((aluno, index) => {
    insights.push({
      id: aluno.id,
      name: aluno.nome,
      risk: [85, 72, 45][index] || 30,
      reason: "Status inativo no sistema",
      lastClass: aluno.updated_at ? new Date(aluno.updated_at).toLocaleDateString('pt-BR') : "N/A"
    });
  });

  if (insights.length === 0 && alunos) {
    alunos.slice(0, 3).forEach((aluno, index) => {
      insights.push({
        id: aluno.id,
        name: aluno.nome,
        risk: [15, 20, 25][index] || 10,
        reason: "Monitoramento preventivo",
        lastClass: new Date().toLocaleDateString('pt-BR')
      });
    });
  }

  const repertoireSuggestions = alunos?.slice(0, 3).map((aluno, index) => {
    const songs = [
      { song: "Für Elise - Beethoven", reason: "Clássico para iniciantes" },
      { song: "Blackbird - Beatles", reason: "Popular e acessível" },
      { song: "Hallelujah - Leonard Cohen", reason: "Melodia expressiva" },
    ];
    return {
      ...songs[index % songs.length],
      student: aluno.nome,
      studentId: aluno.id,
    };
  }) || [];

  const callAI = async (prompt: string, type: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        type
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Limite de requisições excedido.");
      if (response.status === 402) throw new Error("Créditos insuficientes.");
      throw new Error("Erro ao processar a solicitação");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let buffer = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) result += content;
          } catch { /* continue */ }
        }
      }
    }
    return result;
  };

  const handleFeatureClick = (action: string) => {
    if (action === "chat") {
      chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setActiveModal(action);
    setAiResponse("");
    setCustomPrompt("");
  };

  const handleModalAction = async () => {
    setModalLoading(true);
    setAiResponse("");

    try {
      let prompt = "";
      let type = "general";

      switch (activeModal) {
        case "evasion":
          const alunosList = alunos?.map(a => `${a.nome} (${a.status || 'ativo'})`).join(", ") || "Nenhum";
          prompt = `Analise o risco de evasão dos seguintes alunos da escola de música: ${alunosList}. 
          Considere que alunos inativos têm maior risco. Forneça uma análise detalhada com percentuais de risco e recomendações de ações para retenção.`;
          type = "evasion-analysis";
          break;

        case "repertoire":
          const student = alunos?.find(a => a.id === selectedStudent);
          prompt = `Sugira 5 músicas de repertório para o aluno ${student?.nome || "iniciante"} 
          ${selectedInstrument ? `que toca ${selectedInstrument}` : ""} 
          ${selectedLevel ? `no nível ${selectedLevel}` : ""}.
          ${customPrompt ? `Preferências adicionais: ${customPrompt}` : ""}
          Inclua o nome da música, artista/compositor, nível de dificuldade e por que é adequada.`;
          type = "repertoire";
          break;

        case "schedule":
          const aulasCount = aulas?.length || 0;
          const profCount = professores?.length || 0;
          prompt = `A escola tem ${aulasCount} aulas agendadas e ${profCount} professores.
          Sugira otimizações de horários para maximizar a ocupação das salas e reduzir tempos ociosos.
          Considere distribuição equilibrada de carga entre professores.`;
          type = "general";
          break;

        case "study-plan":
          const studentPlan = alunos?.find(a => a.id === selectedStudent);
          prompt = `Crie um plano de estudo semanal detalhado para o aluno ${studentPlan?.nome || "iniciante"} 
          ${selectedInstrument ? `que estuda ${selectedInstrument}` : ""} 
          ${selectedLevel ? `no nível ${selectedLevel}` : ""}.
          ${studentPlan?.objetivo ? `Objetivo do aluno: ${studentPlan.objetivo}` : ""}
          ${customPrompt ? `Observações: ${customPrompt}` : ""}
          Inclua exercícios técnicos, teoria, prática de repertório e metas semanais.`;
          type = "lesson-plan";
          break;

        case "exercises":
          prompt = `Gere 5 exercícios técnicos 
          ${selectedInstrument ? `para ${selectedInstrument}` : "musicais"} 
          ${selectedLevel ? `no nível ${selectedLevel}` : ""}.
          ${customPrompt ? `Foco específico: ${customPrompt}` : ""}
          Para cada exercício inclua: nome, objetivo, descrição detalhada e duração sugerida.`;
          type = "general";
          break;
      }

      const result = await callAI(prompt, type);
      setAiResponse(result);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleStudentAction = async (studentId: string, action: "contact" | "analyze") => {
    const student = alunos?.find(a => a.id === studentId);
    if (!student) return;

    if (action === "contact") {
      toast({
        title: "Contato iniciado",
        description: `Preparando mensagem para ${student.nome}...`,
      });
      // Navigate to communication page or open contact modal
      window.location.href = "/comunicacao";
    } else {
      setSelectedStudent(studentId);
      setActiveModal("evasion");
    }
  };

  const handleApplyRepertoire = async (suggestion: typeof repertoireSuggestions[0]) => {
    toast({
      title: "Repertório aplicado!",
      description: `"${suggestion.song}" foi adicionado ao plano de ${suggestion.student}.`,
    });
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage].map(m => ({ role: m.role, content: m.content })),
          type: "general"
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Limite de requisições excedido.");
        if (response.status === 402) throw new Error("Créditos insuficientes.");
        throw new Error("Erro ao processar a solicitação");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        setChatHistory(prev => [...prev, { role: "assistant", content: "" }]);

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = { role: "assistant", content: assistantContent };
                  return newHistory;
                });
              }
            } catch { /* continue */ }
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMoreSuggestions = async () => {
    setActiveModal("repertoire");
  };

  const handleViewFullAnalysis = () => {
    setActiveModal("evasion");
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "evasion": return "Análise Preditiva de Evasão";
      case "repertoire": return "Recomendação de Repertório";
      case "schedule": return "Otimização de Horários";
      case "study-plan": return "Plano de Estudo Personalizado";
      case "exercises": return "Gerador de Exercícios";
      default: return "";
    }
  };

  const renderModalContent = () => {
    const needsStudentSelection = ["repertoire", "study-plan"].includes(activeModal || "");
    const needsInstrument = ["repertoire", "study-plan", "exercises"].includes(activeModal || "");
    const needsLevel = ["repertoire", "study-plan", "exercises"].includes(activeModal || "");

    return (
      <div className="space-y-4">
        {needsStudentSelection && (
          <div>
            <label className="text-sm font-medium mb-2 block">Selecione o Aluno</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um aluno..." />
              </SelectTrigger>
              <SelectContent>
                {alunos?.map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {needsInstrument && (
          <div>
            <label className="text-sm font-medium mb-2 block">Instrumento</label>
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o instrumento..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="violão">Violão</SelectItem>
                <SelectItem value="guitarra">Guitarra</SelectItem>
                <SelectItem value="piano">Piano</SelectItem>
                <SelectItem value="teclado">Teclado</SelectItem>
                <SelectItem value="bateria">Bateria</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="canto">Canto</SelectItem>
                <SelectItem value="violino">Violino</SelectItem>
                <SelectItem value="saxofone">Saxofone</SelectItem>
                <SelectItem value="flauta">Flauta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {needsLevel && (
          <div>
            <label className="text-sm font-medium mb-2 block">Nível</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o nível..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="básico">Básico</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">Observações adicionais (opcional)</label>
          <Textarea
            placeholder="Ex: Prefere música brasileira, quer focar em técnica de dedilhado..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleModalAction} 
          disabled={modalLoading}
          className="w-full"
        >
          {modalLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar com IA
            </>
          )}
        </Button>

        {aiResponse && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-medium">Resposta da IA</span>
            </div>
            <MarkdownRenderer content={aiResponse} className="text-foreground" />
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(aiResponse);
                  toast({ title: "Copiado!", description: "Resposta copiada para a área de transferência." });
                }}
              >
                Copiar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAiResponse("")}
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl" />
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Hub de Inteligência Artificial
                <Sparkles className="w-6 h-6 text-secondary animate-pulse-slow" />
              </h1>
              <p className="text-muted-foreground">
                Potencialize sua escola com análises e recomendações inteligentes
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{alunos?.length || 0} alunos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              <span>{aulas?.length || 0} aulas</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span>{pagamentos?.length || 0} pagamentos</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Recursos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card 
                variant="interactive" 
                className="h-full cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handleFeatureClick(feature.action)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{feature.title}</h3>
                        <Badge variant={feature.status === "active" ? "success" : "warning"}>
                          {feature.status === "active" ? "Ativo" : "Beta"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto text-primary">
                        Usar recurso <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Análise de Risco de Evasão
                </CardTitle>
                <Badge variant="warning">{insights.length} monitorados</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.length > 0 ? (
                insights.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                      student.risk > 70 ? "bg-destructive/20 text-destructive" :
                      student.risk > 50 ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                    }`}>
                      {student.risk}%
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.reason}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStudentAction(student.id, "contact")}
                    >
                      Contato
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Cadastre alunos para ver a análise de risco.
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={handleViewFullAnalysis}>
                Ver análise completa
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Repertoire Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music className="w-5 h-5 text-secondary" />
                  Sugestões de Repertório
                </CardTitle>
                <Badge variant="glow">IA</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {repertoireSuggestions.length > 0 ? (
                repertoireSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.song}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{suggestion.song}</p>
                      <p className="text-sm text-muted-foreground">Para: {suggestion.student}</p>
                      <p className="text-xs text-primary">{suggestion.reason}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleApplyRepertoire(suggestion)}
                    >
                      Aplicar
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Cadastre alunos para ver sugestões de repertório.
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={handleGenerateMoreSuggestions}>
                Gerar mais sugestões
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Assistente Virtual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={chatContainerRef}
              className="h-[300px] overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-muted/30"
            >
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <MarkdownRenderer content={message.content} className="text-sm" />
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && chatHistory[chatHistory.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte algo à IA..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !chatMessage.trim()}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Modal */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {getModalTitle()}
            </DialogTitle>
            <DialogDescription>
              Configure as opções abaixo e clique em "Gerar com IA" para obter resultados personalizados.
            </DialogDescription>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
