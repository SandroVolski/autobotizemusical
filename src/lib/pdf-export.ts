import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── TYPES ──

interface PagamentoExport {
  aluno_nome?: string;
  valor: number;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  status?: string | null;
  tipo?: string | null;
  metodo_pagamento?: string | null;
  referencia?: string | null;
}

interface AlunoSummary {
  nome: string;
  status?: string | null;
  data_nascimento?: string | null;
  data_matricula?: string | null;
  telefone?: string | null;
  email?: string | null;
}

interface ProfessorSummary {
  nome: string;
  especialidade?: string | null;
  salario?: number | null;
  status?: string | null;
}

interface CursoSummary {
  nome: string;
  valor_mensal?: number | null;
  status?: string | null;
  instrumento?: string | null;
}

interface ContaPagarSummary {
  descricao: string;
  valor: number;
  data_vencimento?: string | null;
  status?: string | null;
  categoria?: string | null;
}

export interface FinancialSummary {
  nomeEscola: string;
  periodo: string;
  mesAno: string;
  totalRecebido: number;
  totalPendente: number;
  totalAtrasado: number;
  ticketMedio: number;
  qtdPagos: number;
  qtdPendentes: number;
  qtdAtrasados: number;
  pagamentos: PagamentoExport[];
  receitaPorTipo: { tipo: string; valor: number; qtd: number }[];
  receitaPorMetodo: { metodo: string; valor: number; qtd: number }[];
  // Extended data for comprehensive report
  alunos?: AlunoSummary[];
  professores?: ProfessorSummary[];
  cursos?: CursoSummary[];
  contasPagar?: ContaPagarSummary[];
}

// ── THEME COLORS (matching system HSL: primary 270 100% 50%) ──

const C = {
  primary: [128, 0, 255] as [number, number, number],       // hsl(270,100%,50%)
  primaryLight: [163, 64, 255] as [number, number, number],  // lighter purple
  primaryDark: [90, 0, 180] as [number, number, number],     // darker purple
  primaryBg: [245, 238, 255] as [number, number, number],    // very light purple bg
  primaryBg2: [235, 222, 255] as [number, number, number],   // light purple for alt rows
  success: [34, 197, 94] as [number, number, number],        // hsl(142,76%,45%)
  warning: [234, 179, 8] as [number, number, number],        // hsl(38,92%,50%)
  danger: [220, 38, 38] as [number, number, number],
  dark: [20, 20, 20] as [number, number, number],
  text: [50, 50, 50] as [number, number, number],
  muted: [130, 130, 130] as [number, number, number],
  light: [248, 245, 255] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  altRow: [250, 247, 255] as [number, number, number],
  cardBorder: [230, 220, 245] as [number, number, number],
  sectionBg: [252, 250, 255] as [number, number, number],
};

// ── HELPERS ──

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function cap(str: string | null | undefined): string {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pct(part: number, total: number): string {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

// ── DRAWING HELPERS ──

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number, number, number]) {
  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

function drawTopBar(doc: jsPDF, x: number, y: number, w: number, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 2.5, 2, 2, "F");
  doc.rect(x, y + 1, w, 1.5, "F");
}

function addPageFooter(doc: jsPDF, data: FinancialSummary) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 15;
  doc.setDrawColor(...C.cardBorder);
  doc.setLineWidth(0.3);
  doc.line(m, pageH - 14, pageW - m, pageH - 14);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.primary);
  doc.text(data.nomeEscola.toUpperCase().split("").join(" "), m, pageH - 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), pageW - m, pageH - 8, { align: "right" });
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, data: FinancialSummary): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 20) {
    doc.addPage();
    addPageFooter(doc, data);
    return 20;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, subtitle: string, y: number, margin: number): number {
  doc.setTextColor(...C.dark);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(subtitle, margin, y + 7);
  // Accent line
  doc.setFillColor(...C.primary);
  doc.rect(margin, y + 10, 30, 1.5, "F");
  return y + 18;
}

// ── PAGE 1: COVER ──

