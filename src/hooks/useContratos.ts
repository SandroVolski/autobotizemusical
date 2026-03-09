import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useContratos() {
  return useQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*, alunos(nome, responsavel_nome, telefone, email, endereco), cursos(nome, valor_mensal), instrumentos(nome, marca, modelo, numero_serie)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContrato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contrato: {
      aluno_id: string;
      curso_id?: string;
      instrumento_id?: string;
      tipo: string;
      data_inicio?: string;
      data_fim?: string;
      dados?: Record<string, any>;
    }) => {
      const { error } = await supabase.from("contratos").insert(contrato as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast({ title: "Contrato gerado com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao gerar contrato", variant: "destructive" }),
  });
}
