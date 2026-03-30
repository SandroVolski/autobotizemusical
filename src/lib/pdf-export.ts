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
  alunos?: AlunoSummary[];
  professores?: ProfessorSummary[];
  cursos?: CursoSummary[];
  contasPagar?: ContaPagarSummary[];
}

// ── THEME ──
type RGB = [number, number, number];

const C = {
  primary: [128, 0, 255] as RGB,
  primaryLight: [163, 64, 255] as RGB,
  primarySoft: [200, 160, 255] as RGB,
  primaryBg: [245, 238, 255] as RGB,
  primaryBg2: [235, 222, 255] as RGB,
  success: [16, 185, 129] as RGB,
  successBg: [236, 253, 245] as RGB,
  warning: [245, 158, 11] as RGB,
  warningBg: [255, 251, 235] as RGB,
  danger: [239, 68, 68] as RGB,
  dangerBg: [254, 242, 242] as RGB,
  dark: [17, 24, 39] as RGB,
  text: [55, 65, 81] as RGB,
  muted: [156, 163, 175] as RGB,
  light: [249, 250, 251] as RGB,
  white: [255, 255, 255] as RGB,
  altRow: [250, 247, 255] as RGB,
  border: [229, 231, 235] as RGB,
  cardBg: [248, 246, 253] as RGB,
};

// ── HELPERS ──

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function cap(s: string | null | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── DRAWING PRIMITIVES ──

function roundRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: RGB) {
  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

function roundRectStroke(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, stroke: RGB) {
  doc.setDrawColor(...stroke);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, r, r, "S");
}

function gradientBar(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
}

// Geometric icon shapes (no emojis)
function drawIcon(doc: jsPDF, type: string, x: number, y: number, size: number, color: RGB) {
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;

  // Light circle background
  const bgColor: RGB = [
    Math.min(255, color[0] + 100),
    Math.min(255, color[1] + 100),
    Math.min(255, color[2] + 100),
  ];
  doc.setFillColor(...bgColor);
  doc.circle(cx, cy, s / 2 + 1, "F");

  doc.setFillColor(...color);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.6);

  switch (type) {
    case "money": // Dollar sign circle
      doc.circle(cx, cy, s / 2.5, "S");
      doc.setFontSize(s * 0.65);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text("$", cx, cy + s * 0.08, { align: "center" });
      break;
    case "chart": // Bar chart
      doc.rect(cx - s * 0.3, cy + s * 0.1, s * 0.15, s * 0.25, "F");
      doc.rect(cx - s * 0.08, cy - s * 0.15, s * 0.15, s * 0.5, "F");
      doc.rect(cx + s * 0.15, cy - s * 0.05, s * 0.15, s * 0.4, "F");
      break;
    case "percent": // Percentage
      doc.setFontSize(s * 0.55);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text("%", cx, cy + s * 0.08, { align: "center" });
      break;
    case "ticket": // Receipt
      doc.rect(cx - s * 0.2, cy - s * 0.25, s * 0.4, s * 0.5, "S");
      doc.line(cx - s * 0.1, cy - s * 0.08, cx + s * 0.1, cy - s * 0.08);
      doc.line(cx - s * 0.1, cy + s * 0.05, cx + s * 0.1, cy + s * 0.05);
      break;
    case "users": // People
      doc.circle(cx - s * 0.1, cy - s * 0.12, s * 0.1, "F");
      doc.circle(cx + s * 0.15, cy - s * 0.12, s * 0.08, "F");
      doc.setFillColor(...color);
      doc.roundedRect(cx - s * 0.25, cy + s * 0.02, s * 0.3, s * 0.2, 2, 2, "F");
      doc.roundedRect(cx + s * 0.02, cy + s * 0.05, s * 0.25, s * 0.17, 2, 2, "F");
      break;
    case "music": // Music note
      doc.circle(cx - s * 0.08, cy + s * 0.12, s * 0.1, "F");
      doc.rect(cx + s * 0.01, cy - s * 0.25, s * 0.05, s * 0.38, "F");
      doc.rect(cx + s * 0.01, cy - s * 0.25, s * 0.18, s * 0.05, "F");
      break;
    case "wallet": // Wallet
      doc.roundedRect(cx - s * 0.25, cy - s * 0.15, s * 0.5, s * 0.35, 2, 2, "S");
      doc.circle(cx + s * 0.12, cy, s * 0.05, "F");
      break;
    case "arrow-up": // Trending up
      doc.line(cx - s * 0.2, cy + s * 0.15, cx, cy - s * 0.15);
      doc.line(cx, cy - s * 0.15, cx + s * 0.2, cy);
      doc.line(cx + s * 0.05, cy - s * 0.15, cx + s * 0.2, cy - s * 0.15);
      doc.line(cx + s * 0.2, cy - s * 0.15, cx + s * 0.2, cy);
      break;
    case "shield": // Shield/check
      doc.setFontSize(s * 0.6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text("✓", cx, cy + s * 0.08, { align: "center" });
      break;
    case "alert": // Warning triangle
      doc.setFontSize(s * 0.6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      doc.text("!", cx, cy + s * 0.1, { align: "center" });
      break;
    default:
      doc.circle(cx, cy, s * 0.15, "F");
  }
}

function addPageFooter(doc: jsPDF, data: FinancialSummary) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(m, ph - 15, pw - m, ph - 15);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.primary);
  doc.text(data.nomeEscola.toUpperCase(), m, ph - 9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), pw - m, ph - 9, { align: "right" });
}

