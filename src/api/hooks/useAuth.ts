import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { getUserProfileQuery } from '../supabase/users/userQueries';


export function useAuth() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionLoading(false);
    });

    // 2. Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsSessionLoading(false);
      if (_event === 'SIGNED_OUT') {
        queryClient.setQueryData(['userProfile'], null);
        localStorage.removeItem('congreso_current_user'); 
      } else if (_event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const userId = session?.user?.id;

  const { data: user, isLoading: isProfileLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => (userId ? getUserProfileQuery(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading: isSessionLoading || isProfileLoading || (!!userId && !user),
    isError,
    refetchProfile: refetch
  };
}