function drawCoverPage(doc: jsPDF, data: FinancialSummary) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Full purple background
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, pageH, "F");

  // Subtle lighter overlay rectangle for depth
  doc.setFillColor(...C.primaryLight);
  doc.rect(0, pageH * 0.65, pageW, pageH * 0.35, "F");

  // Brand name top-left
  doc.setTextColor(...C.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.nomeEscola.toUpperCase().split("").join("  "), 30, 40);

  // Main title
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório", 30, pageH * 0.38);
  doc.text("Financeiro", 30, pageH * 0.38 + 18);
  doc.setFontSize(22);
  doc.setFont("helvetica", "normal");
  doc.text("Geral", 30, pageH * 0.38 + 34);

  // Divider line
  doc.setDrawColor(255, 255, 255, 80);
  doc.setLineWidth(0.3);
  doc.line(30, pageH * 0.62, pageW - 30, pageH * 0.62);

  // School name and date at bottom
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.nomeEscola, 30, pageH * 0.72);

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  const dateObj = new Date();
  const dayStr = String(dateObj.getDate()).padStart(2, "0");
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const dateFormatted = `${dayStr}${monthNames[dateObj.getMonth()]}${dateObj.getFullYear()}`;
  doc.text(dateFormatted, 30, pageH * 0.82);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Período: ${data.mesAno}`, 30, pageH * 0.87);

  // Small tag
  doc.setFontSize(8);
  doc.text(`Gerado em ${dateObj.toLocaleDateString("pt-BR")} às ${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, 30, pageH * 0.91);
}

// ── PAGE 2: EXECUTIVE SUMMARY ──

