import { z } from "zod";

// Aluno validation schema
export const alunoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().max(20, "Telefone muito longo").optional(),
  data_nascimento: z.string().optional(),
  responsavel_nome: z.string().max(200, "Nome muito longo").optional(),
  responsavel_telefone: z.string().max(20, "Telefone muito longo").optional(),
  endereco: z.string().max(500, "Endereço muito longo").optional(),
  nivel: z.string().optional(),
  objetivo: z.string().max(1000, "Objetivo muito longo").optional(),
  observacoes: z.string().max(2000, "Observações muito longas").optional(),
});

export type AlunoInput = z.infer<typeof alunoSchema>;

// Professor validation schema
export const professorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().max(20, "Telefone muito longo").optional(),
  especialidade: z.string().max(200, "Especialidade muito longa").optional(),
  bio: z.string().max(2000, "Bio muito longa").optional(),
  instrumentos: z.array(z.string()).optional(),
  salario: z.number().min(0, "Salário deve ser positivo").optional(),
  data_contratacao: z.string().optional(),
});

export type ProfessorInput = z.infer<typeof professorSchema>;

// Curso validation schema
export const cursoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  instrumento: z.string().max(100, "Instrumento muito longo").optional(),
  nivel: z.string().optional(),
  descricao: z.string().max(2000, "Descrição muito longa").optional(),
  duracao: z.string().max(50, "Duração muito longa").optional(),
  carga_horaria: z.string().max(50, "Carga horária muito longa").optional(),
  valor_mensal: z.number().min(0, "Valor deve ser positivo").optional(),
  status: z.string().optional(),
});

export type CursoInput = z.infer<typeof cursoSchema>;

// Aviso validation schema
export const avisoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  conteudo: z.string().max(5000, "Conteúdo muito longo").optional(),
  tipo: z.string().optional(),
  prioridade: z.string().optional(),
  data_expiracao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export type AvisoInput = z.infer<typeof avisoSchema>;

// Pagamento validation schema
export const pagamentoSchema = z.object({
  aluno_id: z.string().uuid("ID do aluno inválido").optional(),
  valor: z.number().min(0, "Valor deve ser positivo"),
  data_vencimento: z.string().optional(),
  data_pagamento: z.string().optional(),
  status: z.string().optional(),
  tipo: z.string().optional(),
  metodo_pagamento: z.string().optional(),
  referencia: z.string().max(200, "Referência muito longa").optional(),
  observacoes: z.string().max(1000, "Observações muito longas").optional(),
});

export type PagamentoInput = z.infer<typeof pagamentoSchema>;

// Instrumento validation schema
export const instrumentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  tipo: z.string().max(100, "Tipo muito longo").optional(),
  marca: z.string().max(100, "Marca muito longa").optional(),
  modelo: z.string().max(100, "Modelo muito longo").optional(),
  numero_serie: z.string().max(100, "Número de série muito longo").optional(),
  status: z.string().optional(),
  localizacao: z.string().max(200, "Localização muito longa").optional(),
  observacoes: z.string().max(2000, "Observações muito longas").optional(),
  valor_patrimonio: z.number().min(0, "Valor deve ser positivo").optional(),
  data_aquisicao: z.string().optional(),
  data_manutencao: z.string().optional(),
  data_emprestimo: z.string().optional(),
  emprestado_para: z.string().max(200, "Nome muito longo").optional(),
});

export type InstrumentoInput = z.infer<typeof instrumentoSchema>;

// PlanoAula validation schema
export const planoAulaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  instrumento: z.string().max(100, "Instrumento muito longo").optional(),
  nivel: z.string().optional(),
  duracao: z.string().max(50, "Duração muito longa").optional(),
  conteudo: z.string().max(10000, "Conteúdo muito longo").optional(),
  objetivos: z.string().max(2000, "Objetivos muito longos").optional(),
  materiais: z.string().max(2000, "Materiais muito longos").optional(),
});

export type PlanoAulaInput = z.infer<typeof planoAulaSchema>;

// Material validation schema
export const materialSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  descricao: z.string().max(2000, "Descrição muito longa").optional(),
  tipo: z.string().optional(),
  url: z.string().url("URL inválida").max(2000, "URL muito longa").optional().or(z.literal("")),
  curso_id: z.string().uuid("ID do curso inválido").optional().nullable(),
  plano_aula_id: z.string().uuid("ID do plano de aula inválido").optional().nullable(),
});

export type MaterialInput = z.infer<typeof materialSchema>;

// Avaliacao validation schema
export const avaliacaoSchema = z.object({
  aluno_id: z.string().uuid("ID do aluno inválido"),
  professor_id: z.string().uuid("ID do professor inválido").optional().nullable(),
  data: z.string().optional(),
  nota: z.number().min(0, "Nota deve ser positiva").max(10, "Nota deve ser no máximo 10").optional().nullable(),
  feedback: z.string().max(5000, "Feedback muito longo").optional(),
  aspectos: z.record(z.any()).optional(),
});

export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;

// Aula validation schema
export const aulaSchema = z.object({
  aluno_id: z.string().uuid("ID do aluno inválido").optional().nullable(),
  professor_id: z.string().uuid("ID do professor inválido").optional().nullable(),
  curso_id: z.string().uuid("ID do curso inválido").optional().nullable(),
  tipo: z.string().optional(),
  dia_semana: z.number().min(0).max(6).optional().nullable(),
  horario: z.string().optional(),
  duracao_minutos: z.number().min(1, "Duração deve ser positiva").optional(),
  sala: z.string().max(100, "Nome da sala muito longo").optional(),
  recorrente: z.boolean().optional(),
  data_especifica: z.string().optional().nullable(),
  data_inicio: z.string().optional().nullable(),
  data_fim: z.string().optional().nullable(),
  valor: z.number().min(0, "Valor deve ser positivo").optional().nullable(),
  status: z.string().optional(),
  observacoes: z.string().max(2000, "Observações muito longas").optional(),
});

export type AulaInput = z.infer<typeof aulaSchema>;

// Matricula validation schema
export const matriculaSchema = z.object({
  aluno_id: z.string().uuid("ID do aluno inválido"),
  curso_id: z.string().uuid("ID do curso inválido"),
  data_inicio: z.string(),
  data_fim: z.string().optional().nullable(),
  status: z.string().optional(),
  observacoes: z.string().max(1000, "Observações muito longas").optional(),
});

export type MatriculaInput = z.infer<typeof matriculaSchema>;

// Presenca validation schema
export const presencaSchema = z.object({
  aluno_id: z.string().uuid("ID do aluno inválido"),
  aula_id: z.string().uuid("ID da aula inválido").optional().nullable(),
  data: z.string(),
  status: z.string().optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

export type PresencaInput = z.infer<typeof presencaSchema>;

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.errors.map(e => e.message).join(", ");
  return { success: false, error: errorMessage };
}
