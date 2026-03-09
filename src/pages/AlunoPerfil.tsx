import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Music,
  Edit,
  Camera,
  MapPin,
  User,
  CreditCard,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Target,
  FileText,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAlunos, useUpdateAluno } from "@/hooks/useAlunos";
import { useMatriculas } from "@/hooks/useMatriculas";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAulas } from "@/hooks/useAulas";
import { usePresencas } from "@/hooks/usePresencas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EnrollmentDialog } from "@/components/alunos/EnrollmentDialog";

export default function AlunoPerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  const { data: alunos, isLoading: alunosLoading } = useAlunos();
  const { data: matriculas } = useMatriculas(id);
  const { data: pagamentos } = usePagamentos();
  const { data: aulas } = useAulas();
  const { data: presencas } = usePresencas();
  const updateAluno = useUpdateAluno();

  const aluno = alunos?.find((a) => a.id === id);
  const alunoPagamentos = pagamentos?.filter((p) => p.aluno_id === id) || [];
  const alunoAulas = aulas?.filter((a) => a.aluno_id === id) || [];
  const alunoPresencas = presencas?.filter((p) => p.aluno_id === id) || [];

  const presencasPresente = alunoPresencas.filter((p) => p.status === "presente").length;
  const presencasTotal = alunoPresencas.length;
  const taxaPresenca = presencasTotal > 0 ? Math.round((presencasPresente / presencasTotal) * 100) : 0;

  const pagamentosPendentes = alunoPagamentos.filter((p) => p.status === "pendente").length;
  const pagamentosPagos = alunoPagamentos.filter((p) => p.status === "pago").length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WebP", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("alunos-fotos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("alunos-fotos").getPublicUrl(path);

    updateAluno.mutate(
      { id, foto_url: urlData.publicUrl },
      {
        onSettled: () => setUploading(false),
      }
    );
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (alunosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Aluno não encontrado</p>
        <Button onClick={() => navigate("/alunos")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/alunos")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar para Alunos
      </Button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar with upload */}
              <div className="relative group">
              {aluno.foto_url ? (
                  <img
                    src={aluno.foto_url}
                    alt={aluno.nome}
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {getInitials(aluno.nome)}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{aluno.nome}</h1>
                  <Badge variant={aluno.status === "ativo" ? "success" : "outline"}>
                    {aluno.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  {aluno.nivel && (
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3" /> {aluno.nivel}
                    </span>
                  )}
                  {aluno.data_matricula && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Desde{" "}
                      {new Date(aluno.data_matricula).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {aluno.endereco && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {aluno.endereco}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                {aluno.telefone && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`tel:${aluno.telefone}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {aluno.email && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`mailto:${aluno.email}`}>
                      <Mail className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => navigate(`/alunos`)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{matriculas?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Matrículas</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{alunoAulas.length}</p>
            <p className="text-xs text-muted-foreground">Aulas</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{taxaPresenca}%</p>
            <p className="text-xs text-muted-foreground">Presença</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{pagamentosPendentes}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="info">Dados</TabsTrigger>
            <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
            <TabsTrigger value="aulas">Aulas</TabsTrigger>
            <TabsTrigger value="presencas">Presença</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" /> Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Nome" value={aluno.nome} />
                  <InfoRow label="E-mail" value={aluno.email} />
                  <InfoRow label="Telefone" value={aluno.telefone} />
                  <InfoRow label="Data de Nascimento" value={aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString("pt-BR") : null} />
                  <InfoRow label="Responsável" value={aluno.responsavel_nome} />
                  <InfoRow label="Tel. Responsável" value={aluno.responsavel_telefone} />
                  <InfoRow label="Endereço" value={aluno.endereco} />
                  <InfoRow label="Nível" value={aluno.nivel} />
                </div>
                {aluno.objetivo && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Objetivo
                      </p>
                      <p className="text-sm">{aluno.objetivo}</p>
                    </div>
                  </>
                )}
                {aluno.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Observações
                    </p>
                    <p className="text-sm">{aluno.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matriculas Tab */}
          <TabsContent value="matriculas">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-primary" /> Matrículas
                </CardTitle>
                <Button size="sm" onClick={() => setEnrollmentOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Nova Matrícula
                </Button>
              </CardHeader>
              <CardContent>
                {!matriculas || matriculas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    Nenhuma matrícula encontrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {matriculas.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{m.cursos?.nome || "Curso"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(m.data_inicio).toLocaleDateString("pt-BR")}
                              {m.data_fim && ` → ${new Date(m.data_fim).toLocaleDateString("pt-BR")}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={m.status === "ativo" ? "success" : "outline"}>{m.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aulas Tab */}
          <TabsContent value="aulas">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" /> Aulas Agendadas
                </CardTitle>
                <Button size="sm" onClick={() => navigate("/agenda")}>
                  <Plus className="w-4 h-4 mr-1" /> Agendar Aula
                </Button>
              </CardHeader>
              <CardContent>
                {alunoAulas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    Nenhuma aula agendada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {alunoAulas.map((aula) => (
                      <div key={aula.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-secondary" />
                          <div>
                            <p className="font-medium text-sm">
                              {aula.tipo === "individual" ? "Individual" : "Grupo"} — {aula.sala || "Sem sala"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {aula.horario && `${aula.horario}`}
                              {aula.data_especifica && ` • ${new Date(aula.data_especifica).toLocaleDateString("pt-BR")}`}
                              {aula.duracao_minutos && ` • ${aula.duracao_minutos}min`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={aula.status === "agendada" ? "default" : "outline"}>{aula.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Presencas Tab */}
          <TabsContent value="presencas">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-success" /> Histórico de Presença
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alunoPresencas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    Nenhum registro de presença
                  </p>
                ) : (
                  <div className="space-y-2">
                    {alunoPresencas
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .slice(0, 20)
                      .map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            {p.status === "presente" ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="text-sm">
                              {new Date(p.data).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <Badge variant={p.status === "presente" ? "success" : "destructive"}>
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos Tab */}
          <TabsContent value="pagamentos">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-warning" /> Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alunoPagamentos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    Nenhum pagamento registrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {alunoPagamentos
                      .sort((a, b) => new Date(b.data_vencimento || b.created_at).getTime() - new Date(a.data_vencimento || a.created_at).getTime())
                      .map((pag) => (
                        <div key={pag.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">
                              R$ {pag.valor.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pag.referencia || pag.tipo}
                              {pag.data_vencimento && ` • Venc: ${new Date(pag.data_vencimento).toLocaleDateString("pt-BR")}`}
                            </p>
                          </div>
                          <Badge
                            variant={
                              pag.status === "pago" ? "success" : pag.status === "pendente" ? "warning" : "destructive"
                            }
                          >
                            {pag.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Enrollment Dialog */}
      {enrollmentOpen && (
        <EnrollmentDialog
          alunoId={id!}
          alunoNome={aluno.nome}
          open={enrollmentOpen}
          onOpenChange={setEnrollmentOpen}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