function drawExecutiveSummary(doc: jsPDF, data: FinancialSummary) {
  const m = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - m * 2;
  let y = 20;

  y = drawSectionTitle(doc, "Visão Executiva", "Principais indicadores de performance", y, m);
  y += 4;

  // ── 6 KPI CARDS (3x2 grid) ──
  const totalGeral = data.totalRecebido + data.totalPendente + data.totalAtrasado;
  const lucroLiquido = data.totalRecebido - (data.contasPagar?.filter(c => c.status === "pago").reduce((a, c) => a + c.valor, 0) || 0);
  const despesasTotais = data.contasPagar?.reduce((a, c) => a + c.valor, 0) || 0;
  const margem = totalGeral > 0 ? ((lucroLiquido / totalGeral) * 100) : 0;

  const cards = [
    { label: "Receita Total", value: fmt(totalGeral), color: C.primary },
    { label: "Total Recebido", value: fmt(data.totalRecebido), color: C.success },
    { label: "Margem", value: margem.toFixed(1) + "%", color: C.primaryLight },
    { label: "Ticket Médio", value: fmt(data.ticketMedio), color: C.primary },
    { label: "Total Alunos", value: String(data.alunos?.length || 0), color: C.primaryLight },
    { label: "Aulas/Cursos", value: String(data.cursos?.length || 0), color: C.success },
  ];

  const cardW = (contentW - 8) / 3;
  const cardH = 30;
  cards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = m + col * (cardW + 4);
    const cy = y + row * (cardH + 4);

    drawRoundedRect(doc, x, cy, cardW, cardH, 3, C.light);
    drawTopBar(doc, x, cy, cardW, card.color);

    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 5, cy + 12);

    doc.setTextColor(...C.dark);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 5, cy + 22);
  });

  y += (cardH + 4) * 2 + 10;

  // ── REVENUE BREAKDOWN (side by side) ──
  const halfW = (contentW - 6) / 2;

  // Crescimento & Performance cards
  y = checkPageBreak(doc, y, 70, data);

  // Crescimento Card
  drawRoundedRect(doc, m, y, halfW, 55, 4, C.sectionBg);
  doc.setFillColor(...C.primary);
  doc.roundedRect(m, y, 3, 55, 2, 2, "F");
  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Crescimento", m + 10, y + 10);

  const alunosAtivos = data.alunos?.filter(a => a.status === "ativo").length || 0;
  const alunosTotal = data.alunos?.length || 0;
  const taxaRetencao = alunosTotal > 0 ? ((alunosAtivos / alunosTotal) * 100) : 0;

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.text("Alunos Ativos", m + 10, y + 22);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(String(alunosAtivos), m + 10, y + 30);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Taxa de Retenção", m + 10, y + 40);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(taxaRetencao.toFixed(1) + "%", m + 10, y + 48);

  // Performance Card
  const perfX = m + halfW + 6;
  drawRoundedRect(doc, perfX, y, halfW, 55, 4, C.sectionBg);
  doc.setFillColor(...C.success);
  doc.roundedRect(perfX, y, 3, 55, 2, 2, "F");
  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Performance", perfX + 10, y + 10);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Fluxo de Caixa", perfX + 10, y + 22);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.totalRecebido - despesasTotais), perfX + 10, y + 30);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Despesas", perfX + 10, y + 40);
  doc.setTextColor(...C.danger);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(despesasTotais), perfX + 10, y + 48);

  y += 65;

  // ── REVENUE BY TYPE & METHOD TABLES ──
  y = checkPageBreak(doc, y, 60, data);

  if (data.receitaPorTipo.length > 0) {
    doc.setTextColor(...C.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Receita por Tipo", m, y + 5);
    doc.text("Receita por Método", m + halfW + 6, y + 5);
    y += 9;

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m + halfW + 6 },
      tableWidth: halfW,
      head: [["Tipo", "Qtd", "Valor"]],
      body: data.receitaPorTipo.map(r => [cap(r.tipo), r.qtd.toString(), fmt(r.valor)]),
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 0: { cellWidth: halfW * 0.45 }, 1: { halign: "center", cellWidth: halfW * 0.2 }, 2: { halign: "right", cellWidth: halfW * 0.35 } },
    });
  }

  if (data.receitaPorMetodo.length > 0) {
    autoTable(doc, {
      startY: data.receitaPorTipo.length > 0 ? y : y + 9,
      margin: { left: m + halfW + 6, right: m },
      tableWidth: halfW,
      head: [["Método", "Qtd", "Valor"]],
      body: data.receitaPorMetodo.map(r => [cap(r.metodo), r.qtd.toString(), fmt(r.valor)]),
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 0: { cellWidth: halfW * 0.45 }, 1: { halign: "center", cellWidth: halfW * 0.2 }, 2: { halign: "right", cellWidth: halfW * 0.35 } },
    });
  }
}

// ── PAGE 3: FINANCIAL STATUS CARDS ──

