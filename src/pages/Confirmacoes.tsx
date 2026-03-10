import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, CheckCircle2, XCircle, Clock, Users, Settings2, History, ToggleRight, AlertCircle, Phone, Wifi, WifiOff, QrCode, Loader2, Smartphone, Unplug } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAlunos } from "@/hooks/useAlunos";
import { useConfirmacaoConfigs, useConfirmacaoMensagens, useToggleConfirmacao, useBulkEnableConfirmacao } from "@/hooks/useConfirmacoes";
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

  // Poll status while connecting
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
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "connect" },
      });
      if (error) throw error;
      if (data?.state === "open") {
        setStatus("connected");
        toast({ title: "WhatsApp já conectado!" });
      } else {
        setStatus("connecting");
        setQrCode(data?.qrcode || null);
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
                <p className="text-sm text-muted-foreground text-center">
                  Escaneie o QR Code abaixo com seu WhatsApp:
                </p>
                <div className="bg-background p-4 rounded-xl border shadow-sm">
                  <img
                    src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                {pairingCode && (
                  <p className="text-sm text-muted-foreground">
                    Ou use o código: <span className="font-mono font-bold text-foreground">{pairingCode}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aguardando leitura do QR Code...
                </div>
                <Button variant="ghost" size="sm" onClick={handleConnect} disabled={loading}>
                  Gerar novo QR Code
                </Button>
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
            <p className="text-sm text-muted-foreground">
              As mensagens de confirmação serão enviadas automaticamente 24h antes de cada aula.
            </p>
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

export default function Confirmacoes() {
  const [search, setSearch] = useState("");
  const { data: alunos, isLoading: loadingAlunos } = useAlunos();
  const { data: configs, isLoading: loadingConfigs } = useConfirmacaoConfigs();
  const { data: mensagens, isLoading: loadingMensagens } = useConfirmacaoMensagens();
  const toggleMutation = useToggleConfirmacao();
  const bulkEnableMutation = useBulkEnableConfirmacao();

  const activeAlunos = alunos?.filter((a) => a.status === "ativo") || [];
  const configMap = new Map(configs?.map((c) => [c.aluno_id, c]) || []);

  const filteredAlunos = activeAlunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  );

  const totalHabilitados = activeAlunos.filter((a) => {
    const cfg = configMap.get(a.id);
    return cfg ? cfg.habilitado : false;
  }).length;

  const totalEnviados = mensagens?.filter((m) => m.status === "enviado" || m.status === "confirmado").length || 0;
  const totalConfirmados = mensagens?.filter((m) => m.status === "confirmado").length || 0;
  const totalErros = mensagens?.filter((m) => m.status === "erro").length || 0;

  const handleToggle = (alunoId: string, currentState: boolean) => {
    toggleMutation.mutate({ aluno_id: alunoId, habilitado: !currentState });
  };

  const handleEnableAll = () => {
    const ids = activeAlunos.map((a) => a.id);
    bulkEnableMutation.mutate(ids);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Confirmação de Aulas
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie mensagens automáticas via WhatsApp 24h antes da aula para confirmação
          </p>
        </div>
      </div>

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
            <div className="p-2 rounded-lg bg-destructive/10"><AlertCircle className="w-5 h-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{totalErros}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conexao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conexao" className="gap-2">
            <Smartphone className="w-4 h-4" /> Conexão
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

        {/* Config tab */}
        <TabsContent value="config" className="space-y-4">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingMensagens ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                    ) : !mensagens || mensagens.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma mensagem enviada ainda</TableCell></TableRow>
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