function checkPage(doc: jsPDF, y: number, need: number, data: FinancialSummary): number {
  if (y + need > doc.internal.pageSize.getHeight() - 22) {
    doc.addPage();
    addPageFooter(doc, data);
    return 25;
  }
  return y;
}

function sectionHeader(doc: jsPDF, title: string, subtitle: string, y: number, m: number): number {
  doc.setTextColor(...C.dark);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, m, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(subtitle, m, y + 7);
  // Purple accent underline
  doc.setFillColor(...C.primary);
  doc.roundedRect(m, y + 10, 35, 2, 1, 1, "F");
  return y + 20;
}

// ── COVER PAGE ──

function drawCover(doc: jsPDF, data: FinancialSummary) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Full purple background
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pw, ph, "F");

  // Subtle geometric decoration — large translucent circle
  doc.setFillColor(255, 255, 255);
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
  doc.circle(pw * 0.75, ph * 0.25, 120, "F");
  doc.circle(pw * 0.2, ph * 0.8, 80, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Top section — brand
  doc.setTextColor(...C.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("RELATÓRIO FINANCEIRO", 30, 35);

  // Thin horizontal line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.line(30, 42, pw - 30, 42);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Main title block — centered vertically
  const titleY = ph * 0.38;
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório", 30, titleY);
  doc.setFontSize(48);
  doc.text("Financeiro", 30, titleY + 20);
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.setGState(new (doc as any).GState({ opacity: 0.7 }));
  doc.text("Geral", 30, titleY + 36);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Bottom section with school info
  const bottomY = ph * 0.72;

  // Thin line separator
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
  doc.line(30, bottomY - 15, pw - 30, bottomY - 15);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.nomeEscola, 30, bottomY);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
  doc.text(`Período: ${data.mesAno}`, 30, bottomY + 10);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Date block
  const dateObj = new Date();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setGState(new (doc as any).GState({ opacity: 0.6 }));
  doc.text(`Gerado em ${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]} de ${dateObj.getFullYear()}`, 30, bottomY + 20);
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Bottom right — decorative accent rectangle
  doc.setFillColor(...C.primaryLight);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.roundedRect(pw - 60, ph - 50, 40, 30, 4, 4, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
}

// ── EXECUTIVE VISION PAGE ──

function drawExecutive(doc: jsPDF, data: FinancialSummary) {
  const m = 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;
  let y = 25;

  y = sectionHeader(doc, "Visão Executiva", "Principais indicadores de performance do período", y, m);
  y += 6;

  // ── 6 KPI Cards in 3x2 grid with icons ──
  const totalGeral = data.totalRecebido + data.totalPendente + data.totalAtrasado;
  const despesas = data.contasPagar?.filter(c => c.status === "pago").reduce((a, c) => a + c.valor, 0) || 0;
  const lucro = data.totalRecebido - despesas;
  const margem = totalGeral > 0 ? ((lucro / totalGeral) * 100) : 0;

  const kpis = [
    { icon: "money", label: "Receita Total", value: fmt(totalGeral), color: C.primary },
    { icon: "chart", label: "Lucro Líquido", value: fmt(lucro), color: C.success },
    { icon: "percent", label: "Margem", value: margem.toFixed(1) + "%", color: C.primary },
    { icon: "ticket", label: "Ticket Médio", value: fmt(data.ticketMedio), color: C.primary },
    { icon: "users", label: "Total Alunos", value: String(data.alunos?.length || 0), color: C.primaryLight },
    { icon: "music", label: "Cursos Ativos", value: String(data.cursos?.filter(c => c.status === "ativo").length || data.cursos?.length || 0), color: C.success },
  ];

  const cardW = (cw - 12) / 3;
  const cardH = 42;

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = m + col * (cardW + 6);
    const cy = y + row * (cardH + 6);

    // Card background
    roundRect(doc, cx, cy, cardW, cardH, 4, C.cardBg);
    roundRectStroke(doc, cx, cy, cardW, cardH, 4, C.border);

    // Icon
    drawIcon(doc, kpi.icon, cx + 6, cy + 5, 10, kpi.color);

    // Label
    doc.setTextColor(...C.muted);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.label, cx + 8, cy + 25);

    // Value
    doc.setTextColor(...C.dark);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.value, cx + 8, cy + 35);
  });

  y += (cardH + 6) * 2 + 10;

  // ── BAR CHART: Monthly revenue simulation ──
  y = checkPage(doc, y, 75, data);

  roundRect(doc, m, y, cw, 68, 5, C.white);
  roundRectStroke(doc, m, y, cw, 68, 5, C.border);

  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Composição da Receita", m + 10, y + 12);

  // Draw bar chart using receitaPorTipo
  const barData = data.receitaPorTipo.length > 0 ? data.receitaPorTipo : [{ tipo: "Mensalidade", valor: data.totalRecebido, qtd: data.qtdPagos }];
  const maxVal = Math.max(...barData.map(d => d.valor), 1);
  const barAreaX = m + 15;
  const barAreaW = cw - 30;
  const barAreaY = y + 50;
  const barMaxH = 28;
  const barW = Math.min(25, (barAreaW / barData.length) * 0.6);
  const barGap = barAreaW / barData.length;

  // Gridlines
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.15);
  for (let i = 0; i <= 3; i++) {
    const gy = barAreaY - (barMaxH * i / 3);
    doc.line(barAreaX, gy, barAreaX + barAreaW, gy);
  }

  barData.forEach((item, i) => {
    const bx = barAreaX + i * barGap + (barGap - barW) / 2;
    const bh = (item.valor / maxVal) * barMaxH;
    const by = barAreaY - bh;

    // Bar with gradient effect (two overlapping rects)
    doc.setFillColor(...C.primaryLight);
    doc.roundedRect(bx, by, barW, bh, 2, 2, "F");
    doc.setFillColor(...C.primary);
    doc.roundedRect(bx, by, barW * 0.6, bh, 2, 2, "F");

    // Label below
    doc.setTextColor(...C.muted);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    const label = cap(item.tipo);
    doc.text(label.substring(0, 10), bx + barW / 2, barAreaY + 5, { align: "center" });

    // Value above
    doc.setTextColor(...C.primary);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(item.valor), bx + barW / 2, by - 2, { align: "center" });
  });

  y += 78;

  // ── GROWTH + PERFORMANCE SIDE BY SIDE ──
  y = checkPage(doc, y, 60, data);

  const halfW = (cw - 8) / 2;

  // Growth card
  roundRect(doc, m, y, halfW, 52, 5, C.white);
  roundRectStroke(doc, m, y, halfW, 52, 5, C.border);
  doc.setFillColor(...C.primary);
  doc.roundedRect(m, y, 3, 52, 2, 2, "F");

  drawIcon(doc, "arrow-up", m + 8, y + 6, 8, C.primary);
  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Crescimento", m + 22, y + 14);

  const alunosAtivos = data.alunos?.filter(a => a.status === "ativo").length || 0;
  const alunosTotal = data.alunos?.length || 0;
  const taxa = alunosTotal > 0 ? ((alunosAtivos / alunosTotal) * 100) : 0;

  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Alunos Ativos", m + 10, y + 26);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(String(alunosAtivos), m + 10, y + 34);

  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Taxa de Retenção", m + 10, y + 42);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(taxa.toFixed(1) + "%", m + 10, y + 50);

  // Performance card
  const px = m + halfW + 8;
  roundRect(doc, px, y, halfW, 52, 5, C.white);
  roundRectStroke(doc, px, y, halfW, 52, 5, C.border);
  doc.setFillColor(...C.success);
  doc.roundedRect(px, y, 3, 52, 2, 2, "F");

  drawIcon(doc, "wallet", px + 8, y + 6, 8, C.success);
  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Performance", px + 22, y + 14);

  const despesaTotal = data.contasPagar?.reduce((a, c) => a + c.valor, 0) || 0;

  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Fluxo de Caixa", px + 10, y + 26);
  doc.setTextColor(...C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.totalRecebido - despesaTotal), px + 10, y + 34);

  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Despesas", px + 10, y + 42);
  doc.setTextColor(...C.danger);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(despesaTotal), px + 10, y + 50);
}

