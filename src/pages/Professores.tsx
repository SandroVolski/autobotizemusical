import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCog,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Music,
  Calendar,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const professores = [
  {
    id: 1,
    nome: "Carlos Mendes",
    email: "carlos@escola.com",
    telefone: "(47) 99999-1111",
    especialidades: ["Piano", "Teclado"],
    alunos: 28,
    horasSemanais: 32,
    avaliacao: 4.9,
    status: "ativo",
  },
  {
    id: 2,
    nome: "Ana Paula Costa",
    email: "ana@escola.com",
    telefone: "(47) 99999-2222",
    especialidades: ["Violão", "Ukulele"],
    alunos: 24,
    horasSemanais: 28,
    avaliacao: 4.8,
    status: "ativo",
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    email: "pedro@escola.com",
    telefone: "(47) 99999-3333",
    especialidades: ["Bateria", "Percussão"],
    alunos: 18,
    horasSemanais: 24,
    avaliacao: 4.7,
    status: "ativo",
  },
  {
    id: 4,
    nome: "Marina Silva",
    email: "marina@escola.com",
    telefone: "(47) 99999-4444",
    especialidades: ["Guitarra", "Baixo"],
    alunos: 22,
    horasSemanais: 30,
    avaliacao: 4.9,
    status: "ativo",
  },
  {
    id: 5,
    nome: "Roberto Santos",
    email: "roberto@escola.com",
    telefone: "(47) 99999-5555",
    especialidades: ["Canto", "Técnica Vocal"],
    alunos: 20,
    horasSemanais: 26,
    avaliacao: 4.6,
    status: "ferias",
  },
  {
    id: 6,
    nome: "Fernanda Lima",
    email: "fernanda@escola.com",
    telefone: "(47) 99999-6666",
    especialidades: ["Violino", "Viola"],
    alunos: 15,
    horasSemanais: 20,
    avaliacao: 4.8,
    status: "ativo",
  },
];

const statusConfig = {
  ativo: { label: "Ativo", color: "bg-success/20 text-success border-success/30" },
  ferias: { label: "Férias", color: "bg-warning/20 text-warning border-warning/30" },
  inativo: { label: "Inativo", color: "bg-muted/50 text-muted-foreground border-muted" },
};

export default function Professores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalAlunos = professores.reduce((acc, p) => acc + p.alunos, 0);
  const totalHoras = professores.reduce((acc, p) => acc + p.horasSemanais, 0);
  const mediaAvaliacao = (professores.reduce((acc, p) => acc + p.avaliacao, 0) / professores.length).toFixed(1);

  const filteredProfessores = professores.filter(
    (professor) =>
      professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.especialidades.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-foreground">Gestão de Professores</h1>
          <p className="text-muted-foreground">
            Gerencie professores, especialidades e disponibilidade
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Professor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Nome do professor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(47) 99999-9999" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Especialidades</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os instrumentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano">Piano</SelectItem>
                    <SelectItem value="violao">Violão</SelectItem>
                    <SelectItem value="guitarra">Guitarra</SelectItem>
                    <SelectItem value="bateria">Bateria</SelectItem>
                    <SelectItem value="canto">Canto</SelectItem>
                    <SelectItem value="violino">Violino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="horas">Horas Semanais Disponíveis</Label>
                <Input id="horas" type="number" placeholder="Ex: 30" />
              </div>
              <Button className="w-full mt-2" onClick={() => setIsDialogOpen(false)}>
                Cadastrar Professor
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
                <UserCog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{professores.length}</p>
                <p className="text-xs text-muted-foreground">Professores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Music className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAlunos}</p>
                <p className="text-xs text-muted-foreground">Alunos Atendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHoras}h</p>
                <p className="text-xs text-muted-foreground">Horas/Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mediaAvaliacao}</p>
                <p className="text-xs text-muted-foreground">Avaliação Média</p>
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
            placeholder="Buscar professores..."
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

      {/* Professors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfessores.map((professor, index) => (
          <motion.div
            key={professor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card hover:border-primary/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {professor.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{professor.nome}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-sm text-muted-foreground">{professor.avaliacao}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                      <DropdownMenuItem>Relatório</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {professor.especialidades.map((esp) => (
                    <Badge key={esp} variant="outline" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{professor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{professor.telefone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Music className="w-3 h-3 text-muted-foreground" />
                      <span>{professor.alunos} alunos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{professor.horasSemanais}h/sem</span>
                    </div>
                  </div>
                  <Badge className={statusConfig[professor.status as keyof typeof statusConfig].color}>
                    {statusConfig[professor.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
