import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  Bell,
  Mail,
  Phone,
  Users,
  Plus,
  MoreVertical,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

const conversas = [
  {
    id: 1,
    nome: "João Silva",
    mensagem: "Olá, gostaria de remarcar minha aula de amanhã",
    hora: "14:30",
    naoLida: true,
    tipo: "aluno",
  },
  {
    id: 2,
    nome: "Maria Santos",
    mensagem: "Obrigada pela aula de hoje, foi muito produtiva!",
    hora: "12:15",
    naoLida: false,
    tipo: "aluno",
  },
  {
    id: 3,
    nome: "Prof. Carlos",
    mensagem: "Preciso atualizar minha disponibilidade para a próxima semana",
    hora: "11:00",
    naoLida: true,
    tipo: "professor",
  },
  {
    id: 4,
    nome: "Ana Costa",
    mensagem: "Pode me enviar a partitura da última aula?",
    hora: "Ontem",
    naoLida: false,
    tipo: "aluno",
  },
  {
    id: 5,
    nome: "Pedro Oliveira",
    mensagem: "Confirmado para a apresentação de sábado!",
    hora: "Ontem",
    naoLida: false,
    tipo: "aluno",
  },
];

const avisos = [
  {
    id: 1,
    titulo: "Recesso de Final de Ano",
    mensagem: "A escola estará em recesso de 23/12 a 03/01",
    data: "15/06/2024",
    destinatarios: "Todos",
  },
  {
    id: 2,
    titulo: "Apresentação de Alunos",
    mensagem: "Dia 20/06 às 19h teremos a apresentação semestral",
    data: "10/06/2024",
    destinatarios: "Todos",
  },
  {
    id: 3,
    titulo: "Novo Material Didático",
    mensagem: "Apostilas atualizadas disponíveis para download",
    data: "05/06/2024",
    destinatarios: "Alunos",
  },
];

const mensagensChat = [
  { id: 1, remetente: "João Silva", mensagem: "Olá, boa tarde!", hora: "14:28", proprio: false },
  { id: 2, remetente: "Você", mensagem: "Olá João! Como posso ajudar?", hora: "14:29", proprio: true },
  { id: 3, remetente: "João Silva", mensagem: "Gostaria de remarcar minha aula de amanhã", hora: "14:30", proprio: false },
  { id: 4, remetente: "João Silva", mensagem: "Tenho um compromisso no horário", hora: "14:30", proprio: false },
];

export default function Comunicacao() {
  const [searchTerm, setSearchTerm] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState(conversas[0]);
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
          <h1 className="text-2xl font-bold text-foreground">Comunicação</h1>
          <p className="text-muted-foreground">
            Mensagens, avisos e notificações
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Bell className="w-4 h-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enviar Aviso</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" placeholder="Título do aviso" />
              </div>
              <div className="grid gap-2">
                <Label>Destinatários</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="alunos">Apenas Alunos</SelectItem>
                    <SelectItem value="professores">Apenas Professores</SelectItem>
                    <SelectItem value="turma">Turma Específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea id="mensagem" placeholder="Digite a mensagem..." rows={4} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar por E-mail
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Enviar por WhatsApp
                </Button>
              </div>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Enviar Aviso
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
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversas.filter(c => c.naoLida).length}</p>
                <p className="text-xs text-muted-foreground">Não Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avisos.length}</p>
                <p className="text-xs text-muted-foreground">Avisos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Mail className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">E-mails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Phone className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">WhatsApp Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mensagens" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="mensagens" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4 h-[600px]">
            {/* Lista de Conversas */}
            <Card className="glass-card lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto max-h-[500px]">
                {conversas.map((conversa) => (
                  <div
                    key={conversa.id}
                    onClick={() => setConversaSelecionada(conversa)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      conversaSelecionada.id === conversa.id
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {conversa.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conversa.nome}</p>
                        <span className="text-xs text-muted-foreground">{conversa.hora}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversa.mensagem}</p>
                    </div>
                    {conversa.naoLida && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="glass-card lg:col-span-2 flex flex-col">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {conversaSelecionada.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{conversaSelecionada.nome}</p>
                      <p className="text-xs text-muted-foreground capitalize">{conversaSelecionada.tipo}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagensChat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.proprio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.proprio
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className="text-sm">{msg.mensagem}</p>
                      <div className={`flex items-center gap-1 mt-1 ${
                        msg.proprio ? "justify-end" : "justify-start"
                      }`}>
                        <span className="text-xs opacity-70">{msg.hora}</span>
                        {msg.proprio && <CheckCheck className="w-3 h-3 opacity-70" />}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="avisos" className="space-y-4">
          <div className="grid gap-4">
            {avisos.map((aviso, index) => (
              <motion.div
                key={aviso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/20">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{aviso.titulo}</h3>
                          <p className="text-muted-foreground mt-1">{aviso.mensagem}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {aviso.data}
                            </div>
                            <Badge variant="outline">{aviso.destinatarios}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
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
