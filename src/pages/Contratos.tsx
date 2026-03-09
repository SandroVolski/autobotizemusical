import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Plus, Loader2, Download, Printer, BookOpen, Guitar
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

function generateContractHTML(contrato: any, escola: any) {
  const aluno = contrato.alunos;
  const curso = contrato.cursos;
  const today = new Date().toLocaleDateString("pt-BR");

  if (contrato.tipo === "matricula") {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
        <h1 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
        <p style="text-align: center; color: #666;">${escola?.nome || "Escola de Música"}</p>
        <br/>
        <p><strong>CONTRATANTE:</strong> ${aluno?.responsavel_nome || aluno?.nome}</p>
        <p><strong>Endereço:</strong> ${aluno?.endereco || "—"}</p>
        <p><strong>Telefone:</strong> ${aluno?.telefone || "—"} | <strong>Email:</strong> ${aluno?.email || "—"}</p>
        <br/>
        <p><strong>ALUNO(A):</strong> ${aluno?.nome}</p>
        <p><strong>CURSO:</strong> ${curso?.nome || "—"}</p>
        <p><strong>VALOR MENSAL:</strong> ${curso?.valor_mensal ? `R$ ${Number(curso.valor_mensal).toFixed(2)}` : "A definir"}</p>
        <p><strong>INÍCIO:</strong> ${contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString("pt-BR") : today}</p>
        ${contrato.data_fim ? `<p><strong>TÉRMINO:</strong> ${new Date(contrato.data_fim).toLocaleDateString("pt-BR")}</p>` : ""}
        <br/>
        <h3>CLÁUSULAS</h3>
        <p>1. O presente contrato tem por objeto a prestação de serviços educacionais musicais.</p>
        <p>2. O pagamento deverá ser efetuado até o dia 10 de cada mês.</p>
        <p>3. A falta sem aviso prévio de 24h não gera direito a reposição.</p>
        <p>4. O cancelamento deve ser comunicado com 30 dias de antecedência.</p>
        <br/><br/>
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div style="text-align: center; border-top: 1px solid #333; padding-top: 5px; width: 45%;">CONTRATANTE</div>
          <div style="text-align: center; border-top: 1px solid #333; padding-top: 5px; width: 45%;">CONTRATADA</div>
        </div>
        <p style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">${today}</p>
      </div>
    `;
  }

  // Termo de empréstimo
  const instrumento = contrato.instrumentos;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
      <h1 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">TERMO DE EMPRÉSTIMO DE INSTRUMENTO</h1>
      <p style="text-align: center; color: #666;">${escola?.nome || "Escola de Música"}</p>
      <br/>
      <p><strong>RESPONSÁVEL:</strong> ${aluno?.responsavel_nome || aluno?.nome}</p>
      <p><strong>ALUNO(A):</strong> ${aluno?.nome}</p>
      <p><strong>Telefone:</strong> ${aluno?.telefone || "—"}</p>
      <br/>
      <h3>INSTRUMENTO</h3>
      <p><strong>Nome:</strong> ${instrumento?.nome || "—"}</p>
      <p><strong>Marca/Modelo:</strong> ${instrumento?.marca || "—"} ${instrumento?.modelo || ""}</p>
      <p><strong>Nº Série:</strong> ${instrumento?.numero_serie || "—"}</p>
      <br/>
      <p><strong>DATA DO EMPRÉSTIMO:</strong> ${contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString("pt-BR") : today}</p>
      ${contrato.data_fim ? `<p><strong>DEVOLUÇÃO PREVISTA:</strong> ${new Date(contrato.data_fim).toLocaleDateString("pt-BR")}</p>` : ""}
      <br/>
      <h3>TERMOS</h3>
      <p>1. O instrumento deverá ser devolvido nas mesmas condições em que foi emprestado.</p>
      <p>2. Danos ou perda serão de responsabilidade do contratante.</p>
      <p>3. O instrumento é de uso exclusivo do aluno acima identificado.</p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="text-align: center; border-top: 1px solid #333; padding-top: 5px; width: 45%;">RESPONSÁVEL</div>
        <div style="text-align: center; border-top: 1px solid #333; padding-top: 5px; width: 45%;">${escola?.nome || "ESCOLA"}</div>
      </div>
      <p style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">${today}</p>
    </div>
  `;
}

function printContract(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<html><head><title>Contrato</title></head><body>${html}</body></html>`);
  win.document.close();
  win.print();
}

export default function Contratos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipo, setTipo] = useState<"matricula" | "emprestimo">("matricula");
  const [newContrato, setNewContrato] = useState({
    aluno_id: "", curso_id: "", instrumento_id: "", data_inicio: "", data_fim: "",
  });

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
            <Button variant="outline" size="sm" onClick={() => printContract(generateContractHTML(contrato, escola))}>
              <Printer className="w-4 h-4 mr-1" />Imprimir
            </Button>
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
    </div>
  );
}