function drawFinancialStatus(doc: jsPDF, data: FinancialSummary) {
  const m = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - m * 2;
  let y = 20;

  y = drawSectionTitle(doc, "Status Financeiro", "Detalhamento de recebimentos e inadimplência", y, m);
  y += 4;

  // 4 status cards
  const halfW = (contentW - 6) / 2;
  const statusCards = [
    { label: "Pagos", value: fmt(data.totalRecebido), sub: `${data.qtdPagos} pagamentos`, color: C.success, bg: [235, 255, 245] as [number, number, number] },
    { label: "Pendentes", value: fmt(data.totalPendente), sub: `${data.qtdPendentes} a vencer`, color: C.warning, bg: [255, 249, 230] as [number, number, number] },
    { label: "Inadimplentes", value: fmt(data.totalAtrasado), sub: `${data.qtdAtrasados} atrasados`, color: C.danger, bg: [255, 235, 235] as [number, number, number] },
    { label: "Ticket Médio", value: fmt(data.ticketMedio), sub: `${data.qtdPagos + data.qtdPendentes + data.qtdAtrasados} total`, color: C.primary, bg: C.primaryBg },
  ];

  statusCards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = m + col * (halfW + 6);
    const cy = y + row * 38;

    drawRoundedRect(doc, x, cy, halfW, 32, 4, card.bg);
    doc.setFillColor(...card.color);
    doc.roundedRect(x, cy, 3, 32, 2, 2, "F");

    doc.setTextColor(...C.muted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 10, cy + 10);

    doc.setTextColor(...C.dark);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 10, cy + 20);

    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.sub, x + 10, cy + 27);
  });

  y += 82;

  // ── CONSOLIDATED SUMMARY ──
  y = checkPageBreak(doc, y, 60, data);

  drawRoundedRect(doc, m, y, contentW, 50, 4, C.sectionBg);
  doc.setFillColor(...C.warning);
  doc.roundedRect(m, y, 3, 50, 2, 2, "F");

  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro Consolidado", m + 10, y + 10);

  const despesas = data.contasPagar?.reduce((a, c) => a + c.valor, 0) || 0;
  const lucro = data.totalRecebido - despesas;
  const margemLucro = data.totalRecebido > 0 ? ((lucro / data.totalRecebido) * 100) : 0;

  const summaryItems = [
    { label: "Receita Total", value: fmt(data.totalRecebido), color: C.success },
    { label: "Despesas Totais", value: fmt(despesas), color: C.danger },
    { label: "Lucro Líquido", value: fmt(lucro), color: lucro >= 0 ? C.success : C.danger },
    { label: "Margem de Lucro", value: margemLucro.toFixed(1) + "%", color: C.primary },
  ];

  const itemW = (contentW - 20) / 4;
  summaryItems.forEach((item, i) => {
    const x = m + 10 + i * itemW;
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x, y + 24);
    doc.setTextColor(...item.color);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, x, y + 34);
  });

  y += 60;

  // ── INSIGHTS ──
  y = checkPageBreak(doc, y, 50, data);

  drawRoundedRect(doc, m, y, contentW, 45, 4, [255, 252, 235] as [number, number, number]);
  doc.setFillColor(...C.warning);
  doc.roundedRect(m, y, 3, 45, 2, 2, "F");

  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Insights Inteligentes", m + 10, y + 10);

  doc.setTextColor(...C.text);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const insights = [];
  if (margemLucro < 20) insights.push(`Margem de lucro de ${margemLucro.toFixed(1)}% indica baixa rentabilidade.`);
  else insights.push(`Margem de lucro de ${margemLucro.toFixed(1)}% está saudável.`);

  const alunosAtivos = data.alunos?.filter(a => a.status === "ativo").length || 0;
  insights.push(`${alunosAtivos} alunos ativos de ${data.alunos?.length || 0} cadastrados.`);

  if (data.qtdAtrasados > 0) insights.push(`${data.qtdAtrasados} pagamentos atrasados totalizam ${fmt(data.totalAtrasado)}.`);
  else insights.push("Nenhum pagamento em atraso no período.");

  const profAtivos = data.professores?.filter(p => p.status === "ativo").length || 0;
  if (data.professores?.length) insights.push(`Equipe com ${profAtivos} professores ativos.`);

  insights.forEach((insight, i) => {
    doc.text(`—  ${insight}`, m + 10, y + 20 + i * 6);
  });

  return y + 55;
}

// ── PAGE 4: TEAM & STUDENTS ──

