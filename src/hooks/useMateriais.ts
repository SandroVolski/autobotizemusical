import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string | null;
  url: string | null;
  curso_id: string | null;
  plano_aula_id: string | null;
  created_at: string;
  updated_at: string;
  cursos?: { nome: string } | null;
  planos_aula?: { titulo: string } | null;
}

export interface NovoMaterial {
  titulo: string;
  descricao?: string;
  tipo?: string;
  url?: string;
  curso_id?: string;
  plano_aula_id?: string;
}

export function useMateriais(cursoId?: string) {
  return useQuery({
    queryKey: ["materiais", cursoId],
    queryFn: async () => {
      let query = supabase
        .from("materiais")
        .select(`
          *,
          cursos(nome),
          planos_aula(titulo)
        `)
        .order("created_at", { ascending: false });
      
      if (cursoId) {
        query = query.eq("curso_id", cursoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Material[];
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: NovoMaterial) => {
      const { data, error } = await supabase
        .from("materiais")
        .insert(material)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais"] });
      toast({
        title: "Material cadastrado!",
        description: "O material didático foi adicionado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar material",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...material }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from("materiais")
        .update(material)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais"] });
      toast({
        title: "Material atualizado!",
        description: "Os dados do material foram atualizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar material",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("materiais")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais"] });
      toast({
        title: "Material removido",
        description: "O material didático foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover material",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
