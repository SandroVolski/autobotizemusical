import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  MoreVertical,
  GraduationCap,
  Music,
  DollarSign,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useCursos } from "@/hooks/useCursos";
import { toast } from "@/hooks/use-toast";

const nivelConfig = {
  iniciante: "bg-success/20 text-success border-success/30",
  intermediario: "bg-warning/20 text-warning border-warning/30",
  avancado: "bg-primary/20 text-primary border-primary/30",
};

export default function Cursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCurso, setNewCurso] = useState({
    nome: "",
    instrumento: "",
    nivel: "",
    duracao: "",
    carga_horaria: "",
    valor_mensal: "",
    descricao: "",
  });

  const { cursos, isLoading, createCurso, deleteCurso, isCreating, isDeleting } = useCursos();

  const totalAlunos = 0; // TODO: Calculate from aulas table
  const receitaMensal = cursos?.reduce((acc, curso) => acc + (Number(curso.valor_mensal) || 0), 0) || 0;

  const filteredCursos = cursos?.filter(
    (curso) =>
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instrumento.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateCurso = () => {
    if (!newCurso.nome || !newCurso.instrumento) {
      toast({
        title: "Erro",
        description: "Nome e instrumento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createCurso({
      nome: newCurso.nome,
      instrumento: newCurso.instrumento,
      nivel: newCurso.nivel || "iniciante",
      duracao: newCurso.duracao || null,
      carga_horaria: newCurso.carga_horaria || null,
      valor_mensal: newCurso.valor_mensal ? parseFloat(newCurso.valor_mensal) : null,
      descricao: newCurso.descricao || null,
      status: "ativo",
    });

    setNewCurso({ nome: "", instrumento: "", nivel: "", duracao: "", carga_horaria: "", valor_mensal: "", descricao: "" });
    setIsDialogOpen(false);
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
          <h1 className="text-2xl font-bold text-foreground">Gestão de Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie cursos, workshops e aulas avulsas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Curso</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Curso *</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Piano Intermediário"
                  value={newCurso.nome}
                  onChange={(e) => setNewCurso(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="instrumento">Instrumento *</Label>
                  <Select
                    value={newCurso.instrumento}
                    onValueChange={(value) => setNewCurso(prev => ({ ...prev, instrumento: value }))}
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
                      <SelectItem value="Teoria Musical">Teoria Musical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select
                    value={newCurso.nivel}
                    onValueChange={(value) => setNewCurso(prev => ({ ...prev, nivel: value }))}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duracao">Duração</Label>
                  <Input 
                    id="duracao" 
                    placeholder="Ex: 6 meses"
                    value={newCurso.duracao}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, duracao: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="carga">Carga Horária</Label>
                  <Input 
                    id="carga" 
                    placeholder="Ex: 2h/semana"
                    value={newCurso.carga_horaria}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, carga_horaria: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor Mensal (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0,00"
                  value={newCurso.valor_mensal}
                  onChange={(e) => setNewCurso(prev => ({ ...prev, valor_mensal: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  placeholder="Descreva o conteúdo programático..."
                  value={newCurso.descricao}
                  onChange={(e) => setNewCurso(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleCreateCurso}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar Curso
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
                <p className="text-2xl font-bold">{cursos?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAlunos}</p>
                <p className="text-xs text-muted-foreground">Alunos Matriculados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {receitaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-xs text-muted-foreground">Valor Total/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <GraduationCap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cursos?.filter(c => c.status === "ativo").length || 0}</p>
                <p className="text-xs text-muted-foreground">Cursos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Courses Grid */}
      {filteredCursos.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente outra busca" : "Cadastre seu primeiro curso"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCursos.map((curso, index) => (
            <motion.div
              key={curso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card hover:border-primary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{curso.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{curso.instrumento}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Alunos</DropdownMenuItem>
                        <DropdownMenuItem>Conteúdo Programático</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteCurso(curso.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nível</span>
                    <Badge className={nivelConfig[curso.nivel as keyof typeof nivelConfig] || nivelConfig.iniciante}>
                      {curso.nivel ? curso.nivel.charAt(0).toUpperCase() + curso.nivel.slice(1) : "Iniciante"}
                    </Badge>
                  </div>
                  {curso.duracao && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duração</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{curso.duracao}</span>
                      </div>
                    </div>
                  )}
                  {curso.carga_horaria && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Carga Horária</span>
                      <span className="text-sm font-medium">{curso.carga_horaria}</span>
                    </div>
                  )}
                  {curso.valor_mensal && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Mensalidade</span>
                      <span className="text-lg font-bold text-primary">
                        {Number(curso.valor_mensal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
