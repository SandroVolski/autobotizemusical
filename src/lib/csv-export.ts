// CSV Export Utility

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; header: string }[]
): void {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.header).join(",");

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return "";
      }
      
      if (typeof value === "string") {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(",") || escaped.includes("\n") 
          ? `"${escaped}"` 
          : escaped;
      }
      
      if (value instanceof Date) {
        return value.toLocaleDateString("pt-BR");
      }
      
      if (typeof value === "number") {
        return value.toString();
      }
      
      if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
      }
      
      return String(value);
    }).join(",");
  });

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create blob and download
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

// Export alunos
export function exportAlunos(alunos: Array<{
  nome: string;
  email?: string | null;
  telefone?: string | null;
  status?: string | null;
  nivel?: string | null;
  data_matricula?: string | null;
}>) {
  exportToCSV(alunos, "alunos", [
    { key: "nome", header: "Nome" },
    { key: "email", header: "E-mail" },
    { key: "telefone", header: "Telefone" },
    { key: "status", header: "Status" },
    { key: "nivel", header: "Nível" },
    { key: "data_matricula", header: "Data de Matrícula" },
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
  exportToCSV(pagamentos, "pagamentos", [
    { key: "aluno_nome", header: "Aluno" },
    { key: "valor", header: "Valor" },
    { key: "data_vencimento", header: "Vencimento" },
    { key: "data_pagamento", header: "Data Pagamento" },
    { key: "status", header: "Status" },
    { key: "tipo", header: "Tipo" },
    { key: "metodo_pagamento", header: "Método" },
    { key: "referencia", header: "Referência" },
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
    { key: "nome", header: "Nome" },
    { key: "instrumento", header: "Instrumento" },
    { key: "nivel", header: "Nível" },
    { key: "duracao", header: "Duração" },
    { key: "valor_mensal", header: "Valor Mensal" },
    { key: "status", header: "Status" },
  ]);
}