// ── FINANCIAL STATUS PAGE ──

function drawFinancialStatus(doc: jsPDF, data: FinancialSummary) {
  const m = 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;
  let y = 25;

  y = sectionHeader(doc, "Status Financeiro", "Detalhamento de recebimentos e inadimplência", y, m);
  y += 6;

  // ── 4 colored status cards (2x2) ──
  const halfW = (cw - 8) / 2;
  const cards = [
    { label: "Recebido", value: fmt(data.totalRecebido), sub: `${data.qtdPagos} pagamentos`, color: C.success, bg: C.successBg, iconType: "shield" },
    { label: "Pendente", value: fmt(data.totalPendente), sub: `${data.qtdPendentes} a vencer`, color: C.warning, bg: C.warningBg, iconType: "alert" },
    { label: "Inadimplente", value: fmt(data.totalAtrasado), sub: `${data.qtdAtrasados} atrasados`, color: C.danger, bg: C.dangerBg, iconType: "alert" },
    { label: "Ticket Médio", value: fmt(data.ticketMedio), sub: `${data.qtdPagos + data.qtdPendentes + data.qtdAtrasados} total`, color: C.primary, bg: C.primaryBg, iconType: "ticket" },
  ];

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = m + col * (halfW + 8);
    const cy = y + row * 40;

    roundRect(doc, cx, cy, halfW, 34, 5, card.bg);
    doc.setFillColor(...card.color);
    doc.roundedRect(cx, cy, 3, 34, 2, 2, "F");

    drawIcon(doc, card.iconType, cx + 8, cy + 4, 8, card.color);

    doc.setTextColor(...C.muted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, cx + 22, cy + 12);

    doc.setTextColor(...C.dark);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, cx + 10, cy + 24);

    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.sub, cx + 10, cy + 30);
  });

  y += 86;

  // ── Consolidated Summary Card ──
  y = checkPage(doc, y, 55, data);

  roundRect(doc, m, y, cw, 48, 5, C.white);
  roundRectStroke(doc, m, y, cw, 48, 5, C.border);
  doc.setFillColor(...C.primary);
  doc.roundedRect(m, y, cw, 3, 2, 2, "F");

  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro Consolidado", m + 10, y + 14);

  const despesas = data.contasPagar?.reduce((a, c) => a + c.valor, 0) || 0;
  const lucro = data.totalRecebido - despesas;
  const margemLucro = data.totalRecebido > 0 ? ((lucro / data.totalRecebido) * 100) : 0;

  const items = [
    { label: "Receita Total", value: fmt(data.totalRecebido), color: C.success },
    { label: "Despesas Totais", value: fmt(despesas), color: C.danger },
    { label: "Lucro Líquido", value: fmt(lucro), color: lucro >= 0 ? C.success : C.danger },
    { label: "Margem de Lucro", value: margemLucro.toFixed(1) + "%", color: C.primary },
  ];

  const itemW = (cw - 20) / 4;
  items.forEach((item, i) => {
    const ix = m + 10 + i * itemW;
    // Separator lines between items
    if (i > 0) {
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(ix - 3, y + 20, ix - 3, y + 42);
    }
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, ix, y + 26);
    doc.setTextColor(...item.color);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, ix, y + 38);
  });

  y += 58;

  // ── Insights Card ──
  y = checkPage(doc, y, 50, data);

  roundRect(doc, m, y, cw, 48, 5, C.warningBg);
  doc.setFillColor(...C.warning);
  doc.roundedRect(m, y, 3, 48, 2, 2, "F");

  drawIcon(doc, "chart", m + 8, y + 4, 8, C.warning);
  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Insights Inteligentes", m + 22, y + 12);

  doc.setTextColor(...C.text);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const insights: string[] = [];
  if (margemLucro < 20) insights.push(`Margem de lucro de ${margemLucro.toFixed(1)}% indica necessidade de atenção.`);
  else insights.push(`Margem de lucro de ${margemLucro.toFixed(1)}% está em nível saudável.`);

  insights.push(`${alunosAtivos(data)} alunos ativos de ${data.alunos?.length || 0} cadastrados.`);

  if (data.qtdAtrasados > 0) insights.push(`${data.qtdAtrasados} pagamentos atrasados totalizam ${fmt(data.totalAtrasado)}.`);
  else insights.push("Nenhum pagamento em atraso no período.");

  if (data.professores?.length) {
    const profAtivos = data.professores.filter(p => p.status === "ativo").length;
    insights.push(`Equipe com ${profAtivos} professores ativos.`);
  }

  insights.forEach((insight, i) => {
    doc.text(`—  ${insight}`, m + 10, y + 22 + i * 6.5);
  });
}

