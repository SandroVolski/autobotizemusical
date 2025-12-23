import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Clock,
  Bell,
  Shield,
  Palette,
  Users,
  CreditCard,
  Database,
  Save,
  Moon,
  Sun,
} from "lucide-react";
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

export default function Configuracoes() {
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesWhatsapp, setNotificacoesWhatsapp] = useState(true);
  const [lembreteAula, setLembreteAula] = useState(true);
  const [lembretePagamento, setLembretePagamento] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [autenticacaoDoisFatores, setAutenticacaoDoisFatores] = useState(false);

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
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
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
                  <Input id="nomeEscola" defaultValue="Escola de Música Sandro Volski" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" defaultValue="contato@sandrovolski.com.br" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" defaultValue="(47) 3333-3333" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" defaultValue="Rua das Notas Musicais, 123 - Centro" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" defaultValue="Blumenau" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select defaultValue="sc">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sc">Santa Catarina</SelectItem>
                      <SelectItem value="pr">Paraná</SelectItem>
                      <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" defaultValue="89010-000" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  defaultValue="Escola de música com mais de 20 anos de tradição, oferecendo ensino de qualidade em diversos instrumentos."
                  rows={3}
                />
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
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
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia) => (
                  <div key={dia} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium w-24">{dia}</span>
                    <div className="flex items-center gap-2">
                      <Input type="time" defaultValue="08:00" className="w-28" />
                      <span className="text-muted-foreground">até</span>
                      <Input type="time" defaultValue="21:00" className="w-28" />
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium w-24">Domingo</span>
                  <div className="flex items-center gap-2">
                    <Input type="time" defaultValue="09:00" className="w-28" />
                    <span className="text-muted-foreground">até</span>
                    <Input type="time" defaultValue="12:00" className="w-28" />
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label>Duração Padrão das Aulas</Label>
                <Select defaultValue="60">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {temaEscuro ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">Usar tema escuro no sistema</p>
                  </div>
                </div>
                <Switch checked={temaEscuro} onCheckedChange={setTemaEscuro} />
              </div>

              <Separator />

              <div className="grid gap-4">
                <Label>Cor Principal</Label>
                <div className="flex gap-3">
                  {["#8000FF", "#00ffa3", "#ff6b6b", "#4ecdc4", "#45b7d1"].map((cor) => (
                    <button
                      key={cor}
                      className="w-10 h-10 rounded-full border-2 border-transparent hover:border-foreground transition-all"
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Salvar Preferências
              </Button>
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
                      <p className="text-sm text-muted-foreground">Blumenau, SC • Ativo agora</p>
                    </div>
                    <Button variant="outline" size="sm">Encerrar</Button>
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
