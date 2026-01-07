import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  Bell,
  Mail,
  Phone,
  Plus,
  MoreVertical,
  Clock,
  Trash2,
  Loader2,
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
import { useAvisos, useCreateAviso, useDeleteAviso, type NovoAviso } from "@/hooks/useAvisos";
import { useNotificacoes, useNotificacoesNaoLidas, useMarcarComoLida, useMarcarTodasComoLidas } from "@/hooks/useNotificacoes";
import { toast } from "@/hooks/use-toast";

export default function Comunicacao() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAviso, setNewAviso] = useState<NovoAviso>({
    titulo: "",
    conteudo: "",
    tipo: "geral",
    prioridade: "normal",
  });

  const { data: avisos, isLoading: loadingAvisos } = useAvisos();
  const { data: notificacoes, isLoading: loadingNotificacoes } = useNotificacoes();
  const { data: notificacoesNaoLidas } = useNotificacoesNaoLidas();
  const createAvisoMutation = useCreateAviso();
  const deleteAvisoMutation = useDeleteAviso();
  const marcarComoLidaMutation = useMarcarComoLida();
  const marcarTodasComoLidasMutation = useMarcarTodasComoLidas();

  const handleCreateAviso = () => {
    if (!newAviso.titulo || !newAviso.conteudo) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createAvisoMutation.mutate(newAviso, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewAviso({
          titulo: "",
          conteudo: "",
          tipo: "geral",
          prioridade: "normal",
        });
      }
    });
  };

  const filteredAvisos = avisos?.filter(aviso =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aviso.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ) || [];

  if (loadingAvisos || loadingNotificacoes) {
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
          <h1 className="text-2xl font-bold text-foreground">Comunicação</h1>
          <p className="text-muted-foreground">
            Avisos e notificações
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
                <Label htmlFor="titulo">Título *</Label>
                <Input 
                  id="titulo" 
                  placeholder="Título do aviso"
                  value={newAviso.titulo}
                  onChange={(e) => setNewAviso(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newAviso.tipo}
                    onValueChange={(value) => setNewAviso(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="alunos">Alunos</SelectItem>
                      <SelectItem value="professores">Professores</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newAviso.prioridade}
                    onValueChange={(value) => setNewAviso(prev => ({ ...prev, prioridade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea 
                  id="conteudo" 
                  placeholder="Digite a mensagem..." 
                  rows={4}
                  value={newAviso.conteudo}
                  onChange={(e) => setNewAviso(prev => ({ ...prev, conteudo: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateAviso}
                disabled={createAvisoMutation.isPending}
              >
                {createAvisoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
                <p className="text-2xl font-bold">{notificacoesNaoLidas?.length || 0}</p>
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
                <p className="text-2xl font-bold">{avisos?.length || 0}</p>
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
                <p className="text-2xl font-bold">{avisos?.filter(a => a.prioridade === "alta").length || 0}</p>
                <p className="text-xs text-muted-foreground">Alta Prioridade</p>
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
                <p className="text-2xl font-bold">{avisos?.filter(a => a.tipo === "urgente").length || 0}</p>
                <p className="text-xs text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="avisos" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
          <TabsTrigger value="notificacoes">
            Notificações
            {(notificacoesNaoLidas?.length || 0) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {notificacoesNaoLidas?.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar avisos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredAvisos.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum aviso encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente outra busca" : "Envie seu primeiro aviso"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Aviso
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAvisos.map((aviso, index) => (
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
                          <div className={`p-3 rounded-lg ${
                            aviso.prioridade === "alta" ? "bg-destructive/20" :
                            aviso.tipo === "urgente" ? "bg-warning/20" :
                            "bg-primary/20"
                          }`}>
                            <Bell className={`w-5 h-5 ${
                              aviso.prioridade === "alta" ? "text-destructive" :
                              aviso.tipo === "urgente" ? "text-warning" :
                              "text-primary"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{aviso.titulo}</h3>
                            <p className="text-muted-foreground mt-1">{aviso.conteudo}</p>
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(aviso.created_at).toLocaleDateString("pt-BR")}
                              </div>
                              <Badge variant="outline">{aviso.tipo}</Badge>
                              <Badge 
                                variant={aviso.prioridade === "alta" ? "destructive" : "secondary"}
                              >
                                {aviso.prioridade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteAvisoMutation.mutate(aviso.id)}
                          disabled={deleteAvisoMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          {(notificacoesNaoLidas?.length || 0) > 0 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => marcarTodasComoLidasMutation.mutate()}
                disabled={marcarTodasComoLidasMutation.isPending}
              >
                Marcar todas como lidas
              </Button>
            </div>
          )}

          {!notificacoes || notificacoes.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  Você não tem notificações no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((notificacao, index) => (
                <motion.div
                  key={notificacao.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`glass-card cursor-pointer transition-colors ${
                      !notificacao.lida ? "border-primary/30 bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (!notificacao.lida) {
                        marcarComoLidaMutation.mutate(notificacao.id);
                      }
                    }}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          notificacao.tipo === "alerta" ? "bg-warning/20" :
                          notificacao.tipo === "erro" ? "bg-destructive/20" :
                          "bg-primary/20"
                        }`}>
                          <Bell className={`w-4 h-4 ${
                            notificacao.tipo === "alerta" ? "text-warning" :
                            notificacao.tipo === "erro" ? "text-destructive" :
                            "text-primary"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notificacao.titulo}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notificacao.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notificacao.mensagem}</p>
                        </div>
                        {!notificacao.lida && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
