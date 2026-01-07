import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Star, User, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
import { useAvaliacoes, useCreateAvaliacao, useDeleteAvaliacao } from "@/hooks/useAvaliacoes";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";

export function EvaluationsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alunoFilter, setAlunoFilter] = useState<string>("all");
  const [newAvaliacao, setNewAvaliacao] = useState({
    aluno_id: "",
    professor_id: "",
    data: new Date().toISOString().split("T")[0],
    nota: 7,
    feedback: "",
    aspectos: {
      tecnica: 7,
      teoria: 7,
      ritmo: 7,
      expressao: 7,
    },
  });

  const { data: avaliacoes, isLoading } = useAvaliacoes(alunoFilter === "all" ? undefined : alunoFilter);
  const { data: alunos } = useAlunos();
  const { data: professores } = useProfessores();
  const createAvaliacaoMutation = useCreateAvaliacao();
  const deleteAvaliacaoMutation = useDeleteAvaliacao();

  const handleCreate = () => {
    if (!newAvaliacao.aluno_id) return;

    createAvaliacaoMutation.mutate({
      aluno_id: newAvaliacao.aluno_id,
      professor_id: newAvaliacao.professor_id || undefined,
      data: newAvaliacao.data,
      nota: newAvaliacao.nota,
      feedback: newAvaliacao.feedback || undefined,
      aspectos: newAvaliacao.aspectos,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewAvaliacao({
          aluno_id: "",
          professor_id: "",
          data: new Date().toISOString().split("T")[0],
          nota: 7,
          feedback: "",
          aspectos: { tecnica: 7, teoria: 7, ritmo: 7, expressao: 7 },
        });
      }
    });
  };

  const getNotaColor = (nota: number | null) => {
    if (!nota) return "text-muted-foreground";
    if (nota >= 8) return "text-green-500";
    if (nota >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={alunoFilter} onValueChange={setAlunoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por aluno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os alunos</SelectItem>
              {alunos?.map(aluno => (
                <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Avaliação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aluno *</Label>
                  <Select
                    value={newAvaliacao.aluno_id}
                    onValueChange={(value) => setNewAvaliacao(prev => ({ ...prev, aluno_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos?.map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Professor</Label>
                  <Select
                    value={newAvaliacao.professor_id}
                    onValueChange={(value) => setNewAvaliacao(prev => ({ ...prev, professor_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores?.map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data da Avaliação</Label>
                <Input
                  id="data"
                  type="date"
                  value={newAvaliacao.data}
                  onChange={(e) => setNewAvaliacao(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>

              {/* Note General */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Nota Geral</Label>
                  <span className={`font-bold text-lg ${getNotaColor(newAvaliacao.nota)}`}>
                    {newAvaliacao.nota}
                  </span>
                </div>
                <Slider
                  value={[newAvaliacao.nota]}
                  onValueChange={([value]) => setNewAvaliacao(prev => ({ ...prev, nota: value }))}
                  max={10}
                  min={0}
                  step={0.5}
                />
              </div>

              {/* Aspects */}
              <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                <Label>Aspectos Avaliados</Label>
                
                {Object.entries(newAvaliacao.aspectos).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <span className={getNotaColor(value)}>{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([v]) => setNewAvaliacao(prev => ({
                        ...prev,
                        aspectos: { ...prev.aspectos, [key]: v }
                      }))}
                      max={10}
                      min={0}
                      step={0.5}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Comentários sobre o desempenho do aluno..."
                  rows={3}
                  value={newAvaliacao.feedback}
                  onChange={(e) => setNewAvaliacao(prev => ({ ...prev, feedback: e.target.value }))}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!newAvaliacao.aluno_id || createAvaliacaoMutation.isPending}
              >
                {createAvaliacaoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar Avaliação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Evaluations Grid */}
      {!avaliacoes || avaliacoes.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
            <p className="text-muted-foreground mb-4">Registre avaliações para acompanhar o progresso dos alunos</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avaliacoes.map((avaliacao, index) => (
            <motion.div
              key={avaliacao.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card hover:border-primary/30 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">{avaliacao.alunos?.nome || "Aluno"}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getNotaColor(avaliacao.nota)}`}>
                        {avaliacao.nota || "-"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteAvaliacaoMutation.mutate(avaliacao.id)}
                        disabled={deleteAvaliacaoMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(avaliacao.data).toLocaleDateString("pt-BR")}
                    </div>
                    {avaliacao.professores?.nome && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {avaliacao.professores.nome}
                      </div>
                    )}
                  </div>

                  {/* Aspects */}
                  {avaliacao.aspectos && typeof avaliacao.aspectos === "object" && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(avaliacao.aspectos as Record<string, number>).map(([key, value]) => (
                        <Badge 
                          key={key} 
                          variant="outline" 
                          className={`text-xs ${getNotaColor(value)}`}
                        >
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {avaliacao.feedback && (
                    <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                      <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground line-clamp-2">{avaliacao.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