function drawTeamAndStudents(doc: jsPDF, data: FinancialSummary) {
  const m = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - m * 2;
  let y = 20;

  y = drawSectionTitle(doc, "Equipe e Alunos", "Visão geral da equipe e corpo discente", y, m);
  y += 4;

  // ── PROFESSORES TABLE ──
  if (data.professores && data.professores.length > 0) {
    const folhaTotal = data.professores.reduce((a, p) => a + (p.salario || 0), 0);
    const mediaSalarial = folhaTotal / data.professores.length;

    drawRoundedRect(doc, m, y, contentW, 28, 4, C.sectionBg);
    doc.setFillColor(...C.primary);
    doc.roundedRect(m, y, 3, 28, 2, 2, "F");
    doc.setTextColor(...C.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo da Equipe", m + 10, y + 10);

    const cols3 = (contentW - 20) / 3;
    [
      { label: "Total Professores", val: String(data.professores.length) },
      { label: "Folha Total", val: fmt(folhaTotal) },
      { label: "Média Salarial", val: fmt(mediaSalarial) },
    ].forEach((item, i) => {
      const x = m + 10 + i * cols3;
      doc.setTextColor(...C.muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, x, y + 17);
      doc.setTextColor(...C.primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(item.val, x, y + 24);
    });

    y += 34;

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Professor", "Especialidade", "Salário", "Status"]],
      body: data.professores.map(p => [p.nome, cap(p.especialidade), p.salario ? fmt(p.salario) : "—", cap(p.status)]),
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 2: { halign: "right" } },
      didParseCell(hookData) {
        if (hookData.section === "body" && hookData.column.index === 3) {
          const val = String(hookData.cell.raw).toLowerCase();
          if (val === "ativo") hookData.cell.styles.textColor = C.success;
          else if (val === "inativo") hookData.cell.styles.textColor = C.danger;
        }
      },
    });

    y = (doc as any).lastAutoTable?.finalY || y + 20;
    y += 10;
  }

  // ── ALUNOS SUMMARY ──
  y = checkPageBreak(doc, y, 50, data);

  if (data.alunos && data.alunos.length > 0) {
    const alunosAtivos = data.alunos.filter(a => a.status === "ativo").length;
    const alunosInativos = data.alunos.filter(a => a.status === "inativo").length;
    const alunosTrancados = data.alunos.filter(a => a.status === "trancado").length;

    drawRoundedRect(doc, m, y, contentW, 28, 4, C.sectionBg);
    doc.setFillColor(...C.success);
    doc.roundedRect(m, y, 3, 28, 2, 2, "F");
    doc.setTextColor(...C.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Análise de Alunos", m + 10, y + 10);

    const cols4 = (contentW - 20) / 4;
    [
      { label: "Total", val: String(data.alunos.length) },
      { label: "Ativos", val: String(alunosAtivos) },
      { label: "Inativos", val: String(alunosInativos) },
      { label: "Trancados", val: String(alunosTrancados) },
    ].forEach((item, i) => {
      const x = m + 10 + i * cols4;
      doc.setTextColor(...C.muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, x, y + 17);
      doc.setTextColor(...C.primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(item.val, x, y + 24);
    });

    y += 34;
  }
}

// ── PAGE 5: EXPENSES (CONTAS A PAGAR) ──

function drawExpenses(doc: jsPDF, data: FinancialSummary) {
  if (!data.contasPagar || data.contasPagar.length === 0) return;

  const m = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - m * 2;
  let y = 20;

  y = drawSectionTitle(doc, "Contas a Pagar", "Despesas e obrigações do período", y, m);
  y += 4;

  const pagas = data.contasPagar.filter(c => c.status === "pago");
  const pendentes = data.contasPagar.filter(c => c.status !== "pago");
  const totalPago = pagas.reduce((a, c) => a + c.valor, 0);
  const totalPendente = pendentes.reduce((a, c) => a + c.valor, 0);

  // Summary
  drawRoundedRect(doc, m, y, contentW, 28, 4, C.sectionBg);
  doc.setFillColor(...C.danger);
  doc.roundedRect(m, y, 3, 28, 2, 2, "F");

  const cols3 = (contentW - 20) / 3;
  [
    { label: "Total Despesas", val: fmt(totalPago + totalPendente), color: C.dark },
    { label: "Pagas", val: fmt(totalPago), color: C.success },
    { label: "Pendentes", val: fmt(totalPendente), color: C.danger },
  ].forEach((item, i) => {
    const x = m + 10 + i * cols3;
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x, y + 10);
    doc.setTextColor(...item.color);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.val, x, y + 20);
  });

  y += 34;

  // Table
  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [["Descrição", "Categoria", "Vencimento", "Valor", "Status"]],
    body: data.contasPagar.map(c => [c.descricao, cap(c.categoria), fmtDate(c.data_vencimento), fmt(c.valor), cap(c.status)]),
    styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: C.altRow },
    columnStyles: { 3: { halign: "right" } },
    didParseCell(hookData) {
      if (hookData.section === "body" && hookData.column.index === 4) {
        const val = String(hookData.cell.raw).toLowerCase();
        if (val === "pago" || val === "paga") hookData.cell.styles.textColor = C.success;
        else if (val === "atrasado" || val === "atrasada") hookData.cell.styles.textColor = C.danger;
        else if (val === "pendente") hookData.cell.styles.textColor = [180, 130, 0];
      }
    },
  });
}

