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
  Star,
  Clock,
  Loader2,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { useProfessores, useCreateProfessor, useDeleteProfessor } from "@/hooks/useProfessores";
import { toast } from "@/hooks/use-toast";

const statusConfig = {
  ativo: { label: "Ativo", color: "bg-success/20 text-success border-success/30" },
  ferias: { label: "Férias", color: "bg-warning/20 text-warning border-warning/30" },
  inativo: { label: "Inativo", color: "bg-muted/50 text-muted-foreground border-muted" },
};

export default function Professores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProfessor, setNewProfessor] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidades: "",
    valor_hora: "",
    biografia: "",
  });

  const { data: professores, isLoading } = useProfessores();
  const createProfessorMutation = useCreateProfessor();
  const deleteProfessorMutation = useDeleteProfessor();

  const totalHoras = professores?.reduce((acc, p) => acc + (Number(p.valor_hora) || 0) * 30, 0) || 0;
  const mediaAvaliacao = professores?.length 
    ? (professores.reduce((acc, p) => acc + (Number(p.avaliacao) || 0), 0) / professores.length).toFixed(1) 
    : "0.0";

  const filteredProfessores = professores?.filter(
    (professor) =>
      professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.especialidades?.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateProfessor = () => {
    if (!newProfessor.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    createProfessorMutation.mutate({
      nome: newProfessor.nome,
      email: newProfessor.email || undefined,
      telefone: newProfessor.telefone || undefined,
      especialidades: newProfessor.especialidades ? newProfessor.especialidades.split(",").map(e => e.trim()) : [],
      valor_hora: newProfessor.valor_hora ? parseFloat(newProfessor.valor_hora) : undefined,
      biografia: newProfessor.biografia || undefined,
      status: "ativo",
    });

    setNewProfessor({ nome: "", email: "", telefone: "", especialidades: "", valor_hora: "", biografia: "" });
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
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do professor"
                  value={newProfessor.nome}
                  onChange={(e) => setNewProfessor(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@exemplo.com"
                    value={newProfessor.email}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    placeholder="(47) 99999-9999"
                    value={newProfessor.telefone}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Especialidades</Label>
                <Input 
                  placeholder="Piano, Violão, Teoria (separar por vírgula)"
                  value={newProfessor.especialidades}
                  onChange={(e) => setNewProfessor(prev => ({ ...prev, especialidades: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor por Hora (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="Ex: 80"
                  value={newProfessor.valor_hora}
                  onChange={(e) => setNewProfessor(prev => ({ ...prev, valor_hora: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="biografia">Biografia</Label>
                <Textarea 
                  id="biografia" 
                  placeholder="Breve descrição do professor..."
                  value={newProfessor.biografia}
                  onChange={(e) => setNewProfessor(prev => ({ ...prev, biografia: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleCreateProfessor}
                disabled={createProfessorMutation.isPending}
              >
                {createProfessorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
                <p className="text-2xl font-bold">{professores?.length || 0}</p>
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
                <p className="text-2xl font-bold">{professores?.filter(p => p.status === "ativo").length || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
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
                <p className="text-2xl font-bold">
                  {professores?.reduce((acc, p) => acc + (p.especialidades?.length || 0), 0) || 0}
                </p>
                <p className="text-xs text-muted-foreground">Especialidades</p>
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
      {filteredProfessores.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum professor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente outra busca" : "Cadastre seu primeiro professor"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Professor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
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
                          <span className="text-sm text-muted-foreground">
                            {Number(professor.avaliacao || 5).toFixed(1)}
                          </span>
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
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteProfessorMutation.mutate(professor.id)}
                          disabled={deleteProfessorMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {professor.especialidades && professor.especialidades.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {professor.especialidades.map((esp) => (
                        <Badge key={esp} variant="outline" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    {professor.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{professor.email}</span>
                      </div>
                    )}
                    {professor.telefone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{professor.telefone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    {professor.valor_hora && (
                      <span className="text-sm font-medium">
                        R$ {Number(professor.valor_hora).toFixed(2)}/h
                      </span>
                    )}
                    <Badge className={statusConfig[professor.status as keyof typeof statusConfig]?.color || statusConfig.ativo.color}>
                      {statusConfig[professor.status as keyof typeof statusConfig]?.label || "Ativo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
