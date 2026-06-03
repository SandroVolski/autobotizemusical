import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'professor' | 'aluno' | 'secretaria';

export function useUserRole() {
  const { user } = useAuth();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user_roles', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return [] as AppRole[];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data || []).map((r) => r.role as AppRole);
    },
  });

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isProfessor = hasRole('professor');
  const isSecretaria = hasRole('secretaria');
  const isAluno = hasRole('aluno');

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isProfessor,
    isSecretaria,
    isAluno,
  };
}
