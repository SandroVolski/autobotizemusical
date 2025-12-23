import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Music,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const students = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1234",
    instrument: "Piano",
    level: "Intermediário",
    status: "ativo",
    enrolledAt: "2024-01-15",
    nextClass: "Hoje, 09:00",
    avatar: "MS",
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 99999-5678",
    instrument: "Violão",
    level: "Iniciante",
    status: "ativo",
    enrolledAt: "2024-02-20",
    nextClass: "Amanhã, 14:00",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 99999-9012",
    instrument: "Bateria",
    level: "Avançado",
    status: "ativo",
    enrolledAt: "2023-06-10",
    nextClass: "Hoje, 11:00",
    avatar: "AC",
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    phone: "(11) 99999-3456",
    instrument: "Guitarra",
    level: "Intermediário",
    status: "inativo",
    enrolledAt: "2023-08-05",
    nextClass: "-",
    avatar: "PO",
  },
  {
    id: 5,
    name: "Carla Lima",
    email: "carla@email.com",
    phone: "(11) 99999-7890",
    instrument: "Canto",
    level: "Iniciante",
    status: "ativo",
    enrolledAt: "2024-03-01",
    nextClass: "Sexta, 10:00",
    avatar: "CL",
  },
];

export default function Alunos() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.instrument.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
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
            <p className="text-3xl font-bold text-primary">142</p>
            <p className="text-sm text-muted-foreground">Total de Alunos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">128</p>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">10</p>
            <p className="text-sm text-muted-foreground">Inativos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-secondary">+12</p>
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
                  placeholder="Buscar por nome, instrumento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline">
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
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Card variant="interactive">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold">
                    {student.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{student.name}</h3>
                      <Badge variant={student.status === "ativo" ? "success" : "outline"}>
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {student.instrument}
                      </span>
                      <span>•</span>
                      <span>{student.level}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {student.nextClass}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Aula
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
