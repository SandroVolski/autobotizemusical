import { useState } from "react";
import { UserPlus, Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "professor", label: "Professor" },
  { value: "secretaria", label: "Secretaria" },
  { value: "coordenador", label: "Coordenador Pedagógico" },
  { value: "aluno", label: "Aluno/Responsável" },
];

function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function UserManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; password: string; nome: string; role: string } | null>(null);

  const handleGenerateNewPassword = () => {
    setPassword(generatePassword());
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCredentials = async () => {
    if (!createdUser) return;
    const text = `Email: ${createdUser.email}\nSenha: ${createdUser.password}`;
    await navigator.clipboard.writeText(text);
    toast.success("Credenciais copiadas!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !nome || !role) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email, password, nome, role },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCreatedUser({ email, password, nome, role });
      setShowSuccessDialog(true);
      
      // Reset form
      setEmail("");
      setNome("");
      setRole("");
      setPassword(generatePassword());
      
      toast.success("Usuário criado com sucesso!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Criar Novo Usuário
          </CardTitle>
          <CardDescription>
            Cadastre novos usuários do sistema. Uma senha será gerada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha Inicial</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopyPassword}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateNewPassword}
                  >
                    Gerar Nova
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O usuário deverá trocar a senha no primeiro acesso.
                </p>
              </div>
            </div>

            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Criar Usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              Usuário Criado com Sucesso!
            </DialogTitle>
            <DialogDescription>
              Anote ou copie as credenciais abaixo para enviar ao usuário.
            </DialogDescription>
          </DialogHeader>
          
          {createdUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nome:</span>
                  <p className="font-medium">{createdUser.nome}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{createdUser.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Senha:</span>
                  <p className="font-mono font-medium">{createdUser.password}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Função:</span>
                  <p className="font-medium">
                    {roles.find((r) => r.value === createdUser.role)?.label}
                  </p>
                </div>
              </div>
              
              <Button onClick={handleCopyCredentials} className="w-full gap-2">
                <Copy className="w-4 h-4" />
                Copiar Credenciais
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
