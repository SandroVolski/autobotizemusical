// CSV Export Utility — Professional formatting

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; header: string; format?: (v: unknown) => string }[]
): void {
  if (!data || data.length === 0) return;

  const sep = ";"; // semicolon for better Excel compatibility in pt-BR
  const headers = columns.map(col => `"${col.header}"`).join(sep);

  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (col.format) return `"${col.format(value)}"`;
      if (value === null || value === undefined) return '""';
      if (typeof value === "number") return `"${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}"`;
      if (typeof value === "boolean") return value ? '"Sim"' : '"Não"';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    }).join(sep)
  );

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDateBR(dateStr: unknown): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function formatCurrencyBR(val: unknown): string {
  const n = Number(val);
  if (isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function capitalize(str: unknown): string {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export alunos
export function exportAlunos(alunos: Array<{
  nome: string;
  email?: string | null;
  telefone?: string | null;
  status?: string | null;
  nivel?: string | null;
  data_matricula?: string | null;
  data_nascimento?: string | null;
  responsavel_nome?: string | null;
}>) {
  exportToCSV(alunos, "alunos", [
    { key: "nome", header: "Nome" },
    { key: "email", header: "E-mail" },
    { key: "telefone", header: "Telefone" },
    { key: "status", header: "Status", format: capitalize },
    { key: "nivel", header: "Nível", format: capitalize },
    { key: "data_matricula", header: "Data de Matrícula", format: formatDateBR },
    { key: "data_nascimento", header: "Data de Nascimento", format: formatDateBR },
    { key: "responsavel_nome", header: "Responsável" },
  ]);
}

// Export pagamentos
export function exportPagamentos(pagamentos: Array<{
  aluno_nome?: string;
  valor: number;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  status?: string | null;
  tipo?: string | null;
  metodo_pagamento?: string | null;
  referencia?: string | null;
}>) {
  exportToCSV(pagamentos, "pagamentos_financeiro", [
    { key: "aluno_nome", header: "Aluno" },
    { key: "referencia", header: "Referência" },
    { key: "tipo", header: "Tipo", format: capitalize },
    { key: "data_vencimento", header: "Vencimento", format: formatDateBR },
    { key: "data_pagamento", header: "Data Pagamento", format: formatDateBR },
    { key: "metodo_pagamento", header: "Método", format: (v) => capitalize(v)?.toUpperCase() || "" },
    { key: "valor", header: "Valor (R$)", format: formatCurrencyBR },
    { key: "status", header: "Status", format: capitalize },
  ]);
}

// Export cursos
export function exportCursos(cursos: Array<{
  nome: string;
  instrumento?: string | null;
  nivel?: string | null;
  duracao?: string | null;
  valor_mensal?: number | null;
  status?: string | null;
}>) {
  exportToCSV(cursos, "cursos", [
    { key: "nome", header: "Nome do Curso" },
    { key: "instrumento", header: "Instrumento", format: capitalize },
    { key: "nivel", header: "Nível", format: capitalize },
    { key: "duracao", header: "Duração" },
    { key: "valor_mensal", header: "Valor Mensal (R$)", format: formatCurrencyBR },
    { key: "status", header: "Status", format: capitalize },
  ]);
}
