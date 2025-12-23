export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          data_matricula: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          nivel: string | null
          nome: string
          objetivo: string | null
          observacoes: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nivel?: string | null
          nome: string
          objetivo?: string | null
          observacoes?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nivel?: string | null
          nome?: string
          objetivo?: string | null
          observacoes?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      aulas: {
        Row: {
          aluno_id: string | null
          created_at: string
          curso_id: string | null
          data_especifica: string | null
          data_fim: string | null
          data_inicio: string | null
          dia_semana: number | null
          duracao_minutos: number | null
          horario: string
          id: string
          observacoes: string | null
          professor_id: string | null
          sala: string | null
          status: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          curso_id?: string | null
          data_especifica?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dia_semana?: number | null
          duracao_minutos?: number | null
          horario: string
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          curso_id?: string | null
          data_especifica?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dia_semana?: number | null
          duracao_minutos?: number | null
          horario?: string
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          aluno_id: string | null
          created_at: string
          curso_id: string | null
          data: string
          id: string
          nota: number | null
          observacoes: string | null
          professor_id: string | null
          status: string | null
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          curso_id?: string | null
          data: string
          id?: string
          nota?: number | null
          observacoes?: string | null
          professor_id?: string | null
          status?: string | null
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          curso_id?: string | null
          data?: string
          id?: string
          nota?: number | null
          observacoes?: string | null
          professor_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          created_at: string
          destinatarios: string | null
          enviado_email: boolean | null
          enviado_whatsapp: boolean | null
          id: string
          mensagem: string
          titulo: string
          turma_id: string | null
        }
        Insert: {
          created_at?: string
          destinatarios?: string | null
          enviado_email?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem: string
          titulo: string
          turma_id?: string | null
        }
        Update: {
          created_at?: string
          destinatarios?: string | null
          enviado_email?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem?: string
          titulo?: string
          turma_id?: string | null
        }
        Relationships: []
      }
      cursos: {
        Row: {
          carga_horaria: string | null
          created_at: string
          descricao: string | null
          duracao: string | null
          id: string
          instrumento: string
          nivel: string | null
          nome: string
          status: string | null
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          carga_horaria?: string | null
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          instrumento: string
          nivel?: string | null
          nome: string
          status?: string | null
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          carga_horaria?: string | null
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          instrumento?: string
          nivel?: string | null
          nome?: string
          status?: string | null
          updated_at?: string
          valor_mensal?: number | null
        }
        Relationships: []
      }
      instrumentos: {
        Row: {
          created_at: string
          data_emprestimo: string | null
          emprestado_para: string | null
          id: string
          localizacao: string | null
          marca: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          status: string | null
          tipo: string
          ultima_manutencao: string | null
          updated_at: string
          valor_patrimonio: number | null
        }
        Insert: {
          created_at?: string
          data_emprestimo?: string | null
          emprestado_para?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_patrimonio?: number | null
        }
        Update: {
          created_at?: string
          data_emprestimo?: string | null
          emprestado_para?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
          valor_patrimonio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instrumentos_emprestado_para_fkey"
            columns: ["emprestado_para"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_didaticos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          downloads: number | null
          id: string
          professor_id: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          professor_id?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          professor_id?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_didaticos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          aluno_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          referencia: string | null
          status: string | null
          tipo: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          referencia?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          referencia?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_aula: {
        Row: {
          conteudo: string | null
          created_at: string
          duracao: string | null
          id: string
          instrumento: string
          materiais: string | null
          nivel: string | null
          objetivos: string | null
          professor_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          duracao?: string | null
          id?: string
          instrumento: string
          materiais?: string | null
          nivel?: string | null
          objetivos?: string | null
          professor_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          duracao?: string | null
          id?: string
          instrumento?: string
          materiais?: string | null
          nivel?: string | null
          objetivos?: string | null
          professor_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_aula_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          avaliacao: number | null
          biografia: string | null
          created_at: string
          disponibilidade: Json | null
          email: string | null
          especialidades: string[] | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          updated_at: string
          valor_hora: number | null
        }
        Insert: {
          avaliacao?: number | null
          biografia?: string | null
          created_at?: string
          disponibilidade?: Json | null
          email?: string | null
          especialidades?: string[] | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
          valor_hora?: number | null
        }
        Update: {
          avaliacao?: number | null
          biografia?: string | null
          created_at?: string
          disponibilidade?: Json | null
          email?: string | null
          especialidades?: string[] | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
          valor_hora?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      registro_presenca: {
        Row: {
          aluno_id: string | null
          aula_id: string | null
          created_at: string
          data: string
          id: string
          observacoes: string | null
          status: string | null
        }
        Insert: {
          aluno_id?: string | null
          aula_id?: string | null
          created_at?: string
          data: string
          id?: string
          observacoes?: string | null
          status?: string | null
        }
        Update: {
          aluno_id?: string | null
          aula_id?: string | null
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_presenca_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_presenca_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
