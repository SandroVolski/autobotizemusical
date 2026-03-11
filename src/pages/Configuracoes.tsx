import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Clock,
  Bell,
  Shield,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  Wifi,
  WifiOff,
  QrCode,
  Unplug,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useConfiguracoes, useUpdateConfiguracoes, HorarioFuncionamento } from "@/hooks/useConfiguracoes";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

const diasSemana = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const estadosBrasileiros = [
  { value: "AC", label: "Acre" }, { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" }, { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" }, { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" }, { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" }, { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" }, { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" }, { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" }, { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" }, { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" }, { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" }, { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" }, { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" }, { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

function WhatsAppSettingsCard() {
  const [status, setStatus] = useState<"checking" | "disconnected" | "connecting" | "connected">("checking");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", { body: { action: "status" } });
      if (error) throw error;
      const state = data?.state || data?.instance?.state;
      setStatus(state === "open" ? "connected" : "disconnected");
    } catch { setStatus("disconnected"); }
  }, []);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  useEffect(() => {
    if (status !== "connecting") return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke("whatsapp-connection", { body: { action: "status" } });
        const state = data?.state || data?.instance?.state;
        if (state === "open") {
          setStatus("connected");
          setQrCode(null);
          setPairingCode(null);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  const handleConnect = async () => {
    setLoading(true); setQrCode(null); setPairingCode(null);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", { body: { action: "connect" } });
      if (error) throw error;
      if (data?.state === "open") { setStatus("connected"); }
      else if (data?.qrcode) {
        setStatus("connecting");
        const qr = data.qrcode;
        setQrCode(typeof qr === 'string' && qr.length > 10 ? qr : null);
        setPairingCode(data?.pairingCode || null);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke("whatsapp-connection", { body: { action: "disconnect" } });
      setStatus("disconnected"); setQrCode(null); setPairingCode(null);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === "connected" ? "bg-secondary/20" : "bg-primary/20"}`}>
              <Smartphone className={`w-6 h-6 ${status === "connected" ? "text-secondary" : "text-primary"}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Conexão WhatsApp</CardTitle>
              <CardDescription>
                {status === "connected" ? "Seu WhatsApp está conectado e pronto para enviar confirmações e cobranças" : "Conecte para habilitar confirmações de aula e cobranças automáticas"}
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
        {status === "checking" && <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
        {status === "disconnected" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">Clique no botão abaixo para gerar um QR Code. Escaneie com seu WhatsApp para vincular ao sistema.</p>
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
                  <img src={typeof qrCode === 'string' && qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-64 h-64 object-contain" />
                </div>
                {pairingCode && <p className="text-sm text-muted-foreground">Ou use o código: <span className="font-mono font-bold text-foreground">{pairingCode}</span></p>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Aguardando leitura...</div>
              </>
            ) : (
              <div className="flex items-center gap-2 py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /><span className="text-sm text-muted-foreground">Gerando QR Code...</span></div>
            )}
          </div>
        )}
        {status === "connected" && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">As mensagens de confirmação e cobranças serão enviadas automaticamente.</p>
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

  export default function Configuracoes() {
  const { data: configuracoes, isLoading } = useConfiguracoes();
  const updateConfiguracoes = useUpdateConfiguracoes();

  // Dados da escola
  const [nomeEscola, setNomeEscola] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [descricao, setDescricao] = useState("");

  // Horários
  const [horarios, setHorarios] = useState<Record<string, { inicio: string; fim: string; ativo: boolean }>>({
    segunda: { inicio: "08:00", fim: "21:00", ativo: true },
    terca: { inicio: "08:00", fim: "21:00", ativo: true },
    quarta: { inicio: "08:00", fim: "21:00", ativo: true },
    quinta: { inicio: "08:00", fim: "21:00", ativo: true },
    sexta: { inicio: "08:00", fim: "21:00", ativo: true },
    sabado: { inicio: "08:00", fim: "14:00", ativo: true },
    domingo: { inicio: "09:00", fim: "12:00", ativo: false },
  });

  // Notificações
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesWhatsapp, setNotificacoesWhatsapp] = useState(true);
  const [lembreteAula, setLembreteAula] = useState(true);
  const [lembretePagamento, setLembretePagamento] = useState(true);
  const [lembreteAniversario, setLembreteAniversario] = useState(true);
  const [savingNotificacoes, setSavingNotificacoes] = useState(false);

  // Segurança
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Carregar dados do banco
  useEffect(() => {
    if (configuracoes) {
      setNomeEscola(configuracoes.nome || "");
      setCnpj(configuracoes.cnpj || "");
      setEmail(configuracoes.email || "");
      setTelefone(configuracoes.telefone || "");
      setEndereco(configuracoes.endereco || "");
      setCidade(configuracoes.cidade || "");
      setEstado(configuracoes.estado || "");
      setCep(configuracoes.cep || "");
      setDescricao(configuracoes.descricao || "");
      
      if (configuracoes.horario_funcionamento) {
        const horariosDb = configuracoes.horario_funcionamento as Record<string, HorarioFuncionamento>;
        const novosHorarios = { ...horarios };
        Object.keys(novosHorarios).forEach((dia) => {
          if (horariosDb[dia]) {
            novosHorarios[dia] = {
              inicio: horariosDb[dia].inicio,
              fim: horariosDb[dia].fim,
              ativo: true,
            };
          } else {
            novosHorarios[dia] = { ...novosHorarios[dia], ativo: false };
          }
        });
        setHorarios(novosHorarios);
      }
    }
  }, [configuracoes]);

  const handleSalvarEscola = () => {
    updateConfiguracoes.mutate({
      nome: nomeEscola, cnpj, email, telefone, endereco, cidade, estado, cep, descricao,
    });
  };

  const handleSalvarHorarios = () => {
    const horariosFuncionamento: Record<string, { inicio: string; fim: string }> = {};
    Object.entries(horarios).forEach(([dia, { inicio, fim, ativo }]) => {
      if (ativo) {
        horariosFuncionamento[dia] = { inicio, fim };
      }
    });
    updateConfiguracoes.mutate({
      horario_funcionamento: horariosFuncionamento as Json,
    });
  };

  const updateHorario = (dia: string, campo: "inicio" | "fim" | "ativo", valor: string | boolean) => {
    setHorarios((prev) => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }));
  };

  const handleSalvarNotificacoes = async () => {
    setSavingNotificacoes(true);
    // Save notification preferences to localStorage (could be extended to DB)
    const prefs = { notificacoesEmail, notificacoesWhatsapp, lembreteAula, lembretePagamento, lembreteAniversario };
    localStorage.setItem("notification_prefs", JSON.stringify(prefs));
    await new Promise(r => setTimeout(r, 500));
    setSavingNotificacoes(false);
    toast.success("Configurações de notificações salvas!");
  };

  // Load notification prefs
  useEffect(() => {
    const saved = localStorage.getItem("notification_prefs");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setNotificacoesEmail(prefs.notificacoesEmail ?? true);
        setNotificacoesWhatsapp(prefs.notificacoesWhatsapp ?? true);
        setLembreteAula(prefs.lembreteAula ?? true);
        setLembretePagamento(prefs.lembretePagamento ?? true);
        setLembreteAniversario(prefs.lembreteAniversario ?? true);
      } catch {}
    }
  }, []);

  const handleAlterarSenha = async () => {
    if (!novaSenha) {
      toast.error("Digite a nova senha");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="escola" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="escola" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Escola</span>
          </TabsTrigger>
          <TabsTrigger value="horarios" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="conexao" className="gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Conexão</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Escola Tab */}
        <TabsContent value="escola" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Dados da Escola
              </CardTitle>
              <CardDescription>
                Informações utilizadas em contratos, documentos e comunicações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nomeEscola">Nome da Escola</Label>
                  <Input id="nomeEscola" value={nomeEscola} onChange={(e) => setNomeEscola(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((est) => (
                        <SelectItem key={est.value} value={est.value}>{est.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>CEP</Label>
                  <Input value={cep} onChange={(e) => setCep(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
              </div>
              <Button className="gap-2" onClick={handleSalvarEscola} disabled={updateConfiguracoes.isPending}>
                {updateConfiguracoes.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horários Tab */}
        <TabsContent value="horarios" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Estes horários são usados na Agenda para definir os horários visíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {diasSemana.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium w-24">{label}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={horarios[key].inicio}
                        onChange={(e) => updateHorario(key, "inicio", e.target.value)}
                        className="w-28"
                        disabled={!horarios[key].ativo}
                      />
                      <span className="text-muted-foreground">até</span>
                      <Input
                        type="time"
                        value={horarios[key].fim}
                        onChange={(e) => updateHorario(key, "fim", e.target.value)}
                        className="w-28"
                        disabled={!horarios[key].ativo}
                      />
                    </div>
                    <Switch
                      checked={horarios[key].ativo}
                      onCheckedChange={(checked) => updateHorario(key, "ativo", checked)}
                    />
                  </div>
                ))}
              </div>
              <Button className="gap-2" onClick={handleSalvarHorarios} disabled={updateConfiguracoes.isPending}>
                {updateConfiguracoes.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Horários
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações Tab */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Gerencie como e quando as notificações são enviadas. Estas configurações afetam o envio de confirmações e cobranças.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Canais de Notificação</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">Receber avisos por e-mail</p>
                  </div>
                  <Switch checked={notificacoesEmail} onCheckedChange={setNotificacoesEmail} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Notificações por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Enviar confirmações e cobranças via WhatsApp</p>
                  </div>
                  <Switch checked={notificacoesWhatsapp} onCheckedChange={setNotificacoesWhatsapp} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Tipos de Lembrete</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Lembrete de Aula</p>
                    <p className="text-sm text-muted-foreground">Enviar confirmação 24h antes da aula (Confirmações)</p>
                  </div>
                  <Switch checked={lembreteAula} onCheckedChange={setLembreteAula} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Lembrete de Pagamento</p>
                    <p className="text-sm text-muted-foreground">Enviar aviso 3 dias antes do vencimento e após atraso (Cobranças)</p>
                  </div>
                  <Switch checked={lembretePagamento} onCheckedChange={setLembretePagamento} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Lembrete de Aniversário</p>
                    <p className="text-sm text-muted-foreground">Avisar sobre aniversários de alunos no dia</p>
                  </div>
                  <Switch checked={lembreteAniversario} onCheckedChange={setLembreteAniversario} />
                </div>
              </div>

              <Button className="gap-2" onClick={handleSalvarNotificacoes} disabled={savingNotificacoes}>
                {savingNotificacoes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conexão WhatsApp Tab */}
        <TabsContent value="conexao" className="space-y-4">
          <WhatsAppSettingsCard />
        </TabsContent>

        {/* Segurança Tab */}
        <TabsContent value="seguranca" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>Configure a senha da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Alterar Senha</h3>
                <div className="grid gap-4 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="novaSenha"
                        type={showPassword ? "text" : "password"}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmarSenha"
                      type={showPassword ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                  {novaSenha && confirmarSenha && novaSenha !== confirmarSenha && (
                    <p className="text-sm text-destructive">As senhas não coincidem</p>
                  )}
                  <Button
                    className="w-fit gap-2"
                    onClick={handleAlterarSenha}
                    disabled={changingPassword || !novaSenha || novaSenha !== confirmarSenha}
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Alterar Senha
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Sessão</h3>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sessão Atual</p>
                      <p className="text-sm text-muted-foreground">{user?.email} • Ativo agora</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
