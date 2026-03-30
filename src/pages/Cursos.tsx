import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Search, Clock, Users, MoreVertical, GraduationCap, Music, DollarSign, Loader2, Trash2, Download, Copy, Edit, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCursos, useCreateCurso, useUpdateCurso, useDeleteCurso, Curso } from "@/hooks/useCursos";
import { useMatriculas } from "@/hooks/useMatriculas";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "@/hooks/use-toast";
import { FilterPopover, type FilterValues, type FilterOption } from "@/components/ui/filter-popover";
import { exportCursos } from "@/lib/csv-export";

const nivelConfig = {
  iniciante: "bg-success/20 text-success border-success/30",
  intermediario: "bg-warning/20 text-warning border-warning/30",
  avancado: "bg-primary/20 text-primary border-primary/30",
};

const filterOptions: FilterOption[] = [
  {
    id: "nivel", label: "Nível", type: "select",
    options: [
      { value: "iniciante", label: "Iniciante" },
      { value: "intermediario", label: "Intermediário" },
      { value: "avancado", label: "Avançado" },
    ],
  },
  {
    id: "instrumento", label: "Instrumento", type: "select",
    options: [
      { value: "Piano", label: "Piano" },
      { value: "Violão", label: "Violão" },
      { value: "Guitarra", label: "Guitarra" },
      { value: "Bateria", label: "Bateria" },
      { value: "Canto", label: "Canto" },
      { value: "Violino", label: "Violino" },
    ],
  },
  {
    id: "status", label: "Status", type: "select",
    options: [
      { value: "ativo", label: "Ativo" },
      { value: "inativo", label: "Inativo" },
    ],
  },
];

function formatCargaHoraria(duracao: string, frequencia: string): string {
  if (!duracao) return "";
  return `${duracao}/${frequencia === "semanal" ? "semana" : frequencia === "mensal" ? "mês" : "aula"}`;
}

function parseCargaHoraria(ch: string | null): { tempo: string; frequencia: string } {
  if (!ch) return { tempo: "", frequencia: "semanal" };
  const parts = ch.split("/");
  const tempo = parts[0] || "";
  const freq = parts[1] === "mês" ? "mensal" : parts[1] === "aula" ? "avulso" : "semanal";
  return { tempo, frequencia: freq };
}

