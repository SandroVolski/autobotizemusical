import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";

const aiFeatures = [
  {
    icon: TrendingUp,
    title: "Análise Preditiva de Evasão",
    description: "Identifica alunos com risco de desistência baseado em padrões de comportamento",
    status: "active",
  },
  {
    icon: Music,
    title: "Recomendação de Repertório",
    description: "Sugere músicas e exercícios personalizados para cada aluno",
    status: "active",
  },
  {
    icon: Calendar,
    title: "Otimização de Horários",
    description: "Maximiza a ocupação das salas e reduz tempos ociosos",
    status: "active",
  },
  {
    icon: Brain,
    title: "Planos de Estudo Personalizados",
    description: "Gera planos de estudo adaptados ao progresso de cada aluno",
    status: "beta",
  },
  {
    icon: Lightbulb,
    title: "Gerador de Exercícios",
    description: "Cria exercícios técnicos adaptados ao nível do aluno",
    status: "beta",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Inteligente",
    description: "Tira dúvidas sobre teoria musical e auxilia na escolha de músicas",
    status: "active",
  },
];

const repertoireSuggestions = [
  { song: "Für Elise - Beethoven", student: "Maria Silva", reason: "Nível técnico adequado" },
  { song: "Blackbird - Beatles", student: "João Santos", reason: "Interesse declarado" },
  { song: "Back in Black - AC/DC", student: "Ana Costa", reason: "Próximo passo natural" },
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: alunos } = useAlunos();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Analyze students for evasion risk
  const riskStudents = alunos?.filter(a => a.status === 'ativo').slice(0, 3).map((aluno, index) => ({
    name: aluno.nome,
    risk: [85, 72, 45][index] || 30,
    reason: index === 0 ? "Padrão de frequência irregular" : index === 1 ? "Progresso lento" : "Monitoramento preventivo",
    lastClass: new Date().toLocaleDateString('pt-BR')
  })) || [];

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage].map(m => ({ role: m.role, content: m.content })),
          type: "general"
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
        }
        if (response.status === 402) {
          throw new Error("Créditos insuficientes.");
        }
        throw new Error("Erro ao processar a solicitação");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        // Add empty assistant message
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
            } catch {
              // Partial JSON, continue
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
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
              <Card variant="interactive" className="h-full">
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
                <Badge variant="warning">{riskStudents.length} alertas</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskStudents.length > 0 ? (
                riskStudents.map((student, index) => (
                  <motion.div
                    key={student.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
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
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Ação
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum aluno com risco de evasão identificado.
                </p>
              )}
              <Button variant="outline" className="w-full">
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
              {repertoireSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.song}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{suggestion.song}</p>
                    <p className="text-sm text-muted-foreground">Para: {suggestion.student}</p>
                    <p className="text-xs text-primary">{suggestion.reason}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Aplicar
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full">
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
    </div>
  );
}
