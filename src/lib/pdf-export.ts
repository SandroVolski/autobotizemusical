import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface FinancialSummary {
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
}

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],     // blue
  success: [22, 163, 74] as [number, number, number],      // green
  warning: [234, 179, 8] as [number, number, number],      // yellow
  danger: [220, 38, 38] as [number, number, number],       // red
  dark: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  headerBg: [37, 99, 235] as [number, number, number],
  altRow: [248, 250, 252] as [number, number, number],
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function capitalize(str: string | null | undefined): string {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number, number, number]) {
  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

export function generateFinancialPDF(data: FinancialSummary) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── HEADER BANNER ──
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 42, "F");

  // Subtle gradient effect (lighter strip)
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 36, pageW, 6, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.nomeEscola, margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Financeiro", margin, 26);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.mesAno, pageW - margin, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, pageW - margin, 26, { align: "right" });

  y = 50;

  // ── SUMMARY CARDS ──
  const cardW = (contentW - 8) / 4;
  const cardH = 26;
  const cards = [
    { label: "Total Recebido", value: formatCurrency(data.totalRecebido), sub: `${data.qtdPagos} pagamentos`, color: COLORS.success },
    { label: "A Receber", value: formatCurrency(data.totalPendente), sub: `${data.qtdPendentes} pendentes`, color: COLORS.warning },
    { label: "Inadimplência", value: formatCurrency(data.totalAtrasado), sub: `${data.qtdAtrasados} atrasados`, color: COLORS.danger },
    { label: "Ticket Médio", value: formatCurrency(data.ticketMedio), sub: `${data.qtdPagos + data.qtdPendentes + data.qtdAtrasados} total`, color: COLORS.primary },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 2.7);
    // Card background
    drawRoundedRect(doc, x, y, cardW, cardH, 3, COLORS.light);
    // Color indicator bar
    doc.setFillColor(...card.color);
    doc.roundedRect(x, y, cardW, 3, 3, 3, "F");
    doc.rect(x, y + 1.5, cardW, 1.5, "F"); // square off bottom of bar

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.label.toUpperCase(), x + 4, y + 10);

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, y + 17);

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.sub, x + 4, y + 22);
  });

  y += cardH + 10;

  // ── BREAKDOWN SECTION ──
  const halfW = (contentW - 4) / 2;

  // Revenue by Type
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Receita por Tipo", margin, y + 5);

  doc.setFontSize(11);
  doc.text("Receita por Método", margin + halfW + 4, y + 5);
  y += 9;

  if (data.receitaPorTipo.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin + halfW + 4 },
      tableWidth: halfW,
      head: [["Tipo", "Qtd", "Valor"]],
      body: data.receitaPorTipo.map(r => [capitalize(r.tipo), r.qtd.toString(), formatCurrency(r.valor)]),
      styles: { fontSize: 8, cellPadding: 2, font: "helvetica" },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: COLORS.altRow },
      columnStyles: { 0: { cellWidth: halfW * 0.45 }, 1: { halign: "center", cellWidth: halfW * 0.2 }, 2: { halign: "right", cellWidth: halfW * 0.35 } },
    });
  }

  if (data.receitaPorMetodo.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin + halfW + 4, right: margin },
      tableWidth: halfW,
      head: [["Método", "Qtd", "Valor"]],
      body: data.receitaPorMetodo.map(r => [capitalize(r.metodo), r.qtd.toString(), formatCurrency(r.valor)]),
      styles: { fontSize: 8, cellPadding: 2, font: "helvetica" },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold", fontSize: 7 },
      alternateRowStyles: { fillColor: COLORS.altRow },
      columnStyles: { 0: { cellWidth: halfW * 0.45 }, 1: { halign: "center", cellWidth: halfW * 0.2 }, 2: { halign: "right", cellWidth: halfW * 0.35 } },
    });
  }

  // Get the Y after both tables
  const finalY1 = (doc as any).lastAutoTable?.finalY || y + 20;
  y = finalY1 + 10;

  // ── PAYMENTS TABLE ──
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhamento de Pagamentos", margin, y + 5);
  y += 9;

  const tableRows = data.pagamentos.map(p => [
    p.aluno_nome || "—",
    capitalize(p.tipo),
    formatDate(p.data_vencimento),
    formatDate(p.data_pagamento),
    capitalize(p.metodo_pagamento),
    formatCurrency(p.valor),
    capitalize(p.status),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Aluno", "Tipo", "Vencimento", "Pagamento", "Método", "Valor", "Status"]],
    body: tableRows,
    styles: { fontSize: 7, cellPadding: 2, font: "helvetica", overflow: "ellipsize" },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: COLORS.altRow },
    columnStyles: {
      0: { cellWidth: 35 },
      5: { halign: "right", cellWidth: 22 },
      6: { cellWidth: 18 },
    },
    didParseCell(hookData) {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = String(hookData.cell.raw).toLowerCase();
        if (val === "pago") hookData.cell.styles.textColor = COLORS.success;
        else if (val === "atrasado") hookData.cell.styles.textColor = COLORS.danger;
        else if (val === "pendente") hookData.cell.styles.textColor = [180, 130, 0];
      }
    },
  });

  // ── FOOTER on each page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(data.nomeEscola, margin, pageH - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 7, { align: "right" });
  }

  doc.save(`relatorio_financeiro_${data.periodo}.pdf`);
}
