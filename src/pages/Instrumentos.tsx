import { useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Plus,
  Search,
  Filter,
  Guitar,
  Piano,
  Drum,
  MoreVertical,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
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

const instrumentos = [
  { 
    id: 1, 
    nome: "Piano Yamaha C3", 
    tipo: "Piano", 
    status: "disponivel", 
    localizacao: "Sala 1",
    valorPatrimonio: 45000,
    ultimaManutencao: "2024-01-15",
    emprestadoPara: null,
  },
  { 
    id: 2, 
    nome: "Violão Giannini", 
    tipo: "Violão", 
    status: "emprestado", 
    localizacao: "Sala 3",
    valorPatrimonio: 1200,
    ultimaManutencao: "2024-02-20",
    emprestadoPara: "João Silva",
  },
  { 
    id: 3, 
    nome: "Bateria Pearl Export", 
    tipo: "Bateria", 
    status: "manutencao", 
    localizacao: "Sala 5",
    valorPatrimonio: 8500,
    ultimaManutencao: "2024-03-10",
    emprestadoPara: null,
  },
  { 
    id: 4, 
    nome: "Teclado Korg PA700", 
    tipo: "Teclado", 
    status: "disponivel", 
    localizacao: "Sala 2",
    valorPatrimonio: 12000,
    ultimaManutencao: "2024-01-05",
    emprestadoPara: null,
  },
  { 
    id: 5, 
    nome: "Violino Stradivarius Réplica", 
    tipo: "Violino", 
    status: "disponivel", 
    localizacao: "Sala 4",
    valorPatrimonio: 3500,
    ultimaManutencao: "2024-02-28",
    emprestadoPara: null,
  },
  { 
    id: 6, 
    nome: "Guitarra Fender Stratocaster", 
    tipo: "Guitarra", 
    status: "emprestado", 
    localizacao: "Sala 3",
    valorPatrimonio: 7800,
    ultimaManutencao: "2024-01-22",
    emprestadoPara: "Maria Santos",
  },
];

const statusConfig = {
  disponivel: { label: "Disponível", color: "bg-success/20 text-success border-success/30" },
  emprestado: { label: "Emprestado", color: "bg-warning/20 text-warning border-warning/30" },
  manutencao: { label: "Em Manutenção", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Instrumentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stats = {
    total: instrumentos.length,
    disponiveis: instrumentos.filter(i => i.status === "disponivel").length,
    emprestados: instrumentos.filter(i => i.status === "emprestado").length,
    manutencao: instrumentos.filter(i => i.status === "manutencao").length,
  };

  const filteredInstrumentos = instrumentos.filter(
    (instrumento) =>
      instrumento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrumento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Label htmlFor="nome">Nome do Instrumento</Label>
                <Input id="nome" placeholder="Ex: Piano Yamaha C3" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano">Piano</SelectItem>
                    <SelectItem value="violao">Violão</SelectItem>
                    <SelectItem value="guitarra">Guitarra</SelectItem>
                    <SelectItem value="bateria">Bateria</SelectItem>
                    <SelectItem value="teclado">Teclado</SelectItem>
                    <SelectItem value="violino">Violino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sala1">Sala 1</SelectItem>
                    <SelectItem value="sala2">Sala 2</SelectItem>
                    <SelectItem value="sala3">Sala 3</SelectItem>
                    <SelectItem value="sala4">Sala 4</SelectItem>
                    <SelectItem value="sala5">Sala 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor Patrimonial (R$)</Label>
                <Input id="valor" type="number" placeholder="0,00" />
              </div>
              <Button className="w-full mt-2" onClick={() => setIsDialogOpen(false)}>
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
                      <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={statusConfig[instrumento.status as keyof typeof statusConfig].color}>
                    {statusConfig[instrumento.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Localização</span>
                  <span className="text-sm font-medium">{instrumento.localizacao}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor</span>
                  <span className="text-sm font-medium">
                    {instrumento.valorPatrimonio.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                {instrumento.emprestadoPara && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Emprestado para</span>
                    <span className="text-sm font-medium text-warning">{instrumento.emprestadoPara}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
