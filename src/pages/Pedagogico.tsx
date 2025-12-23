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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

const planosAula = [
  { id: 1, titulo: "Introdução às Escalas Maiores", instrumento: "Piano", nivel: "Iniciante", duracao: "45min", autor: "Prof. Carlos" },
  { id: 2, titulo: "Acordes Básicos de Violão", instrumento: "Violão", nivel: "Iniciante", duracao: "30min", autor: "Prof. Ana" },
  { id: 3, titulo: "Ritmos de Rock - Parte 1", instrumento: "Bateria", nivel: "Intermediário", duracao: "60min", autor: "Prof. Pedro" },
  { id: 4, titulo: "Técnica de Palhetada Alternada", instrumento: "Guitarra", nivel: "Intermediário", duracao: "45min", autor: "Prof. Marina" },
];

const avaliacoes = [
  { id: 1, aluno: "João Silva", curso: "Piano Básico", data: "15/06/2024", nota: 8.5, status: "concluida" },
  { id: 2, aluno: "Maria Santos", curso: "Violão Popular", data: "18/06/2024", nota: null, status: "agendada" },
  { id: 3, aluno: "Pedro Oliveira", curso: "Guitarra Rock", data: "10/06/2024", nota: 9.2, status: "concluida" },
  { id: 4, aluno: "Ana Costa", curso: "Canto Coral", data: "20/06/2024", nota: null, status: "agendada" },
];

const materiais = [
  { id: 1, titulo: "Apostila de Teoria Musical", tipo: "PDF", downloads: 245, autor: "Prof. Carlos" },
  { id: 2, titulo: "Exercícios de Ritmo - Nível 1", tipo: "PDF", downloads: 189, autor: "Prof. Pedro" },
  { id: 3, titulo: "Vídeo: Como Afinar o Violão", tipo: "Vídeo", downloads: 312, autor: "Prof. Ana" },
  { id: 4, titulo: "Partituras Clássicas - Volume 1", tipo: "PDF", downloads: 156, autor: "Prof. Marina" },
];

export default function Pedagogico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            Planos de aula, avaliações e material didático
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
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" placeholder="Ex: Introdução às Escalas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Instrumento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="violao">Violão</SelectItem>
                      <SelectItem value="guitarra">Guitarra</SelectItem>
                      <SelectItem value="bateria">Bateria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nível</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="duracao">Duração</Label>
                <Input id="duracao" placeholder="Ex: 45 minutos" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea id="conteudo" placeholder="Descreva o conteúdo da aula..." rows={4} />
              </div>
              <Button className="w-full mt-2" onClick={() => setIsDialogOpen(false)}>
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
                <p className="text-2xl font-bold">{planosAula.length}</p>
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
                <p className="text-2xl font-bold">{avaliacoes.length}</p>
                <p className="text-xs text-muted-foreground">Avaliações</p>
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
                <p className="text-2xl font-bold">{materiais.length}</p>
                <p className="text-xs text-muted-foreground">Materiais</p>
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
                <p className="text-2xl font-bold">8.7</p>
                <p className="text-xs text-muted-foreground">Média Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="planos" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="planos">Planos de Aula</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="materiais">Material Didático</TabsTrigger>
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

          <div className="grid md:grid-cols-2 gap-4">
            {planosAula.map((plano, index) => (
              <motion.div
                key={plano.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{plano.titulo}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plano.autor}</p>
                      </div>
                      <Badge variant="outline">{plano.nivel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Instrumento</span>
                      <span className="font-medium">{plano.instrumento}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duração</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{plano.duracao}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {avaliacoes.map((avaliacao) => (
                  <div
                    key={avaliacao.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{avaliacao.aluno}</p>
                        <p className="text-sm text-muted-foreground">{avaliacao.curso}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {avaliacao.data}
                        </div>
                        {avaliacao.nota && (
                          <p className="text-lg font-bold text-primary">{avaliacao.nota}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          avaliacao.status === "concluida"
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-warning/20 text-warning border-warning/30"
                        }
                      >
                        {avaliacao.status === "concluida" ? "Concluída" : "Agendada"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {materiais.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover:border-primary/30 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{material.titulo}</h3>
                        <p className="text-sm text-muted-foreground">{material.autor}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline">{material.tipo}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {material.downloads} downloads
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Baixar Material
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
