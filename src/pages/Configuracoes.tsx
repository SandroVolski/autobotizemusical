import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Clock,
  Bell,
  Shield,
  Palette,
  Save,
  Moon,
  Sun,
  Loader2,
  Image,
  Upload,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { UserManagement } from "@/components/configuracoes/UserManagement";

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
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

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
  
  // Aparência
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return !document.documentElement.classList.contains("light");
  });
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false);

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle tema escuro/claro
  const handleThemeToggle = (checked: boolean) => {
    setTemaEscuro(checked);
    if (checked) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  // Upload logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo.${fileExt}`;
      const filePath = `escola/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materiais")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("materiais")
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      
      // Salvar URL no banco
      updateConfiguracoes.mutate({ logo_url: publicUrl });
      toast.success("Logo atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await supabase.storage.from("materiais").remove(["escola/logo.png", "escola/logo.jpg", "escola/logo.jpeg", "escola/logo.webp"]);
      setLogoUrl(null);
      updateConfiguracoes.mutate({ logo_url: null });
      toast.success("Logo removida");
    } catch (error) {
      console.error("Erro ao remover logo:", error);
    }
  };

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
      setLogoUrl(configuracoes.logo_url || null);
      
      if (configuracoes.horario_funcionamento) {
        const horariosDb = configuracoes.horario_funcionamento as Record<string, HorarioFuncionamento>;
        const novosHorarios = { ...horarios };
        Object.keys(horariosDb).forEach((dia) => {
          if (novosHorarios[dia]) {
            novosHorarios[dia] = {
              inicio: horariosDb[dia].inicio,
              fim: horariosDb[dia].fim,
              ativo: true,
            };
          }
        });
        setHorarios(novosHorarios);
      }
    }
  }, [configuracoes]);

  const handleSalvarEscola = () => {
    updateConfiguracoes.mutate({
      nome: nomeEscola,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      descricao,
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
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }));
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Tabs */}
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
          <TabsTrigger value="logo" className="gap-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escola" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Dados da Escola
              </CardTitle>
              <CardDescription>
                Informações básicas da sua escola de música
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nomeEscola">Nome da Escola</Label>
                  <Input 
                    id="nomeEscola" 
                    value={nomeEscola}
                    onChange={(e) => setNomeEscola(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input 
                  id="endereco" 
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input 
                    id="cidade" 
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((est) => (
                        <SelectItem key={est.value} value={est.value}>
                          {est.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input 
                    id="cep" 
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                className="gap-2" 
                onClick={handleSalvarEscola}
                disabled={updateConfiguracoes.isPending}
              >
                {updateConfiguracoes.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Configure os horários de funcionamento da escola
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
              <Button 
                className="gap-2"
                onClick={handleSalvarHorarios}
                disabled={updateConfiguracoes.isPending}
              >
                {updateConfiguracoes.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Horários
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Gerencie como e quando as notificações são enviadas
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
                    <p className="text-sm text-muted-foreground">Receber avisos por WhatsApp</p>
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
                    <p className="text-sm text-muted-foreground">Enviar lembrete 24h antes da aula</p>
                  </div>
                  <Switch checked={lembreteAula} onCheckedChange={setLembreteAula} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">Lembrete de Pagamento</p>
                    <p className="text-sm text-muted-foreground">Enviar lembrete de vencimento</p>
                  </div>
                  <Switch checked={lembretePagamento} onCheckedChange={setLembretePagamento} />
                </div>
              </div>

              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Logo da Escola
              </CardTitle>
              <CardDescription>
                Adicione a logo da sua escola de música. Ela será exibida no menu lateral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                {/* Preview da logo */}
                <div className="w-32 h-32 rounded-xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo da escola" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {logoUrl ? "Trocar Logo" : "Enviar Logo"}
                  </Button>
                  {logoUrl && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Recomendado: Imagem quadrada (PNG ou JPG) com pelo menos 200x200 pixels
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${temaEscuro ? 'bg-primary/20' : 'bg-warning/20'}`}>
                    {temaEscuro ? (
                      <Moon className="w-6 h-6 text-primary" />
                    ) : (
                      <Sun className="w-6 h-6 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-lg">
                      {temaEscuro ? "Modo Escuro" : "Modo Claro"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {temaEscuro 
                        ? "Interface escura para reduzir a fadiga visual" 
                        : "Interface clara para ambientes iluminados"}
                    </p>
                  </div>
                </div>
                <Switch checked={temaEscuro} onCheckedChange={handleThemeToggle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Alterar Senha</h3>
                <div className="grid gap-4 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <Input id="senhaAtual" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <Input id="novaSenha" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input id="confirmarSenha" type="password" />
                  </div>
                  <Button className="w-fit">Alterar Senha</Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch checked={autenticacaoDoisFatores} onCheckedChange={setAutenticacaoDoisFatores} />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Sessões Ativas</h3>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chrome - Windows</p>
                      <p className="text-sm text-muted-foreground">Sessão atual • Ativo agora</p>
                    </div>
                    <Button variant="outline" size="sm">Encerrar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
