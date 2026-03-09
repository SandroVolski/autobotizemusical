import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Download,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Music,
  Eye,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAlunos, useCreateAluno, useUpdateAluno, useDeleteAluno, type NovoAluno } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";
import { EnrollmentDialog } from "@/components/alunos/EnrollmentDialog";
import { StudentEnrollments } from "@/components/alunos/StudentEnrollments";
import { FilterPopover, type FilterValues, type FilterOption } from "@/components/ui/filter-popover";
import { exportAlunos } from "@/lib/csv-export";

const filterOptions: FilterOption[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "ativo", label: "Ativo" },
      { value: "inativo", label: "Inativo" },
    ],
  },
  {
    id: "nivel",
    label: "Nível",
    type: "select",
    options: [
      { value: "iniciante", label: "Iniciante" },
      { value: "intermediario", label: "Intermediário" },
      { value: "avancado", label: "Avançado" },
    ],
  },
];

export default function Alunos() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<string | null>(null);
  const [enrollmentAluno, setEnrollmentAluno] = useState<{ id: string; nome: string } | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [expandedAluno, setExpandedAluno] = useState<string | null>(null);
  const [newAluno, setNewAluno] = useState<NovoAluno>({
    nome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    responsavel_nome: "",
    responsavel_telefone: "",
    endereco: "",
    nivel: "iniciante",
    objetivo: "",
    observacoes: "",
  });

  const { data: alunos, isLoading } = useAlunos();
  const createAlunoMutation = useCreateAluno();
  const updateAlunoMutation = useUpdateAluno();
  const deleteAlunoMutation = useDeleteAluno();

  const filteredAlunos = alunos?.filter(aluno => {
    // Text search
    const matchesSearch = aluno.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aluno.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filters
    if (filterValues.status && aluno.status !== filterValues.status) return false;
    if (filterValues.nivel && aluno.nivel !== filterValues.nivel) return false;
    
    return matchesSearch;
  }) || [];

  const totalAlunos = alunos?.length || 0;
  const alunosAtivos = alunos?.filter(a => a.status === "ativo").length || 0;
  const alunosInativos = alunos?.filter(a => a.status === "inativo").length || 0;
  const alunosEsteMes = alunos?.filter(a => {
    if (!a.data_matricula) return false;
    const matriculaDate = new Date(a.data_matricula);
    const now = new Date();
    return matriculaDate.getMonth() === now.getMonth() && matriculaDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const handleCreateAluno = () => {
    if (!newAluno.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingAluno) {
      updateAlunoMutation.mutate({ id: editingAluno, ...newAluno }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingAluno(null);
          resetForm();
        }
      });
    } else {
      createAlunoMutation.mutate(newAluno, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const resetForm = () => {
    setNewAluno({
      nome: "",
      email: "",
      telefone: "",
      data_nascimento: "",
      responsavel_nome: "",
      responsavel_telefone: "",
      endereco: "",
      nivel: "iniciante",
      objetivo: "",
      observacoes: "",
    });
  };

  const handleEdit = (aluno: typeof alunos extends (infer T)[] | undefined ? T : never) => {
    setEditingAluno(aluno.id);
    setNewAluno({
      nome: aluno.nome,
      email: aluno.email || "",
      telefone: aluno.telefone || "",
      data_nascimento: aluno.data_nascimento || "",
      responsavel_nome: aluno.responsavel_nome || "",
      responsavel_telefone: aluno.responsavel_telefone || "",
      endereco: aluno.endereco || "",
      nivel: aluno.nivel || "iniciante",
      objetivo: aluno.objetivo || "",
      observacoes: aluno.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    if (!filteredAlunos || filteredAlunos.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Adicione alunos antes de exportar",
        variant: "destructive",
      });
      return;
    }
    exportAlunos(filteredAlunos);
    toast({
      title: "Exportação concluída",
      description: `${filteredAlunos.length} alunos exportados`,
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Gestão de Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os alunos da escola
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingAluno(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAluno ? "Editar Aluno" : "Cadastrar Novo Aluno"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do aluno"
                  value={newAluno.nome}
                  onChange={(e) => setNewAluno(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newAluno.email}
                    onChange={(e) => setNewAluno(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    placeholder="(11) 99999-9999"
                    value={newAluno.telefone}
                    onChange={(e) => setNewAluno(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input 
                    id="data_nascimento" 
                    type="date"
                    value={newAluno.data_nascimento}
                    onChange={(e) => setNewAluno(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select
                    value={newAluno.nivel}
                    onValueChange={(value) => setNewAluno(prev => ({ ...prev, nivel: value }))}
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
                  <Label htmlFor="responsavel_nome">Nome do Responsável</Label>
                  <Input 
                    id="responsavel_nome" 
                    placeholder="Nome do responsável (se menor)"
                    value={newAluno.responsavel_nome}
                    onChange={(e) => setNewAluno(prev => ({ ...prev, responsavel_nome: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsavel_telefone">Telefone do Responsável</Label>
                  <Input 
                    id="responsavel_telefone" 
                    placeholder="(11) 99999-9999"
                    value={newAluno.responsavel_telefone}
                    onChange={(e) => setNewAluno(prev => ({ ...prev, responsavel_telefone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input 
                  id="endereco" 
                  placeholder="Endereço completo"
                  value={newAluno.endereco}
                  onChange={(e) => setNewAluno(prev => ({ ...prev, endereco: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Input 
                  id="objetivo" 
                  placeholder="Ex: Aprender a tocar piano"
                  value={newAluno.objetivo}
                  onChange={(e) => setNewAluno(prev => ({ ...prev, objetivo: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  placeholder="Observações adicionais..."
                  value={newAluno.observacoes}
                  onChange={(e) => setNewAluno(prev => ({ ...prev, observacoes: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleCreateAluno}
                disabled={createAlunoMutation.isPending || updateAlunoMutation.isPending}
              >
                {(createAlunoMutation.isPending || updateAlunoMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingAluno ? "Salvar Alterações" : "Cadastrar Aluno"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{totalAlunos}</p>
            <p className="text-sm text-muted-foreground">Total de Alunos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">{alunosAtivos}</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">{alunosInativos}</p>
            <p className="text-sm text-muted-foreground">Inativos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-secondary">+{alunosEsteMes}</p>
            <p className="text-sm text-muted-foreground">Este Mês</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <FilterPopover 
                  filters={filterOptions} 
                  values={filterValues} 
                  onChange={setFilterValues} 
                />
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {filteredAlunos.length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Tente outra busca" : "Cadastre seu primeiro aluno"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Aluno
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAlunos.map((aluno, index) => (
            <motion.div
              key={aluno.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Collapsible
                open={expandedAluno === aluno.id}
                onOpenChange={(open) => setExpandedAluno(open ? aluno.id : null)}
              >
                <Card variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/alunos/${aluno.id}`)}>
                      {/* Avatar */}
                      {aluno.foto_url ? (
                        <img
                          src={aluno.foto_url}
                          alt={aluno.nome}
                          className="w-12 h-12 rounded-full object-cover border border-primary/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold">
                          {getInitials(aluno.nome)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{aluno.nome}</h3>
                          <Badge variant={aluno.status === "ativo" ? "success" : "outline"}>
                            {aluno.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {aluno.nivel || "Iniciante"}
                          </span>
                          {aluno.email && (
                            <>
                              <span>•</span>
                              <span className="truncate">{aluno.email}</span>
                            </>
                          )}
                          {aluno.data_matricula && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Desde {new Date(aluno.data_matricula).toLocaleDateString("pt-BR")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="hidden md:flex items-center gap-4">
                        {aluno.telefone && (
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <a href={`https://wa.me/${aluno.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <Phone className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {aluno.email && (
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                            <a href={`mailto:${aluno.email}`}>
                              <Mail className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Expand Enrollments */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            {expandedAluno === aluno.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/alunos/${aluno.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEnrollmentAluno({ id: aluno.id, nome: aluno.nome })}>
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Matricular em Curso
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(aluno)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/agenda")}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendar Aula
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteAlunoMutation.mutate(aluno.id)}
                            disabled={deleteAlunoMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Enrollments Section */}
                    <CollapsibleContent className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          Matrículas
                        </h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEnrollmentAluno({ id: aluno.id, nome: aluno.nome })}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nova Matrícula
                        </Button>
                      </div>
                      <StudentEnrollments alunoId={aluno.id} />
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Enrollment Dialog */}
      {enrollmentAluno && (
        <EnrollmentDialog
          alunoId={enrollmentAluno.id}
          alunoNome={enrollmentAluno.nome}
          open={!!enrollmentAluno}
          onOpenChange={(open) => !open && setEnrollmentAluno(null)}
        />
      )}
    </div>
  );
}
