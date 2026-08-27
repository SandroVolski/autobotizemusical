import { supabase } from "@/integrations/supabase/client";

const PREFIX = "[Exemplo]";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Cria um conjunto pequeno de dados de demonstração para o usuário explorar o
 * sistema populado. Todos os registros são prefixados com "[Exemplo]".
 */
export async function seedDemoData() {
  const hoje = new Date();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .insert({
      nome: `${PREFIX} Violão Iniciante`,
      instrumento: "Violão",
      nivel: "Iniciante",
      descricao: "Curso de demonstração criado automaticamente.",
      valor_mensal: 250,
      modalidade: "Individual",
      status: "ativo",
    })
    .select()
    .single();
  if (cursoError) throw cursoError;

  const { error: profError } = await supabase.from("professores").insert({
    nome: `${PREFIX} Ana Souza`,
    email: "ana.exemplo@escola.com",
    telefone: "11999990001",
    especialidade: "Violão",
    instrumentos: ["Violão", "Guitarra"],
    status: "ativo",
  });
  if (profError) throw profError;

  const { error: instError } = await supabase.from("instrumentos").insert({
    nome: `${PREFIX} Violão Clássico`,
    tipo: "Cordas",
    marca: "Giannini",
    valor_patrimonio: 900,
    status: "disponivel",
  });
  if (instError) throw instError;

  const alunosDemo = [
    { nome: `${PREFIX} João Pereira`, apelido: "João", telefone: "11999990002" },
    { nome: `${PREFIX} Maria Lima`, apelido: "Mari", telefone: "11999990003" },
    { nome: `${PREFIX} Pedro Alves`, apelido: "Pedrinho", telefone: "11999990004" },
  ];

  const { data: alunos, error: alunosError } = await supabase
    .from("alunos")
    .insert(
      alunosDemo.map((a) => ({
        ...a,
        nivel: "Iniciante",
        status: "ativo",
        data_matricula: iso(hoje),
        dia_vencimento: 10,
      }))
    )
    .select();
  if (alunosError) throw alunosError;

  if (alunos?.length && curso) {
    await supabase.from("matriculas").insert(
      alunos.map((a) => ({
        aluno_id: a.id,
        curso_id: curso.id,
        data_inicio: iso(hoje),
        status: "ativa",
      }))
    );

    await supabase.from("pagamentos").insert(
      alunos.map((a, i) => ({
        aluno_id: a.id,
        valor: 250,
        tipo: "mensalidade",
        referencia: `${hoje.getMonth() + 1}/${hoje.getFullYear()}`,
        data_vencimento: iso(new Date(hoje.getFullYear(), hoje.getMonth(), 10)),
        data_pagamento: i === 0 ? iso(hoje) : null,
        status: i === 0 ? "pago" : "pendente",
        metodo_pagamento: i === 0 ? "pix" : null,
      }))
    );
  }
}
