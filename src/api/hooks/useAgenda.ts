import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSalasQuery,
  getCategoriasQuery,
  getPonentesQuery,
  getCharlasQuery,
} from '../supabase/agenda/agendaQueries';
import {
  saveSalasMutation,
  saveCategoriasMutation,
  saveAgendaMutation,
  savePonentesMutation
} from '../supabase/agenda/agendaMutations';
import type { AgendaItem, Category, Speaker, Room } from '../../data/agendaData';
import { useAuth } from './useAuth';
import { getStaleTimeByRole } from '../../utils/queryUtils';

// --- QUERIES ---

export function useSalas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['salas'],
    queryFn: getSalasQuery,
    staleTime: getStaleTimeByRole(user?.rol),
  });
}

export function useCategorias() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasQuery,
    staleTime: getStaleTimeByRole(user?.rol),
  });
}

export function usePonentes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ponentes'],
    queryFn: getPonentesQuery,
    staleTime: getStaleTimeByRole(user?.rol),
  });
}

/**
 * Hook de Charlas (Horario)
 * Este hook es inteligente: Cruza los IDs con los nombres reales de salas y categorías
 */
export function useCharlas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['charlas'],
    queryFn: getCharlasQuery,
    staleTime: getStaleTimeByRole(user?.rol),
  });
}

// --- MUTATIONS ---

export function useSaveSalas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salas: Room[]) => saveSalasMutation(salas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salas'] });
      queryClient.invalidateQueries({ queryKey: ['charlas'] });
    },
  });
}

export function useSaveCategorias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categorias: Category[]) => saveCategoriasMutation(categorias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['charlas'] });
    },
  });
}

export function useSavePonentes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ponentes: Speaker[]) => savePonentesMutation(ponentes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ponentes'] });
      queryClient.invalidateQueries({ queryKey: ['charlas'] });
    },
  });
}

export function useSaveAgenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agenda: AgendaItem[]) => saveAgendaMutation(agenda),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charlas'] });
    },
  });
}
