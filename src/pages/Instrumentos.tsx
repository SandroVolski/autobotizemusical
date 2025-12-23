import { useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Package,
  Wrench,
  CheckCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstrumentos } from "@/hooks/useInstrumentos";
import { toast } from "@/hooks/use-toast";

const statusConfig = {
  disponivel: { label: "Disponível", color: "bg-success/20 text-success border-success/30" },
  emprestado: { label: "Emprestado", color: "bg-warning/20 text-warning border-warning/30" },
  manutencao: { label: "Em Manutenção", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Instrumentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInstrumento, setNewInstrumento] = useState({
    nome: "",
    tipo: "",
    localizacao: "",
    valor_patrimonio: "",
    marca: "",
    modelo: "",
  });

  const { instrumentos, isLoading, createInstrumento, deleteInstrumento, isCreating, isDeleting } = useInstrumentos();

  const stats = {
    total: instrumentos?.length || 0,
    disponiveis: instrumentos?.filter(i => i.status === "disponivel").length || 0,
    emprestados: instrumentos?.filter(i => i.status === "emprestado").length || 0,
    manutencao: instrumentos?.filter(i => i.status === "manutencao").length || 0,
  };

  const filteredInstrumentos = instrumentos?.filter(
    (instrumento) =>
      instrumento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrumento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateInstrumento = () => {
    if (!newInstrumento.nome || !newInstrumento.tipo) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createInstrumento({
      nome: newInstrumento.nome,
      tipo: newInstrumento.tipo,
      localizacao: newInstrumento.localizacao || null,
      valor_patrimonio: newInstrumento.valor_patrimonio ? parseFloat(newInstrumento.valor_patrimonio) : null,
      marca: newInstrumento.marca || null,
      modelo: newInstrumento.modelo || null,
      status: "disponivel",
    });

    setNewInstrumento({ nome: "", tipo: "", localizacao: "", valor_patrimonio: "", marca: "", modelo: "" });
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
          <h1 className="text-2xl font-bold text-foreground">Gestão de Instrumentos</h1>
          <p className="text-muted-foreground">
            Controle o patrimônio e empréstimos de instrumentos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Instrumento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Instrumento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Instrumento *</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Piano Yamaha C3"
                  value={newInstrumento.nome}
                  onChange={(e) => setNewInstrumento(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={newInstrumento.tipo}
                    onValueChange={(value) => setNewInstrumento(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piano">Piano</SelectItem>
                      <SelectItem value="Violão">Violão</SelectItem>
                      <SelectItem value="Guitarra">Guitarra</SelectItem>
                      <SelectItem value="Bateria">Bateria</SelectItem>
                      <SelectItem value="Teclado">Teclado</SelectItem>
                      <SelectItem value="Violino">Violino</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Saxofone">Saxofone</SelectItem>
                      <SelectItem value="Flauta">Flauta</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Select
                    value={newInstrumento.localizacao}
                    onValueChange={(value) => setNewInstrumento(prev => ({ ...prev, localizacao: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a sala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sala 1">Sala 1</SelectItem>
                      <SelectItem value="Sala 2">Sala 2</SelectItem>
                      <SelectItem value="Sala 3">Sala 3</SelectItem>
                      <SelectItem value="Sala 4">Sala 4</SelectItem>
                      <SelectItem value="Sala 5">Sala 5</SelectItem>
                      <SelectItem value="Depósito">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input 
                    id="marca" 
                    placeholder="Ex: Yamaha"
                    value={newInstrumento.marca}
                    onChange={(e) => setNewInstrumento(prev => ({ ...prev, marca: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input 
                    id="modelo" 
                    placeholder="Ex: C3"
                    value={newInstrumento.modelo}
                    onChange={(e) => setNewInstrumento(prev => ({ ...prev, modelo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor Patrimonial (R$)</Label>
                <Input 
                  id="valor" 
                  type="number" 
                  placeholder="0,00"
                  value={newInstrumento.valor_patrimonio}
                  onChange={(e) => setNewInstrumento(prev => ({ ...prev, valor_patrimonio: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={handleCreateInstrumento}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Cadastrar Instrumento
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
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.disponiveis}</p>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Music className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.emprestados}</p>
                <p className="text-xs text-muted-foreground">Emprestados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Wrench className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.manutencao}</p>
                <p className="text-xs text-muted-foreground">Manutenção</p>
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
            placeholder="Buscar instrumentos..."
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

      {/* Instruments Grid */}
      {filteredInstrumentos.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum instrumento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente outra busca" : "Cadastre seu primeiro instrumento"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Instrumento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstrumentos.map((instrumento, index) => (
            <motion.div
              key={instrumento.id}
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
                        <CardTitle className="text-base">{instrumento.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{instrumento.tipo}</p>
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
                        <DropdownMenuItem>Emprestar</DropdownMenuItem>
                        <DropdownMenuItem>Registrar Manutenção</DropdownMenuItem>
                        <DropdownMenuItem>Histórico</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteInstrumento(instrumento.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={statusConfig[instrumento.status as keyof typeof statusConfig]?.color || statusConfig.disponivel.color}>
                      {statusConfig[instrumento.status as keyof typeof statusConfig]?.label || "Disponível"}
                    </Badge>
                  </div>
                  {instrumento.localizacao && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Localização</span>
                      <span className="text-sm font-medium">{instrumento.localizacao}</span>
                    </div>
                  )}
                  {instrumento.marca && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Marca</span>
                      <span className="text-sm font-medium">{instrumento.marca} {instrumento.modelo}</span>
                    </div>
                  )}
                  {instrumento.valor_patrimonio && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor</span>
                      <span className="text-sm font-medium">
                        {Number(instrumento.valor_patrimonio).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
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
