import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BookOpen, FileText, Copy, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface AIAssistantProps {
  type: "lesson-plan" | "material";
  onApply?: (content: string) => void;
}

export function AIAssistant({ type, onApply }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Form fields
  const [instrumento, setInstrumento] = useState("");
  const [nivel, setNivel] = useState("iniciante");
  const [duracao, setDuracao] = useState("45 minutos");
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");

  const handleGenerate = async () => {
    if (!instrumento || !tema) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha instrumento e tema/tópico",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    const prompt = type === "lesson-plan"
      ? `Crie um plano de aula completo para ${instrumento}, nível ${nivel}, com duração de ${duracao}.
         
         Tema: ${tema}
         ${objetivo ? `Objetivo específico: ${objetivo}` : ""}
         
         Inclua:
         1. Objetivos de aprendizado claros
         2. Materiais necessários
         3. Aquecimento/preparação (5-10 min)
         4. Desenvolvimento do conteúdo principal
         5. Exercícios práticos
         6. Atividade final/revisão
         7. Tarefa para casa (opcional)
         
         Seja específico e prático, incluindo exemplos de músicas quando apropriado.`
      : `Sugira materiais didáticos e recursos para ensinar ${instrumento}, nível ${nivel}.
         
         Tema: ${tema}
         ${objetivo ? `Foco específico: ${objetivo}` : ""}
         
         Inclua:
         1. Livros e métodos recomendados
         2. Partituras/Cifras úteis
         3. Vídeos e tutoriais online
         4. Exercícios técnicos
         5. Músicas para praticar (com links)
         6. Apps e ferramentas digitais
         7. Materiais complementares`;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            type: type === "lesson-plan" ? "lesson-plan" : "repertoire",
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
        }
        if (response.status === 402) {
          throw new Error("Créditos insuficientes.");
        }
        throw new Error("Erro ao gerar conteúdo");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  setResult(fullText);
                }
              } catch {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar conteúdo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copiado!", description: "Conteúdo copiado para a área de transferência" });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(result);
      setIsOpen(false);
      setResult("");
      toast({ title: "Aplicado!", description: "Conteúdo aplicado com sucesso" });
    }
  };

  const resetForm = () => {
    setInstrumento("");
    setNivel("iniciante");
    setDuracao("45 minutos");
    setTema("");
    setObjetivo("");
    setResult("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          {type === "lesson-plan" ? "Gerar com IA" : "Sugerir Materiais com IA"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {type === "lesson-plan" ? "Gerar Plano de Aula com IA" : "Sugerir Materiais com IA"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instrumento *</Label>
              <Select value={instrumento} onValueChange={setInstrumento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piano">Piano</SelectItem>
                  <SelectItem value="Violão">Violão</SelectItem>
                  <SelectItem value="Guitarra">Guitarra</SelectItem>
                  <SelectItem value="Bateria">Bateria</SelectItem>
                  <SelectItem value="Canto">Canto</SelectItem>
                  <SelectItem value="Violino">Violino</SelectItem>
                  <SelectItem value="Baixo">Baixo</SelectItem>
                  <SelectItem value="Teclado">Teclado</SelectItem>
                  <SelectItem value="Flauta">Flauta</SelectItem>
                  <SelectItem value="Saxofone">Saxofone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediário">Intermediário</SelectItem>
                  <SelectItem value="avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "lesson-plan" && (
            <div className="space-y-2">
              <Label>Duração da Aula</Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutos">30 minutos</SelectItem>
                  <SelectItem value="45 minutos">45 minutos</SelectItem>
                  <SelectItem value="60 minutos">60 minutos</SelectItem>
                  <SelectItem value="90 minutos">90 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{type === "lesson-plan" ? "Tema/Tópico da Aula *" : "Tema/Assunto *"}</Label>
            <Input
              placeholder={type === "lesson-plan" 
                ? "Ex: Acordes maiores e menores, Escalas pentatônicas..." 
                : "Ex: Teoria musical básica, Técnica de mão direita..."}
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Objetivo Específico (opcional)</Label>
            <Textarea
              placeholder="Descreva o que o aluno deve aprender ou dominar..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              rows={2}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !instrumento || !tema}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar com IA
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Resultado</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  {onApply && (
                    <Button size="sm" onClick={handleApply}>
                      Aplicar
                    </Button>
                  )}
                </div>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="p-4 prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={result} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}