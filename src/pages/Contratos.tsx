import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Plus, Loader2, Download, Printer, BookOpen, Guitar, Edit3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useContratos, useCreateContrato } from "@/hooks/useContratos";
import { useAlunos } from "@/hooks/useAlunos";
import { useCursos } from "@/hooks/useCursos";
import { useInstrumentos } from "@/hooks/useInstrumentos";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function esc(val: any, fallback = "—"): string {
  if (val == null || val === "") return escapeHtml(fallback);
  return escapeHtml(String(val));
}

function generateContractHTML(contrato: any, escola: any) {
  const aluno = contrato.alunos;
  const curso = contrato.cursos;
  const today = new Date().toLocaleDateString("pt-BR");
  const year = new Date().getFullYear();

  if (contrato.tipo === "matricula") {
    return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 50px; color: #1a1a2e;">
<div style="text-align: center; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px;">
<h1 style="font-size: 22px; font-weight: 700; color: #7c3aed; margin: 0; letter-spacing: 2px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
<p style="font-size: 16px; color: #555; margin: 8px 0 0;">${escola?.nome || "Escola de Música"}</p>
${escola?.cnpj ? `<p style="font-size: 12px; color: #888; margin: 4px 0 0;">CNPJ: ${escola.cnpj}</p>` : ""}
${escola?.endereco ? `<p style="font-size: 12px; color: #888; margin: 2px 0 0;">${escola.endereco}${escola?.cidade ? ` — ${escola.cidade}/${escola.estado}` : ""}</p>` : ""}
</div>
<div style="background: #f8f7ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 13px; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Dados da Contratante</h3>
<table style="width: 100%; font-size: 14px;">
<tr><td style="padding: 4px 0; color: #666; width: 140px;">Nome:</td><td style="font-weight: 600;">${aluno?.responsavel_nome || aluno?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Endereço:</td><td>${aluno?.endereco || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Telefone:</td><td>${aluno?.telefone || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">E-mail:</td><td>${aluno?.email || "—"}</td></tr>
</table></div>
<div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 13px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Dados do Aluno(a)</h3>
<table style="width: 100%; font-size: 14px;">
<tr><td style="padding: 4px 0; color: #666; width: 140px;">Aluno(a):</td><td style="font-weight: 600;">${aluno?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Curso:</td><td style="font-weight: 600;">${curso?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Valor Mensal:</td><td style="font-weight: 700; color: #7c3aed; font-size: 16px;">${curso?.valor_mensal ? `R$ ${Number(curso.valor_mensal).toFixed(2)}` : "A definir"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Início:</td><td>${contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString("pt-BR") : today}</td></tr>
${contrato.data_fim ? `<tr><td style="padding: 4px 0; color: #666;">Término:</td><td>${new Date(contrato.data_fim).toLocaleDateString("pt-BR")}</td></tr>` : ""}
</table></div>
<div style="margin-bottom: 30px;">
<h3 style="font-size: 14px; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">CLÁUSULAS E CONDIÇÕES</h3>
<div style="font-size: 13px; line-height: 1.8; color: #444;">
<p><strong>CLÁUSULA 1ª — OBJETO:</strong> O presente contrato tem por objeto a prestação de serviços educacionais musicais.</p>
<p><strong>CLÁUSULA 2ª — VIGÊNCIA:</strong> Este contrato terá vigência a partir da data de início acima mencionada${contrato.data_fim ? ", com término previsto para a data indicada" : ", com prazo indeterminado"}.</p>
<p><strong>CLÁUSULA 3ª — PAGAMENTO:</strong> O pagamento da mensalidade deverá ser efetuado até o dia 10 de cada mês. Multa de 2% e juros de 1% ao mês por atraso.</p>
<p><strong>CLÁUSULA 4ª — FREQUÊNCIA:</strong> Falta sem aviso de 24h será cobrada normalmente.</p>
<p><strong>CLÁUSULA 5ª — REPOSIÇÃO:</strong> Faltas com aviso de 24h geram crédito de reposição (expira em 30 dias).</p>
<p><strong>CLÁUSULA 6ª — MATERIAL:</strong> Material didático é responsabilidade do contratante.</p>
<p><strong>CLÁUSULA 7ª — RESCISÃO:</strong> Cancelamento com 30 dias de antecedência por escrito.</p>
<p><strong>CLÁUSULA 8ª — FORO:</strong> Foro da comarca de ${escola?.cidade || "[cidade]"}/${escola?.estado || "[UF]"}.</p>
</div></div>
<div style="margin-top: 60px;">
<p style="text-align: center; color: #888; font-size: 12px; margin-bottom: 40px;">${escola?.cidade || "[Cidade]"}, ${today}</p>
<div style="display: flex; justify-content: space-between; gap: 40px;">
<div style="flex: 1; text-align: center;"><div style="border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 50px;">
<p style="font-size: 13px; font-weight: 600; margin: 0;">${aluno?.responsavel_nome || aluno?.nome || "CONTRATANTE"}</p>
<p style="font-size: 11px; color: #888; margin: 2px 0 0;">Contratante</p></div></div>
<div style="flex: 1; text-align: center;"><div style="border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 50px;">
<p style="font-size: 13px; font-weight: 600; margin: 0;">${escola?.nome || "CONTRATADA"}</p>
<p style="font-size: 11px; color: #888; margin: 2px 0 0;">Contratada</p></div></div>
</div></div>
<div style="text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
<p style="font-size: 10px; color: #aaa;">Documento gerado eletronicamente em ${today} — ${escola?.nome || "Escola de Música"} © ${year}</p>
</div></div>`;
  }

  const instrumento = contrato.instrumentos;
  return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 50px; color: #1a1a2e;">
<div style="text-align: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px;">
<h1 style="font-size: 22px; font-weight: 700; color: #0ea5e9; margin: 0; letter-spacing: 2px;">TERMO DE EMPRÉSTIMO DE INSTRUMENTO</h1>
<p style="font-size: 16px; color: #555; margin: 8px 0 0;">${escola?.nome || "Escola de Música"}</p>
${escola?.cnpj ? `<p style="font-size: 12px; color: #888; margin: 4px 0 0;">CNPJ: ${escola.cnpj}</p>` : ""}
</div>
<div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 13px; color: #0ea5e9; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Responsável</h3>
<table style="width: 100%; font-size: 14px;">
<tr><td style="padding: 4px 0; color: #666; width: 140px;">Nome:</td><td style="font-weight: 600;">${aluno?.responsavel_nome || aluno?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Aluno(a):</td><td>${aluno?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Telefone:</td><td>${aluno?.telefone || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Endereço:</td><td>${aluno?.endereco || "—"}</td></tr>
</table></div>
<div style="background: #fff7ed; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
<h3 style="font-size: 13px; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Instrumento</h3>
<table style="width: 100%; font-size: 14px;">
<tr><td style="padding: 4px 0; color: #666; width: 140px;">Instrumento:</td><td style="font-weight: 600;">${instrumento?.nome || "—"}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Marca/Modelo:</td><td>${instrumento?.marca || "—"} ${instrumento?.modelo || ""}</td></tr>
<tr><td style="padding: 4px 0; color: #666;">Nº Série:</td><td>${instrumento?.numero_serie || "—"}</td></tr>
${instrumento?.valor_patrimonio ? `<tr><td style="padding: 4px 0; color: #666;">Valor:</td><td style="font-weight: 700; color: #ea580c;">R$ ${Number(instrumento.valor_patrimonio).toFixed(2)}</td></tr>` : ""}
</table></div>
<div style="margin-bottom: 30px;">
<h3 style="font-size: 14px; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">TERMOS E CONDIÇÕES</h3>
<div style="font-size: 13px; line-height: 1.8; color: #444;">
<p><strong>1.</strong> O instrumento é cedido em regime de empréstimo para uso exclusivo em atividades de estudo.</p>
<p><strong>2.</strong> O responsável se compromete a zelar pelo instrumento.</p>
<p><strong>3.</strong> Danos ou perda são de responsabilidade financeira do responsável.</p>
<p><strong>4.</strong> Devolução na data prevista ou quando solicitado.</p>
<p><strong>5.</strong> É proibido ceder ou transferir o instrumento a terceiros.</p>
<p><strong>6.</strong> Em caso de desistência, devolver imediatamente.</p>
</div></div>
<div style="margin-top: 60px;">
<p style="text-align: center; color: #888; font-size: 12px; margin-bottom: 40px;">${escola?.cidade || "[Cidade]"}, ${today}</p>
<div style="display: flex; justify-content: space-between; gap: 40px;">
<div style="flex: 1; text-align: center;"><div style="border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 50px;">
<p style="font-size: 13px; font-weight: 600; margin: 0;">${aluno?.responsavel_nome || aluno?.nome || "RESPONSÁVEL"}</p>
<p style="font-size: 11px; color: #888; margin: 2px 0 0;">Responsável</p></div></div>
<div style="flex: 1; text-align: center;"><div style="border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 50px;">
<p style="font-size: 13px; font-weight: 600; margin: 0;">${escola?.nome || "ESCOLA"}</p>
<p style="font-size: 11px; color: #888; margin: 2px 0 0;">Cedente</p></div></div>
</div></div>
<div style="text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
<p style="font-size: 10px; color: #aaa;">Documento gerado eletronicamente em ${today} — ${escola?.nome || "Escola de Música"} © ${year}</p>
</div></div>`;
}

function printContract(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<html><head><title>Contrato</title><style>@media print { body { margin: 0; } } @page { margin: 15mm; }</style></head><body>${html}</body></html>`);
  win.document.close();
  win.print();
}

export default function Contratos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipo, setTipo] = useState<"matricula" | "emprestimo">("matricula");
  const [newContrato, setNewContrato] = useState({
    aluno_id: "", curso_id: "", instrumento_id: "", data_inicio: "", data_fim: "",
  });
  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorHTML, setEditorHTML] = useState("");
  const [editorContrato, setEditorContrato] = useState<any>(null);

  const { data: contratos, isLoading } = useContratos();
  const { data: alunos } = useAlunos();
  const { data: cursos } = useCursos();
  const { data: instrumentos } = useInstrumentos();
  const { data: escola } = useConfiguracoes();
  const createContrato = useCreateContrato();

  const matriculas = useMemo(() => contratos?.filter(c => c.tipo === "matricula") || [], [contratos]);
  const emprestimos = useMemo(() => contratos?.filter(c => c.tipo === "emprestimo") || [], [contratos]);

  const handleCreate = () => {
    if (!newContrato.aluno_id) return;
    createContrato.mutate({
      aluno_id: newContrato.aluno_id,
      curso_id: tipo === "matricula" ? newContrato.curso_id || undefined : undefined,
      instrumento_id: tipo === "emprestimo" ? newContrato.instrumento_id || undefined : undefined,
      tipo,
      data_inicio: newContrato.data_inicio || undefined,
      data_fim: newContrato.data_fim || undefined,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewContrato({ aluno_id: "", curso_id: "", instrumento_id: "", data_inicio: "", data_fim: "" });
      },
    });
  };

  const openEditor = (contrato: any) => {
    const html = generateContractHTML(contrato, escola);
    setEditorHTML(html);
    setEditorContrato(contrato);
    setEditorOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const renderContrato = (contrato: any) => {
    const aluno = (contrato as any).alunos;
    const curso = (contrato as any).cursos;
    const instrumento = (contrato as any).instrumentos;

    return (
      <motion.div key={contrato.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="interactive" className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {contrato.tipo === "matricula" ? <BookOpen className="w-4 h-4 text-primary" /> : <Guitar className="w-4 h-4 text-secondary" />}
                <p className="font-medium">{aluno?.nome || "Aluno"}</p>
              </div>
              {curso && <p className="text-sm text-muted-foreground">Curso: {curso.nome}</p>}
              {instrumento && <p className="text-sm text-muted-foreground">Instrumento: {instrumento.nome} {instrumento.marca}</p>}
              <p className="text-xs text-muted-foreground">
                {contrato.data_inicio && new Date(contrato.data_inicio).toLocaleDateString("pt-BR")}
                {contrato.data_fim && ` — ${new Date(contrato.data_fim).toLocaleDateString("pt-BR")}`}
              </p>
              <Badge variant={contrato.status === "ativo" ? "default" : "secondary"}>
                {contrato.status === "ativo" ? "Ativo" : "Encerrado"}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => openEditor(contrato)}>
                <Edit3 className="w-4 h-4 mr-1" />Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => printContract(generateContractHTML(contrato, escola))}>
                <Printer className="w-4 h-4 mr-1" />Imprimir
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos e Documentos</h1>
          <p className="text-muted-foreground">Geração automática de contratos e termos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Novo Contrato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Gerar Contrato</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v: "matricula" | "emprestimo") => setTipo(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matricula">Contrato de Matrícula</SelectItem>
                    <SelectItem value="emprestimo">Termo de Empréstimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Aluno *</Label>
                <Select value={newContrato.aluno_id} onValueChange={(v) => setNewContrato(p => ({ ...p, aluno_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{alunos?.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {tipo === "matricula" && (
                <div className="grid gap-2">
                  <Label>Curso</Label>
                  <Select value={newContrato.curso_id} onValueChange={(v) => setNewContrato(p => ({ ...p, curso_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{cursos?.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {tipo === "emprestimo" && (
                <div className="grid gap-2">
                  <Label>Instrumento</Label>
                  <Select value={newContrato.instrumento_id} onValueChange={(v) => setNewContrato(p => ({ ...p, instrumento_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{instrumentos?.map(i => <SelectItem key={i.id} value={i.id}>{i.nome} - {i.marca}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Início</Label>
                  <Input type="date" value={newContrato.data_inicio}
                    onChange={(e) => setNewContrato(p => ({ ...p, data_inicio: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Fim (opcional)</Label>
                  <Input type="date" value={newContrato.data_fim}
                    onChange={(e) => setNewContrato(p => ({ ...p, data_fim: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createContrato.isPending} className="w-full">
                {createContrato.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Gerar Contrato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="interactive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contratos de Matrícula</p>
              <p className="text-2xl font-bold">{matriculas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="interactive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Guitar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Termos de Empréstimo</p>
              <p className="text-2xl font-bold">{emprestimos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matricula">
        <TabsList>
          <TabsTrigger value="matricula">Matrículas ({matriculas.length})</TabsTrigger>
          <TabsTrigger value="emprestimo">Empréstimos ({emprestimos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="matricula" className="space-y-2 mt-4">
          {matriculas.map(renderContrato)}
          {matriculas.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum contrato de matrícula</p>}
        </TabsContent>
        <TabsContent value="emprestimo" className="space-y-2 mt-4">
          {emprestimos.map(renderContrato)}
          {emprestimos.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum termo de empréstimo</p>}
        </TabsContent>
      </Tabs>

      {/* Contract Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Editor de Contrato
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Edite o conteúdo do contrato abaixo antes de imprimir.</p>
          <div className="flex-1 min-h-0 overflow-hidden border border-border rounded-lg">
            <div
              contentEditable
              suppressContentEditableWarning
              className="p-4 h-[55vh] overflow-y-auto focus:outline-none bg-background text-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: editorHTML }}
              onBlur={(e) => setEditorHTML(e.currentTarget.innerHTML)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancelar</Button>
            <Button onClick={() => { printContract(editorHTML); }}>
              <Printer className="w-4 h-4 mr-2" />Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