function alunosAtivos(data: FinancialSummary): number {
  return data.alunos?.filter(a => a.status === "ativo").length || 0;
}

// ── TEAM & STUDENTS PAGE ──

function drawTeam(doc: jsPDF, data: FinancialSummary) {
  const m = 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;
  let y = 25;

  y = sectionHeader(doc, "Equipe e Folha de Pagamento", "Valores referentes ao período atual", y, m);
  y += 6;

  // ── Professors ──
  if (data.professores && data.professores.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Professor", "Especialidade", "Salário", "Status"]],
      body: data.professores.map(p => [p.nome, cap(p.especialidade), p.salario ? fmt(p.salario) : "—", cap(p.status)]),
      styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 2: { halign: "right" } },
      didParseCell(h) {
        if (h.section === "body" && h.column.index === 3) {
          const v = String(h.cell.raw).toLowerCase();
          if (v === "ativo") h.cell.styles.textColor = C.success;
          else if (v === "inativo") h.cell.styles.textColor = C.danger;
        }
      },
    });
    y = (doc as any).lastAutoTable?.finalY || y + 20;
    y += 10;
  } else {
    roundRect(doc, m, y, cw, 22, 4, C.cardBg);
    roundRectStroke(doc, m, y, cw, 22, 4, C.border);
    doc.setTextColor(...C.muted);
    doc.setFontSize(9);
    doc.text("Nenhum professor cadastrado", m + 10, y + 14);
    y += 30;
  }

  // Payroll summary card
  y = checkPage(doc, y, 35, data);
  const folha = data.professores?.reduce((a, p) => a + (p.salario || 0), 0) || 0;
  const media = data.professores?.length ? folha / data.professores.length : 0;

  roundRect(doc, m, y, cw, 30, 5, C.cardBg);
  roundRectStroke(doc, m, y, cw, 30, 5, C.border);
  doc.setFillColor(...C.warning);
  doc.roundedRect(m, y, 3, 30, 2, 2, "F");

  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da Folha de Pagamento", m + 10, y + 10);

  const cols = (cw - 20) / 3;
  [
    { label: "Total Professores", val: String(data.professores?.length || 0) },
    { label: "Folha Total", val: fmt(folha) },
    { label: "Média Salarial", val: fmt(media) },
  ].forEach((item, i) => {
    const ix = m + 10 + i * cols;
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, ix, y + 18);
    doc.setTextColor(...C.primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.val, ix, y + 25);
  });

  y += 40;

  // ── Students Analysis ──
  y = checkPage(doc, y, 60, data);

  if (data.alunos && data.alunos.length > 0) {
    const ativos = data.alunos.filter(a => a.status === "ativo").length;
    const inativos = data.alunos.filter(a => a.status === "inativo").length;
    const trancados = data.alunos.filter(a => a.status === "trancado").length;

    // Analysis cards side by side
    const halfW = (cw - 8) / 2;

    // Left: Student counts
    roundRect(doc, m, y, halfW, 60, 5, C.white);
    roundRectStroke(doc, m, y, halfW, 60, 5, C.border);
    doc.setFillColor(...C.primary);
    doc.roundedRect(m, y, 3, 60, 2, 2, "F");

    drawIcon(doc, "users", m + 8, y + 4, 8, C.primary);
    doc.setTextColor(...C.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Análise de Alunos", m + 22, y + 12);

    const studentStats = [
      { label: "Total de Alunos", val: String(data.alunos.length) },
      { label: "Ativos", val: String(ativos) },
      { label: "Inativos", val: String(inativos) },
      { label: "Trancados", val: String(trancados) },
    ];

    studentStats.forEach((s, i) => {
      const sy = y + 20 + i * 10;
      doc.setTextColor(...C.muted);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(s.label, m + 10, sy);
      doc.setTextColor(...C.dark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(s.val, m + 10, sy + 5);
    });

    // Right: Courses
    const rx = m + halfW + 8;
    roundRect(doc, rx, y, halfW, 60, 5, C.white);
    roundRectStroke(doc, rx, y, halfW, 60, 5, C.border);
    doc.setFillColor(...C.success);
    doc.roundedRect(rx, y, 3, 60, 2, 2, "F");

    drawIcon(doc, "music", rx + 8, y + 4, 8, C.success);
    doc.setTextColor(...C.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Cursos e Instrumentos", rx + 22, y + 12);

    if (data.cursos && data.cursos.length > 0) {
      data.cursos.slice(0, 4).forEach((curso, i) => {
        const cy2 = y + 22 + i * 10;
        doc.setTextColor(...C.text);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(curso.nome, rx + 10, cy2);
        if (curso.valor_mensal) {
          doc.setTextColor(...C.primary);
          doc.setFont("helvetica", "bold");
          doc.text(fmt(curso.valor_mensal), rx + halfW - 15, cy2, { align: "right" });
        }
      });
    } else {
      doc.setTextColor(...C.muted);
      doc.setFontSize(8);
      doc.text("Nenhum curso registrado", rx + 10, y + 28);
    }
  }
}

// ── EXPENSES PAGE ──

function drawExpenses(doc: jsPDF, data: FinancialSummary) {
  if (!data.contasPagar || data.contasPagar.length === 0) return;

  const m = 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;
  let y = 25;

  y = sectionHeader(doc, "Contas a Pagar", "Despesas e obrigações do período", y, m);
  y += 6;

  // Summary
  const pagas = data.contasPagar.filter(c => c.status === "pago");
  const pend = data.contasPagar.filter(c => c.status !== "pago");
  const tPago = pagas.reduce((a, c) => a + c.valor, 0);
  const tPend = pend.reduce((a, c) => a + c.valor, 0);

  roundRect(doc, m, y, cw, 30, 5, C.cardBg);
  roundRectStroke(doc, m, y, cw, 30, 5, C.border);
  doc.setFillColor(...C.danger);
  doc.roundedRect(m, y, 3, 30, 2, 2, "F");

  const cols3 = (cw - 20) / 3;
  [
    { label: "Total Despesas", val: fmt(tPago + tPend), color: C.dark },
    { label: "Pagas", val: fmt(tPago), color: C.success },
    { label: "Pendentes", val: fmt(tPend), color: C.danger },
  ].forEach((item, i) => {
    const ix = m + 10 + i * cols3;
    doc.setTextColor(...C.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, ix, y + 10);
    doc.setTextColor(...item.color);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(item.val, ix, y + 22);
  });

  y += 38;

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [["Descrição", "Categoria", "Vencimento", "Valor", "Status"]],
    body: data.contasPagar.map(c => [c.descricao, cap(c.categoria), fmtDate(c.data_vencimento), fmt(c.valor), cap(c.status)]),
    styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: C.altRow },
    columnStyles: { 3: { halign: "right" } },
    didParseCell(h) {
      if (h.section === "body" && h.column.index === 4) {
        const v = String(h.cell.raw).toLowerCase();
        if (v === "pago" || v === "paga") h.cell.styles.textColor = C.success;
        else if (v === "atrasado" || v === "atrasada") h.cell.styles.textColor = C.danger;
        else if (v === "pendente") h.cell.styles.textColor = [180, 130, 0];
      }
    },
  });
}

