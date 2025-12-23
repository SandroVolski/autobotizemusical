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

const cursos = [
  {
    id: 1,
    nome: "Piano Básico",
    instrumento: "Piano",
    nivel: "Iniciante",
    duracao: "6 meses",
    cargaHoraria: "2h/semana",
    alunos: 24,
    valor: 450,
    status: "ativo",
  },
  {
    id: 2,
    nome: "Violão Popular",
    instrumento: "Violão",
    nivel: "Iniciante",
    duracao: "4 meses",
    cargaHoraria: "1h/semana",
    alunos: 32,
    valor: 350,
    status: "ativo",
  },
  {
    id: 3,
    nome: "Guitarra Rock",
    instrumento: "Guitarra",
    nivel: "Intermediário",
    duracao: "8 meses",
    cargaHoraria: "2h/semana",
    alunos: 18,
    valor: 500,
    status: "ativo",
  },
  {
    id: 4,
    nome: "Bateria Avançada",
    instrumento: "Bateria",
    nivel: "Avançado",
    duracao: "12 meses",
    cargaHoraria: "2h/semana",
    alunos: 8,
    valor: 600,
    status: "ativo",
  },
  {
    id: 5,
    nome: "Teoria Musical",
    instrumento: "Teoria",
    nivel: "Todos",
    duracao: "3 meses",
    cargaHoraria: "1h/semana",
    alunos: 45,
    valor: 280,
    status: "ativo",
  },
  {
    id: 6,
    nome: "Canto Coral",
    instrumento: "Canto",
    nivel: "Iniciante",
    duracao: "6 meses",
    cargaHoraria: "2h/semana",
    alunos: 20,
    valor: 320,
    status: "pausado",
  },
];

const nivelConfig = {
  Iniciante: "bg-success/20 text-success border-success/30",
  Intermediário: "bg-warning/20 text-warning border-warning/30",
  Avançado: "bg-primary/20 text-primary border-primary/30",
  Todos: "bg-secondary/20 text-secondary border-secondary/30",
};

export default function Cursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalAlunos = cursos.reduce((acc, curso) => acc + curso.alunos, 0);
  const receitaMensal = cursos.reduce((acc, curso) => acc + (curso.valor * curso.alunos), 0);

  const filteredCursos = cursos.filter(
    (curso) =>
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instrumento.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Label htmlFor="nome">Nome do Curso</Label>
                <Input id="nome" placeholder="Ex: Piano Intermediário" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="instrumento">Instrumento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="violao">Violão</SelectItem>
                      <SelectItem value="guitarra">Guitarra</SelectItem>
                      <SelectItem value="bateria">Bateria</SelectItem>
                      <SelectItem value="canto">Canto</SelectItem>
                      <SelectItem value="teoria">Teoria Musical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select>
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
                  <Input id="duracao" placeholder="Ex: 6 meses" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="carga">Carga Horária</Label>
                  <Input id="carga" placeholder="Ex: 2h/semana" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor Mensal (R$)</Label>
                <Input id="valor" type="number" placeholder="0,00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva o conteúdo programático..." />
              </div>
              <Button className="w-full mt-2" onClick={() => setIsDialogOpen(false)}>
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
                <p className="text-2xl font-bold">{cursos.length}</p>
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
                <p className="text-xs text-muted-foreground">Receita Mensal</p>
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
                <p className="text-2xl font-bold">{cursos.filter(c => c.status === "ativo").length}</p>
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
                      <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nível</span>
                  <Badge className={nivelConfig[curso.nivel as keyof typeof nivelConfig]}>
                    {curso.nivel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duração</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{curso.duracao}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carga Horária</span>
                  <span className="text-sm font-medium">{curso.cargaHoraria}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alunos</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{curso.alunos}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Mensalidade</span>
                  <span className="text-lg font-bold text-primary">
                    {curso.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
