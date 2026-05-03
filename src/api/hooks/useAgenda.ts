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
import type { AgendaItem, CategoryStyle, Speaker, Room } from '../../data/agendaData';

// --- QUERIES ---

export function useSalas() {
  return useQuery({
    queryKey: ['salas'],
    queryFn: getSalasQuery,
    staleTime: 1000 * 60 * 5, // 5 minutos (Datos muy estáticos)
    gcTime: 1000 * 60 * 30,   // Mantener en memoria 30 min aunque no se use
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasQuery,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function usePonentes() {
  return useQuery({
    queryKey: ['ponentes'],
    queryFn: getPonentesQuery,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCharlas() {
  return useQuery({
    queryKey: ['charlas'],
    queryFn: getCharlasQuery,
    staleTime: 1000 * 60 * 2, // 2 minutos para la agenda
  });
}

// --- MUTATIONS ---

export function useSaveSalas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (salas: Room[]) => saveSalasMutation(salas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
  });
}

export function useSaveCategorias() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categorias: Record<string, CategoryStyle>) => saveCategoriasMutation(categorias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useSavePonentes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ponentes: Speaker[]) => savePonentesMutation(ponentes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ponentes'] });
      queryClient.invalidateQueries({ queryKey: ['charlas'] }); // Charlas embed ponentes
    },
  });
}

export function useSaveAgenda() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agenda: AgendaItem[]) => saveAgendaMutation(agenda),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charlas'] });
      // Invalidate related queries if needed, e.g., categories if new ones are created implicitly
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
  });
}
