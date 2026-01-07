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
          horario: string | null
          id: string
          observacoes: string | null
          professor_id: string | null
          recorrente: boolean | null
          sala: string | null
          status: string | null
          tipo: string | null
          updated_at: string
          valor: number | null
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
          horario?: string | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          recorrente?: boolean | null
          sala?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
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
          horario?: string | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          recorrente?: boolean | null
          sala?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
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
          aluno_id: string
          aspectos: Json | null
          created_at: string | null
          data: string
          feedback: string | null
          id: string
          nota: number | null
          professor_id: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          aspectos?: Json | null
          created_at?: string | null
          data?: string
          feedback?: string | null
          id?: string
          nota?: number | null
          professor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          aspectos?: Json | null
          created_at?: string | null
          data?: string
          feedback?: string | null
          id?: string
          nota?: number | null
          professor_id?: string | null
          updated_at?: string | null
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
          ativo: boolean | null
          conteudo: string | null
          created_at: string
          data_expiracao: string | null
          data_publicacao: string | null
          id: string
          prioridade: string | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          data_expiracao?: string | null
          data_publicacao?: string | null
          id?: string
          prioridade?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string
          data_expiracao?: string | null
          data_publicacao?: string | null
          id?: string
          prioridade?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_escola: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          descricao: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
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
          instrumento: string | null
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
          instrumento?: string | null
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
          instrumento?: string | null
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
          data_aquisicao: string | null
          data_emprestimo: string | null
          data_manutencao: string | null
          emprestado_para: string | null
          id: string
          localizacao: string | null
          marca: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          status: string | null
          tipo: string | null
          updated_at: string
          valor_patrimonio: number | null
        }
        Insert: {
          created_at?: string
          data_aquisicao?: string | null
          data_emprestimo?: string | null
          data_manutencao?: string | null
          emprestado_para?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor_patrimonio?: number | null
        }
        Update: {
          created_at?: string
          data_aquisicao?: string | null
          data_emprestimo?: string | null
          data_manutencao?: string | null
          emprestado_para?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          valor_patrimonio?: number | null
        }
        Relationships: []
      }
      materiais: {
        Row: {
          created_at: string | null
          curso_id: string | null
          descricao: string | null
          id: string
          plano_aula_id: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          id?: string
          plano_aula_id?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          id?: string
          plano_aula_id?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_plano_aula_id_fkey"
            columns: ["plano_aula_id"]
            isOneToOne: false
            referencedRelation: "planos_aula"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          aluno_id: string
          created_at: string | null
          curso_id: string
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          curso_id: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          curso_id?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
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
          mensagem: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          aluno_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
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
          data_vencimento?: string | null
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
          data_vencimento?: string | null
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
          instrumento: string | null
          materiais: string | null
          nivel: string | null
          objetivos: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          duracao?: string | null
          id?: string
          instrumento?: string | null
          materiais?: string | null
          nivel?: string | null
          objetivos?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          duracao?: string | null
          id?: string
          instrumento?: string | null
          materiais?: string | null
          nivel?: string | null
          objetivos?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          aluno_id: string
          aula_id: string | null
          created_at: string | null
          data: string
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          aula_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          aula_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          data_contratacao: string | null
          email: string | null
          especialidade: string | null
          id: string
          instrumentos: string[] | null
          nome: string
          salario: number | null
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          data_contratacao?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          instrumentos?: string[] | null
          nome: string
          salario?: number | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          data_contratacao?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          instrumentos?: string[] | null
          nome?: string
          salario?: number | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "professor" | "aluno" | "secretaria"
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
    Enums: {
      app_role: ["admin", "professor", "aluno", "secretaria"],
    },
  },
} as const
