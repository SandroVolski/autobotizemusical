import { useState, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, Send, CheckCircle2, XCircle, Clock, Users, Settings2, History, ToggleRight, AlertCircle, Phone, Wifi, WifiOff, QrCode, Loader2, Smartphone, Unplug, Pencil, Save, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAlunos } from "@/hooks/useAlunos";
import { useConfirmacaoConfigs, useConfirmacaoMensagens, useConfirmacaoMensagensRealtime, useToggleConfirmacao, useBulkEnableConfirmacao, useUpdateMensagemStatus } from "@/hooks/useConfirmacoes";
import { useConfiguracoes, useUpdateConfiguracoes } from "@/hooks/useConfiguracoes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", icon: Clock, variant: "outline" },
  enviado: { label: "Enviado", icon: Send, variant: "secondary" },
  confirmado: { label: "Confirmado", icon: CheckCircle2, variant: "default" },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "destructive" },
  erro: { label: "Erro", icon: AlertCircle, variant: "destructive" },
};

function WhatsAppConnectionCard() {
  const [status, setStatus] = useState<"checking" | "disconnected" | "connecting" | "connected">("checking");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "status" },
      });
      if (error) throw error;
      const state = data?.state || data?.instance?.state;
      setStatus(state === "open" ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (status !== "connecting") return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("whatsapp-connection", {
          body: { action: "status" },
        });
        const state = data?.state || data?.instance?.state;
        if (state === "open") {
          setStatus("connected");
          setQrCode(null);
          setPairingCode(null);
          toast({ title: "WhatsApp conectado!", description: "Seu WhatsApp foi vinculado com sucesso." });
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  const handleConnect = async () => {
    setLoading(true);
    setQrCode(null);
    setPairingCode(null);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "connect" },
      });
      if (error) throw error;
      if (data?.state === "open") {
        setStatus("connected");
        toast({ title: "WhatsApp já conectado!" });
      } else if (data?.state === "error" || !data?.qrcode) {
        toast({ 
          title: "Não foi possível gerar o QR Code", 
          description: data?.message || "A Evolution API pode estar indisponível.",
          variant: "destructive" 
        });
      } else {
        setStatus("connecting");
        const qr = data.qrcode;
        setQrCode(typeof qr === 'string' && qr.length > 10 ? qr : null);
        setPairingCode(data?.pairingCode || null);
      }
    } catch (err: any) {
      toast({ title: "Erro ao conectar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "disconnect" },
      });
      if (error) throw error;
      setStatus("disconnected");
      setQrCode(null);
      setPairingCode(null);
      toast({ title: "WhatsApp desconectado" });
    } catch (err: any) {
      toast({ title: "Erro ao desconectar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={status === "connected" ? "border-secondary/50 bg-secondary/5" : "border-primary/30 bg-primary/5"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === "connected" ? "bg-secondary/20" : "bg-primary/20"}`}>
              <Smartphone className={`w-6 h-6 ${status === "connected" ? "text-secondary" : "text-primary"}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Conexão WhatsApp</CardTitle>
              <CardDescription>
                {status === "connected"
                  ? "Seu WhatsApp está conectado e pronto para enviar mensagens"
                  : "Conecte seu WhatsApp para enviar confirmações automáticas"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status === "connected" ? "default" : "outline"} className="gap-1">
            {status === "connected" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {status === "checking" ? "Verificando..." : status === "connected" ? "Conectado" : status === "connecting" ? "Aguardando..." : "Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {status === "checking" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {status === "disconnected" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Clique no botão abaixo para gerar um QR Code. Escaneie com seu WhatsApp para vincular ao sistema.
            </p>
            <Button onClick={handleConnect} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              Conectar WhatsApp
            </Button>
          </div>
        )}
        {status === "connecting" && (
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCode ? (
              <>
                <p className="text-sm text-muted-foreground text-center">Escaneie o QR Code abaixo com seu WhatsApp:</p>
                <div className="bg-background p-4 rounded-xl border shadow-sm">
                  <img src={typeof qrCode === 'string' && qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code WhatsApp" className="w-64 h-64 object-contain" />
                </div>
                {pairingCode && (
                  <p className="text-sm text-muted-foreground">Ou use o código: <span className="font-mono font-bold text-foreground">{pairingCode}</span></p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Aguardando leitura do QR Code...
                </div>
                <Button variant="ghost" size="sm" onClick={handleConnect} disabled={loading}>Gerar novo QR Code</Button>
              </>
            ) : (
              <div className="flex items-center gap-2 py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Gerando QR Code...</span>
              </div>
            )}
          </div>
        )}
        {status === "connected" && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">As mensagens de confirmação serão enviadas automaticamente.</p>
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading} className="gap-2 text-destructive hover:text-destructive">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
              Desconectar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageTemplateSettings() {
  const { data: config, isLoading } = useConfiguracoes();
  const updateConfig = useUpdateConfiguracoes();
  const defaultMsg = `Olá {nome}! 🎵\n\nLembramos que você tem aula amanhã ({dia}) às {horario}.\n\nVocê confirma presença?\n\n✅ Responda *SIM* para confirmar\n❌ Responda *NÃO* para cancelar`;
  const [mensagem, setMensagem] = useState(defaultMsg);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (config && (config as any).mensagem_confirmacao) {
      setMensagem((config as any).mensagem_confirmacao);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate({ mensagem_confirmacao: mensagem } as any, {
      onSuccess: () => {
        setDirty(false);
        toast({ title: "Mensagem salva!", description: "O template de confirmação foi atualizado." });
      }
    });
  };

  const handleReset = () => {
    setMensagem(defaultMsg);
    setDirty(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Mensagem de Confirmação
        </CardTitle>
        <CardDescription>
          Personalize a mensagem enviada aos alunos. Use as variáveis: <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{nome}"}</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{dia}"}</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{horario}"}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={mensagem}
          onChange={(e) => { setMensagem(e.target.value); setDirty(true); }}
          rows={8}
          className="font-mono text-sm"
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={!dirty || updateConfig.isPending} className="gap-2">
            {updateConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Mensagem
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Restaurar Padrão
          </Button>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Pré-visualização:</p>
          <p className="text-sm whitespace-pre-line">
            {mensagem.replace("{nome}", "João Silva").replace("{dia}", "Segunda").replace("{horario}", "14:00")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ManualSendCard() {
  const [sending, setSending] = useState(false);

  const handleSendNow = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-class-confirmations");
      if (error) throw error;
      toast({
        title: "Envio concluído!",
        description: `${data?.sent || 0} mensagens enviadas, ${data?.errors || 0} erros.`,
      });
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Disparo Manual
        </CardTitle>
        <CardDescription>
          Envie manualmente as confirmações para todas as aulas das próximas 24 horas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSendNow} disabled={sending} className="gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviar Agora
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Confirmacoes() {
  const [search, setSearch] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const { data: alunos, isLoading: loadingAlunos } = useAlunos();
  const { data: configs, isLoading: loadingConfigs } = useConfirmacaoConfigs();
  useConfirmacaoMensagensRealtime();
  const { data: mensagens, isLoading: loadingMensagens } = useConfirmacaoMensagens();
  const toggleMutation = useToggleConfirmacao();
  const bulkEnableMutation = useBulkEnableConfirmacao();
  const updateStatusMutation = useUpdateMensagemStatus();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.functions.invoke("whatsapp-connection", {
          body: { action: "status" },
        });
        const state = data?.state || data?.instance?.state;
        setWhatsappConnected(state === "open");
      } catch {
        setWhatsappConnected(false);
      } finally {
        setConnectionChecked(true);
      }
    };
    checkConnection();
  }, []);

  const defaultTab = whatsappConnected ? "historico" : "conexao";

  const activeAlunos = alunos?.filter((a) => a.status === "ativo") || [];
  const configMap = new Map(configs?.map((c) => [c.aluno_id, c]) || []);

  const filteredAlunos = activeAlunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const totalHabilitados = activeAlunos.filter((a) => configMap.get(a.id)?.habilitado).length;
  const totalEnviados = mensagens?.filter((m) => m.status === "enviado" || m.status === "confirmado").length || 0;
  const totalConfirmados = mensagens?.filter((m) => m.status === "confirmado").length || 0;
  const totalCancelados = mensagens?.filter((m) => m.status === "cancelado").length || 0;

  const handleToggle = (alunoId: string, currentState: boolean) => {
    toggleMutation.mutate({ aluno_id: alunoId, habilitado: !currentState });
  };

  const handleEnableAll = () => {
    const ids = activeAlunos.map((a) => a.id);
    bulkEnableMutation.mutate(ids);
  };

  if (!connectionChecked) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Confirmação de Aulas
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie mensagens automáticas via WhatsApp para confirmação de aulas
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalHabilitados}</p>
              <p className="text-xs text-muted-foreground">Habilitados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Send className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalEnviados}</p>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10"><CheckCircle2 className="w-5 h-5 text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalConfirmados}</p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><XCircle className="w-5 h-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{totalCancelados}</p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="conexao" className="gap-2">
            <Smartphone className="w-4 h-4" /> Conexão
          </TabsTrigger>
          <TabsTrigger value="alunos" className="gap-2">
            <Users className="w-4 h-4" /> Alunos
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="w-4 h-4" /> Configurações
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* Connection tab */}
        <TabsContent value="conexao">
          <WhatsAppConnectionCard />
        </TabsContent>

        {/* Students tab */}
        <TabsContent value="alunos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Alunos</CardTitle>
                <CardDescription>Habilite ou desabilite o envio automático de confirmação por aluno</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleEnableAll} disabled={bulkEnableMutation.isPending}>
                <ToggleRight className="w-4 h-4 mr-2" /> Habilitar Todos
              </Button>
            </CardHeader>
            <CardContent>
              <Input placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="text-center">Habilitado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAlunos || loadingConfigs ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                    ) : filteredAlunos.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado</TableCell></TableRow>
                    ) : (
                      filteredAlunos.map((aluno) => {
                        const cfg = configMap.get(aluno.id);
                        const habilitado = cfg?.habilitado ?? false;
                        const telefone = aluno.telefone || aluno.responsavel_telefone;
                        return (
                          <TableRow key={aluno.id}>
                            <TableCell className="font-medium">{aluno.nome}</TableCell>
                            <TableCell>
                              {telefone ? (
                                <span className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3" /> {telefone}</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem telefone</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch checked={habilitado} onCheckedChange={() => handleToggle(aluno.id, habilitado)} disabled={!telefone || toggleMutation.isPending} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config tab */}
        <TabsContent value="config" className="space-y-4">
          <MessageTemplateSettings />
          <ManualSendCard />
        </TabsContent>

        {/* History tab */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Mensagens</CardTitle>
              <CardDescription>Acompanhe todas as mensagens enviadas e suas respostas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data da Aula</TableHead>
                      <TableHead>Enviado em</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resposta</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingMensagens ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                    ) : !mensagens || mensagens.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma mensagem enviada ainda</TableCell></TableRow>
                    ) : (
                      mensagens.map((msg) => {
                        const sc = statusConfig[msg.status] || statusConfig.pendente;
                        const StatusIcon = sc.icon;
                        return (
                          <TableRow key={msg.id}>
                            <TableCell className="font-medium">{msg.alunos?.nome || "—"}</TableCell>
                            <TableCell className="text-sm">{msg.telefone}</TableCell>
                            <TableCell className="text-sm">{format(new Date(msg.data_aula), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                            <TableCell className="text-sm">{msg.enviado_em ? format(new Date(msg.enviado_em), "dd/MM HH:mm", { locale: ptBR }) : "—"}</TableCell>
                            <TableCell><Badge variant={sc.variant} className="gap-1"><StatusIcon className="w-3 h-3" />{sc.label}</Badge></TableCell>
                            <TableCell className="text-sm">{msg.resposta_aluno || "—"}</TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={msg.status}
                                onValueChange={(value) => updateStatusMutation.mutate({ id: msg.id, status: value })}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="enviado">Enviado</SelectItem>
                                  <SelectItem value="confirmado">Confirmado</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