export default function Cursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "", instrumento: "", nivel: "", duracao: "",
    carga_horaria_tempo: "", carga_horaria_frequencia: "semanal",
    valor_mensal: "", descricao: "", status: "ativo",
  });

  // View students state
  const [viewStudentsOpen, setViewStudentsOpen] = useState(false);
  const [viewStudentsCursoId, setViewStudentsCursoId] = useState<string | null>(null);
  const [viewStudentsCursoNome, setViewStudentsCursoNome] = useState("");

  // Conteúdo programático state
  const [conteudoOpen, setConteudoOpen] = useState(false);
  const [conteudoCurso, setConteudoCurso] = useState<Curso | null>(null);

  const [newCurso, setNewCurso] = useState({
    nome: "", instrumento: "", nivel: "", duracao: "",
    carga_horaria_tempo: "", carga_horaria_frequencia: "semanal",
    valor_mensal: "", descricao: "",
  });

  const { data: cursos, isLoading } = useCursos();
  const { data: matriculas } = useMatriculas();
  const { data: alunos } = useAlunos();
  const createCursoMutation = useCreateCurso();
  const updateCursoMutation = useUpdateCurso();
  const deleteCursoMutation = useDeleteCurso();

  // Count students per course
  const alunosPorCurso = useMemo(() => {
    const map = new Map<string, number>();
    matriculas?.filter(m => m.status === "ativo").forEach(m => {
      map.set(m.curso_id, (map.get(m.curso_id) || 0) + 1);
    });
    return map;
  }, [matriculas]);

  const totalAlunos = useMemo(() => {
    const uniqueAlunos = new Set(matriculas?.filter(m => m.status === "ativo").map(m => m.aluno_id));
    return uniqueAlunos.size;
  }, [matriculas]);

  const receitaMensal = cursos?.reduce((acc, curso) => acc + (Number(curso.valor_mensal) || 0), 0) || 0;

  const filteredCursos = useMemo(() => {
    if (!cursos) return [];
    return cursos.filter((curso) => {
      const matchesSearch = curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curso.instrumento?.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filterValues.nivel && curso.nivel !== filterValues.nivel) return false;
      if (filterValues.instrumento && curso.instrumento !== filterValues.instrumento) return false;
      if (filterValues.status && curso.status !== filterValues.status) return false;
      return matchesSearch;
    });
  }, [cursos, searchTerm, filterValues]);

  // Students for selected course
  const studentsForCourse = useMemo(() => {
    if (!viewStudentsCursoId || !matriculas || !alunos) return [];
    const alunoIds = matriculas
      .filter(m => m.curso_id === viewStudentsCursoId && m.status === "ativo")
      .map(m => m.aluno_id);
    return alunos.filter(a => alunoIds.includes(a.id));
  }, [viewStudentsCursoId, matriculas, alunos]);

  const handleCreateCurso = () => {
    if (!newCurso.nome || !newCurso.instrumento) {
      toast({ title: "Erro", description: "Nome e instrumento são obrigatórios", variant: "destructive" });
      return;
    }

    const cargaHoraria = newCurso.carga_horaria_tempo
      ? formatCargaHoraria(newCurso.carga_horaria_tempo, newCurso.carga_horaria_frequencia)
      : undefined;

    createCursoMutation.mutate({
      nome: newCurso.nome,
      instrumento: newCurso.instrumento,
      nivel: newCurso.nivel || "iniciante",
      duracao: newCurso.duracao || undefined,
      carga_horaria: cargaHoraria,
      valor_mensal: newCurso.valor_mensal ? parseFloat(newCurso.valor_mensal) : undefined,
      descricao: newCurso.descricao || undefined,
      status: "ativo",
    });

    setNewCurso({ nome: "", instrumento: "", nivel: "", duracao: "", carga_horaria_tempo: "", carga_horaria_frequencia: "semanal", valor_mensal: "", descricao: "" });
    setIsDialogOpen(false);
  };

  const handleEditClick = (curso: Curso) => {
    setEditingCurso(curso);
    const ch = parseCargaHoraria(curso.carga_horaria);
    setEditForm({
      nome: curso.nome,
      instrumento: curso.instrumento || "",
      nivel: curso.nivel || "iniciante",
      duracao: curso.duracao || "",
      carga_horaria_tempo: ch.tempo,
      carga_horaria_frequencia: ch.frequencia,
      valor_mensal: curso.valor_mensal ? String(curso.valor_mensal) : "",
      descricao: curso.descricao || "",
      status: curso.status || "ativo",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCurso = () => {
    if (!editingCurso) return;
    if (!editForm.nome || !editForm.instrumento) {
      toast({ title: "Erro", description: "Nome e instrumento são obrigatórios", variant: "destructive" });
      return;
    }

    const cargaHoraria = editForm.carga_horaria_tempo
      ? formatCargaHoraria(editForm.carga_horaria_tempo, editForm.carga_horaria_frequencia)
      : null;

    updateCursoMutation.mutate({
      id: editingCurso.id,
      nome: editForm.nome,
      instrumento: editForm.instrumento,
      nivel: editForm.nivel || "iniciante",
      duracao: editForm.duracao || null,
      carga_horaria: cargaHoraria,
      valor_mensal: editForm.valor_mensal ? parseFloat(editForm.valor_mensal) : null,
      descricao: editForm.descricao || null,
      status: editForm.status,
    }, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingCurso(null);
      },
    });
  };

  const handleDuplicate = (curso: Curso) => {
    createCursoMutation.mutate({
      nome: `${curso.nome} (Cópia)`,
      instrumento: curso.instrumento || undefined,
      nivel: curso.nivel || "iniciante",
      duracao: curso.duracao || undefined,
      carga_horaria: curso.carga_horaria || undefined,
      valor_mensal: curso.valor_mensal ? Number(curso.valor_mensal) : undefined,
      descricao: curso.descricao || undefined,
      status: "ativo",
    });
  };

  const handleViewStudents = (curso: Curso) => {
    setViewStudentsCursoId(curso.id);
    setViewStudentsCursoNome(curso.nome);
    setViewStudentsOpen(true);
  };

  const handleViewConteudo = (curso: Curso) => {
    setConteudoCurso(curso);
    setConteudoOpen(true);
  };

  const handleExport = () => {
    if (!filteredCursos || filteredCursos.length === 0) {
      toast({ title: "Nenhum dado para exportar", description: "Adicione cursos antes de exportar", variant: "destructive" });
      return;
    }
    exportCursos(filteredCursos);
    toast({ title: "Exportação concluída", description: `${filteredCursos.length} cursos exportados` });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Cursos</h1>
          <p className="text-muted-foreground">Gerencie cursos, workshops e aulas avulsas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Novo Curso</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Curso</DialogTitle>
                <DialogDescription>Preencha os dados do novo curso</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Curso *</Label>
                  <Input id="nome" placeholder="Ex: Piano Intermediário" value={newCurso.nome}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, nome: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Instrumento *</Label>
                    <Select value={newCurso.instrumento} onValueChange={(v) => setNewCurso(prev => ({ ...prev, instrumento: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                    <Label>Nível</Label>
                    <Select value={newCurso.nivel} onValueChange={(v) => setNewCurso(prev => ({ ...prev, nivel: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Duração do Curso</Label>
                  <Input placeholder="Ex: 6 meses" value={newCurso.duracao}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, duracao: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Carga Horária</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ex: 1h" value={newCurso.carga_horaria_tempo}
                      onChange={(e) => setNewCurso(prev => ({ ...prev, carga_horaria_tempo: e.target.value }))}
                      className="flex-1" />
                    <Select value={newCurso.carga_horaria_frequencia}
                      onValueChange={(v) => setNewCurso(prev => ({ ...prev, carga_horaria_frequencia: v }))}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">por semana</SelectItem>
                        <SelectItem value="mensal">por mês</SelectItem>
                        <SelectItem value="avulso">por aula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCurso.carga_horaria_tempo && (
                    <p className="text-xs text-muted-foreground">
                      Resultado: {formatCargaHoraria(newCurso.carga_horaria_tempo, newCurso.carga_horaria_frequencia)}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Valor Mensal (R$)</Label>
                  <Input type="number" placeholder="0,00" value={newCurso.valor_mensal}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, valor_mensal: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva o conteúdo programático..." value={newCurso.descricao}
                    onChange={(e) => setNewCurso(prev => ({ ...prev, descricao: e.target.value }))} />
                </div>
                <Button className="w-full mt-2" onClick={handleCreateCurso} disabled={createCursoMutation.isPending}>
                  {createCursoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Curso
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20"><BookOpen className="w-5 h-5 text-primary" /></div>
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
              <div className="p-2 rounded-lg bg-secondary/20"><Users className="w-5 h-5 text-secondary" /></div>
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
              <div className="p-2 rounded-lg bg-success/20 shrink-0"><DollarSign className="w-5 h-5 text-success" /></div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{receitaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                <p className="text-xs text-muted-foreground">Valor Total/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20"><GraduationCap className="w-5 h-5 text-warning" /></div>
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
          <Input placeholder="Buscar cursos..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <FilterPopover filters={filterOptions} values={filterValues} onChange={setFilterValues} />
      </div>

      {/* Courses Grid */}
      {filteredCursos.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mb-4">{searchTerm ? "Tente outra busca" : "Cadastre seu primeiro curso"}</p>
            {!searchTerm && <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Curso</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCursos.map((curso, index) => (
            <motion.div key={curso.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="glass-card hover:border-primary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20"><Music className="w-5 h-5 text-primary" /></div>
                      <div>
                        <CardTitle className="text-base">{curso.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{curso.instrumento}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(curso)}>
                          <Edit className="w-4 h-4 mr-2" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStudents(curso)}>
                          <Users className="w-4 h-4 mr-2" />Ver Alunos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewConteudo(curso)}>
                          <FileText className="w-4 h-4 mr-2" />Conteúdo Programático
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(curso)}>
                          <Copy className="w-4 h-4 mr-2" />Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCursoMutation.mutate(curso.id)} disabled={deleteCursoMutation.isPending}>
                          <Trash2 className="w-4 h-4 mr-2" />Excluir
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alunos</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{alunosPorCurso.get(curso.id) || 0}</span>
                    </div>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>Atualize os dados do curso</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>Nome do Curso *</Label>
              <Input value={editForm.nome} onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Instrumento *</Label>
                <Select value={editForm.instrumento} onValueChange={(v) => setEditForm(prev => ({ ...prev, instrumento: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                <Label>Nível</Label>
                <Select value={editForm.nivel} onValueChange={(v) => setEditForm(prev => ({ ...prev, nivel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Duração do Curso</Label>
              <Input placeholder="Ex: 6 meses" value={editForm.duracao}
                onChange={(e) => setEditForm(prev => ({ ...prev, duracao: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Carga Horária</Label>
              <div className="flex gap-2">
                <Input placeholder="Ex: 1h" value={editForm.carga_horaria_tempo}
                  onChange={(e) => setEditForm(prev => ({ ...prev, carga_horaria_tempo: e.target.value }))}
                  className="flex-1" />
                <Select value={editForm.carga_horaria_frequencia}
                  onValueChange={(v) => setEditForm(prev => ({ ...prev, carga_horaria_frequencia: v }))}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">por semana</SelectItem>
                    <SelectItem value="mensal">por mês</SelectItem>
                    <SelectItem value="avulso">por aula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Valor Mensal (R$)</Label>
              <Input type="number" placeholder="0,00" value={editForm.valor_mensal}
                onChange={(e) => setEditForm(prev => ({ ...prev, valor_mensal: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o conteúdo programático..." value={editForm.descricao}
                onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))} />
            </div>
            <Button className="w-full mt-2" onClick={handleUpdateCurso} disabled={updateCursoMutation.isPending}>
              {updateCursoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={viewStudentsOpen} onOpenChange={setViewStudentsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alunos - {viewStudentsCursoNome}</DialogTitle>
            <DialogDescription>Alunos matriculados neste curso</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {studentsForCourse.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum aluno matriculado neste curso</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {studentsForCourse.map(aluno => (
                  <div key={aluno.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-sm">{aluno.nome}</p>
                      <p className="text-xs text-muted-foreground">{aluno.email || aluno.telefone || "Sem contato"}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {aluno.status || "ativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {studentsForCourse.length} aluno{studentsForCourse.length !== 1 ? "s" : ""} matriculado{studentsForCourse.length !== 1 ? "s" : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conteúdo Programático Dialog */}
      <Dialog open={conteudoOpen} onOpenChange={setConteudoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Conteúdo Programático</DialogTitle>
            <DialogDescription>{conteudoCurso?.nome}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Instrumento</p>
                <p className="font-medium text-sm">{conteudoCurso?.instrumento || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Nível</p>
                <p className="font-medium text-sm capitalize">{conteudoCurso?.nivel || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="font-medium text-sm">{conteudoCurso?.duracao || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Carga Horária</p>
                <p className="font-medium text-sm">{conteudoCurso?.carga_horaria || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Descrição / Ementa</p>
              <div className="p-3 rounded-lg bg-muted/50 border border-border min-h-[100px]">
                <p className="text-sm whitespace-pre-wrap">
                  {conteudoCurso?.descricao || "Nenhuma descrição cadastrada. Edite o curso para adicionar o conteúdo programático."}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