// ── LAST PAGE: PAYMENT DETAILS ──

function drawPaymentDetails(doc: jsPDF, data: FinancialSummary) {
  const m = 15;
  let y = 20;

  y = drawSectionTitle(doc, "Detalhamento de Pagamentos", "Registro completo de todos os pagamentos do período", y, m);
  y += 4;

  if (data.pagamentos.length === 0) {
    drawRoundedRect(doc, m, y, doc.internal.pageSize.getWidth() - m * 2, 20, 4, C.sectionBg);
    doc.setTextColor(...C.muted);
    doc.setFontSize(10);
    doc.text("Nenhum pagamento registrado no período.", m + 10, y + 13);
    return;
  }

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [["Aluno", "Tipo", "Vencimento", "Pagamento", "Método", "Valor", "Status"]],
    body: data.pagamentos.map(p => [
      p.aluno_nome || "—",
      cap(p.tipo),
      fmtDate(p.data_vencimento),
      fmtDate(p.data_pagamento),
      cap(p.metodo_pagamento),
      fmt(p.valor),
      cap(p.status),
    ]),
    styles: { fontSize: 7, cellPadding: 2.5, font: "helvetica", overflow: "ellipsize" },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: C.altRow },
    columnStyles: {
      0: { cellWidth: 35 },
      5: { halign: "right", cellWidth: 22 },
      6: { cellWidth: 18 },
    },
    didParseCell(hookData) {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = String(hookData.cell.raw).toLowerCase();
        if (val === "pago") hookData.cell.styles.textColor = C.success;
        else if (val === "atrasado") hookData.cell.styles.textColor = C.danger;
        else if (val === "pendente") hookData.cell.styles.textColor = [180, 130, 0];
      }
    },
  });

  // Totals row
  const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
  const pageW = doc.internal.pageSize.getWidth();

  drawRoundedRect(doc, m, finalY + 4, pageW - m * 2, 18, 3, C.primaryBg);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Total de Pagamentos", m + 8, finalY + 14);
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.pagamentos.length} registros`, m + 60, finalY + 14);

  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Receita Total", pageW - m - 70, finalY + 14);
  doc.setTextColor(...C.primary);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.pagamentos.reduce((a, p) => a + p.valor, 0)), pageW - m - 8, finalY + 14, { align: "right" });
}

// ── MAIN EXPORT FUNCTION ──

export function generateFinancialPDF(data: FinancialSummary) {
  const doc = new jsPDF("p", "mm", "a4");

  // Page 1: Cover
  drawCoverPage(doc, data);

  // Page 2: Executive Summary
  doc.addPage();
  drawExecutiveSummary(doc, data);
  addPageFooter(doc, data);

  // Page 3: Financial Status
  doc.addPage();
  drawFinancialStatus(doc, data);
  addPageFooter(doc, data);

  // Page 4: Team & Students (if data available)
  if ((data.professores && data.professores.length > 0) || (data.alunos && data.alunos.length > 0)) {
    doc.addPage();
    drawTeamAndStudents(doc, data);
    addPageFooter(doc, data);
  }

  // Page 5: Expenses (if data available)
  if (data.contasPagar && data.contasPagar.length > 0) {
    doc.addPage();
    drawExpenses(doc, data);
    addPageFooter(doc, data);
  }

  // Page 6: Payment Details
  doc.addPage();
  drawPaymentDetails(doc, data);
  addPageFooter(doc, data);

  // Page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`Página ${i - 1} de ${totalPages - 1}`, pageW / 2, pageH - 8, { align: "center" });
  }

  doc.save(`relatorio_financeiro_${data.periodo}.pdf`);
}
