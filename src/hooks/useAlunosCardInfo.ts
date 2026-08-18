import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlunoCardInfo {
  cursos: { nome: string; instrumento: string | null }[];
  turmas: string[];
  pagamentos: {
    id: string;
    valor: number;
    status: string | null;
    referencia: string | null;
    data_vencimento: string | null;
    data_pagamento: string | null;
  }[];
}

/**
 * Dados resumidos exibidos no verso dos cards de aluno (modo grade):
 * cursos matriculados, turmas e os 3 últimos pagamentos.
 */
export function useAlunosCardInfo(enabled = true) {
  return useQuery({
    queryKey: ["alunos-card-info"],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const [matriculasRes, turmasRes, pagamentosRes] = await Promise.all([
        supabase
          .from("matriculas")
          .select("aluno_id, status, cursos(nome, instrumento)")
          .eq("status", "ativo"),
        supabase
          .from("turma_alunos")
          .select("aluno_id, status, turmas(nome)")
          .eq("status", "ativo"),
        supabase
          .from("pagamentos")
          .select("id, aluno_id, valor, status, referencia, data_vencimento, data_pagamento")
          .order("data_vencimento", { ascending: false })
          .limit(600),
      ]);

      const map = new Map<string, AlunoCardInfo>();
      const ensure = (id: string) => {
        if (!map.has(id)) map.set(id, { cursos: [], turmas: [], pagamentos: [] });
        return map.get(id)!;
      };

      (matriculasRes.data || []).forEach((m: any) => {
        if (!m.aluno_id || !m.cursos) return;
        ensure(m.aluno_id).cursos.push({ nome: m.cursos.nome, instrumento: m.cursos.instrumento });
      });

      (turmasRes.data || []).forEach((t: any) => {
        if (!t.aluno_id || !t.turmas?.nome) return;
        ensure(t.aluno_id).turmas.push(t.turmas.nome);
      });

      (pagamentosRes.data || []).forEach((p: any) => {
        if (!p.aluno_id) return;
        const entry = ensure(p.aluno_id);
        if (entry.pagamentos.length < 3) {
          entry.pagamentos.push({
            id: p.id,
            valor: Number(p.valor) || 0,
            status: p.status,
            referencia: p.referencia,
            data_vencimento: p.data_vencimento,
            data_pagamento: p.data_pagamento,
          });
        }
      });

      return map;
    },
  });
}
