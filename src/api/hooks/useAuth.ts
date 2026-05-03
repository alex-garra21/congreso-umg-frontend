import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { getUserProfileQuery } from '../supabase/users/userQueries';


export function useAuth() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const userId = session?.user?.id;

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
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['tokens'] });
      }
    });

    // 3. Escuchar cambios en tiempo real para el perfil del usuario actual
    let userChannel: any = null;
    
    if (userId) {
      // Nombre único para esta pestaña/sesión
      const channelName = `user_updates_${userId}`;
      
      userChannel = supabase.channel(channelName);
      
      // IMPORTANTE: Solo configurar si no estamos ya suscritos a este canal
      if (userChannel.state === 'closed' || userChannel.state === 'joined') {
        userChannel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'usuarios',
              filter: `id=eq.${userId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIPTION_ERROR') {
              console.warn('Error en suscripción Realtime, reintentando...');
            }
          });
      }
    }

    return () => {
      subscription.unsubscribe();
      if (userChannel) supabase.removeChannel(userChannel);
    };
  }, [queryClient, userId]);

  const { data: user, isLoading: isProfileLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => (userId ? getUserProfileQuery(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 10, // 10 segundos (para detectar cambios de rol rápido)
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