// ── PAYMENT DETAILS PAGE ──

function drawPayments(doc: jsPDF, data: FinancialSummary) {
  const m = 20;
  let y = 25;

  y = sectionHeader(doc, "Detalhamento de Pagamentos", "Registro completo de todos os pagamentos do período", y, m);
  y += 6;

  if (data.pagamentos.length === 0) {
    const cw = doc.internal.pageSize.getWidth() - m * 2;
    roundRect(doc, m, y, cw, 22, 4, C.cardBg);
    doc.setTextColor(...C.muted);
    doc.setFontSize(9);
    doc.text("Nenhum pagamento registrado no período.", m + 10, y + 14);
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
    styles: { fontSize: 7.5, cellPadding: 2.5, font: "helvetica", overflow: "ellipsize" },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: C.altRow },
    columnStyles: {
      0: { cellWidth: 32 },
      5: { halign: "right", cellWidth: 22 },
      6: { cellWidth: 18 },
    },
    didParseCell(h) {
      if (h.section === "body" && h.column.index === 6) {
        const v = String(h.cell.raw).toLowerCase();
        if (v === "pago") h.cell.styles.textColor = C.success;
        else if (v === "atrasado") h.cell.styles.textColor = C.danger;
        else if (v === "pendente") h.cell.styles.textColor = [180, 130, 0];
      }
    },
  });

  // Totals row
  const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;

  roundRect(doc, m, finalY + 4, cw, 20, 4, C.primaryBg);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Total de Pagamentos", m + 10, finalY + 16);
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.pagamentos.length} registros`, m + 60, finalY + 16);

  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text("Receita Total", pw - m - 65, finalY + 16);
  doc.setTextColor(...C.primary);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.pagamentos.reduce((a, p) => a + p.valor, 0)), pw - m - 8, finalY + 16, { align: "right" });
}

// ── REVENUE BREAKDOWN PAGE ──

function drawRevenueBreakdown(doc: jsPDF, data: FinancialSummary) {
  const m = 20;
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - m * 2;
  let y = 25;

  y = sectionHeader(doc, "Receita por Categoria", "Análise detalhada por tipo e método de pagamento", y, m);
  y += 6;

  const halfW = (cw - 8) / 2;

  if (data.receitaPorTipo.length > 0) {
    doc.setTextColor(...C.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Por Tipo", m, y + 5);
    doc.text("Por Método", m + halfW + 8, y + 5);
    y += 9;

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m + halfW + 8 },
      tableWidth: halfW,
      head: [["Tipo", "Qtd", "Valor"]],
      body: data.receitaPorTipo.map(r => [cap(r.tipo), r.qtd.toString(), fmt(r.valor)]),
      styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" } },
    });
  }

  if (data.receitaPorMetodo.length > 0) {
    autoTable(doc, {
      startY: data.receitaPorTipo.length > 0 ? y : y + 9,
      margin: { left: m + halfW + 8, right: m },
      tableWidth: halfW,
      head: [["Método", "Qtd", "Valor"]],
      body: data.receitaPorMetodo.map(r => [cap(r.metodo), r.qtd.toString(), fmt(r.valor)]),
      styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.altRow },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" } },
    });
  }
}

// ── MAIN EXPORT ──

export function generateFinancialPDF(data: FinancialSummary) {
  const doc = new jsPDF("p", "mm", "a4");

  // Page 1: Cover
  drawCover(doc, data);

  // Page 2: Executive
  doc.addPage();
  drawExecutive(doc, data);
  addPageFooter(doc, data);

  // Page 3: Financial Status
  doc.addPage();
  drawFinancialStatus(doc, data);
  addPageFooter(doc, data);

  // Page 4: Revenue Breakdown
  if (data.receitaPorTipo.length > 0 || data.receitaPorMetodo.length > 0) {
    doc.addPage();
    drawRevenueBreakdown(doc, data);
    addPageFooter(doc, data);
  }

  // Page 5: Team & Students
  if ((data.professores && data.professores.length > 0) || (data.alunos && data.alunos.length > 0)) {
    doc.addPage();
    drawTeam(doc, data);
    addPageFooter(doc, data);
  }

  // Page 6: Expenses
  if (data.contasPagar && data.contasPagar.length > 0) {
    doc.addPage();
    drawExpenses(doc, data);
    addPageFooter(doc, data);
  }

  // Page 7: Payment Details
  doc.addPage();
  drawPayments(doc, data);
  addPageFooter(doc, data);

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`Página ${i - 1} de ${total - 1}`, pw / 2, ph - 9, { align: "center" });
  }

  doc.save(`relatorio_financeiro_${data.periodo}.pdf`);
}
