import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanosAula, useCreatePlanoAula, useDeletePlanoAula, type NovoPlanoAula } from "@/hooks/usePlanosAula";
import { toast } from "@/hooks/use-toast";
import { MaterialsManager } from "@/components/pedagogico/MaterialsManager";
import { EvaluationsManager } from "@/components/pedagogico/EvaluationsManager";

export default function Pedagogico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlano, setNewPlano] = useState<NovoPlanoAula>({
    titulo: "",
    instrumento: "",
    nivel: "iniciante",
    duracao: "",
    conteudo: "",
    objetivos: "",
    materiais: "",
  });

  const { data: planosAula, isLoading } = usePlanosAula();
  const createPlanoMutation = useCreatePlanoAula();
  const deletePlanoMutation = useDeletePlanoAula();

  const filteredPlanos = planosAula?.filter(plano =>
    plano.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plano.instrumento.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreatePlano = () => {
    if (!newPlano.titulo || !newPlano.instrumento) {
      toast({
        title: "Erro",
        description: "Título e instrumento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createPlanoMutation.mutate(newPlano, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewPlano({
          titulo: "",
          instrumento: "",
          nivel: "iniciante",
          duracao: "",
          conteudo: "",
          objetivos: "",
          materiais: "",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão Pedagógica</h1>
          <p className="text-muted-foreground">
            Planos de aula e material didático
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Plano de Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Plano de Aula</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input 
                  id="titulo" 
                  placeholder="Ex: Introdução às Escalas"
                  value={newPlano.titulo}
                  onChange={(e) => setNewPlano(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Instrumento *</Label>
                  <Select
                    value={newPlano.instrumento}
                    onValueChange={(value) => setNewPlano(prev => ({ ...prev, instrumento: value }))}
                  >
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nível</Label>
                  <Select
                    value={newPlano.nivel}
                    onValueChange={(value) => setNewPlano(prev => ({ ...prev, nivel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duracao">Duração</Label>
                <Input 
                  id="duracao" 
                  placeholder="Ex: 45 minutos"
                  value={newPlano.duracao}
                  onChange={(e) => setNewPlano(prev => ({ ...prev, duracao: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea 
                  id="objetivos" 
                  placeholder="Objetivos da aula..."
                  value={newPlano.objetivos}
                  onChange={(e) => setNewPlano(prev => ({ ...prev, objetivos: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea 
                  id="conteudo" 
                  placeholder="Descreva o conteúdo da aula..." 
                  rows={4}
                  value={newPlano.conteudo}
                  onChange={(e) => setNewPlano(prev => ({ ...prev, conteudo: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="materiais">Materiais Necessários</Label>
                <Input 
                  id="materiais" 
                  placeholder="Ex: Partitura, metrônomo"
                  value={newPlano.materiais}
                  onChange={(e) => setNewPlano(prev => ({ ...prev, materiais: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleCreatePlano}
                disabled={createPlanoMutation.isPending}
              >
                {createPlanoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{planosAula?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Planos de Aula</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{planosAula?.filter(p => p.nivel === "avancado").length || 0}</p>
                <p className="text-xs text-muted-foreground">Nível Avançado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(planosAula?.map(p => p.instrumento)).size || 0}</p>
                <p className="text-xs text-muted-foreground">Instrumentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <BarChart3 className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{planosAula?.filter(p => p.nivel === "iniciante").length || 0}</p>
                <p className="text-xs text-muted-foreground">Para Iniciantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="planos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="planos">
            <BookOpen className="w-4 h-4 mr-2" />
            Planos de Aula
          </TabsTrigger>
          <TabsTrigger value="materiais">
            <FileText className="w-4 h-4 mr-2" />
            Materiais
          </TabsTrigger>
          <TabsTrigger value="avaliacoes">
            <Star className="w-4 h-4 mr-2" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos de aula..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredPlanos.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum plano de aula encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente outra busca" : "Crie seu primeiro plano de aula"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlanos.map((plano, index) => (
                <motion.div
                  key={plano.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card hover:border-primary/30 transition-all relative group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{plano.titulo}</CardTitle>
                          <p className="text-sm text-muted-foreground">{plano.instrumento}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{plano.nivel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plano.duracao && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duração</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{plano.duracao}</span>
                          </div>
                        </div>
                      )}
                      {plano.objetivos && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{plano.objetivos}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1">
                          Ver Detalhes
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deletePlanoMutation.mutate(plano.id)}
                          disabled={deletePlanoMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materiais">
          <MaterialsManager />
        </TabsContent>

        <TabsContent value="avaliacoes">
          <EvaluationsManager />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
