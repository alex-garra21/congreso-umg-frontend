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

// --- QUERIES ---

export function useSalas() {
  return useQuery({
    queryKey: ['salas'],
    queryFn: getSalasQuery,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasQuery,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePonentes() {
  return useQuery({
    queryKey: ['ponentes'],
    queryFn: getPonentesQuery,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook de Charlas (Horario)
 * Este hook es inteligente: Cruza los IDs con los nombres reales de salas y categorías
 */
export function useCharlas() {
  const { data: salas = [] } = useSalas();
  const { data: cats = [] } = useCategorias();
  const { data: ponentes = [] } = usePonentes();

  return useQuery({
    queryKey: ['charlas', salas, cats, ponentes],
    queryFn: async () => {
      const charlas = await getCharlasQuery();
      
      // Enriquecer datos para facilitar el renderizado
      return charlas.map(c => {
        const sala = salas.find(s => s.id === c.locationId);
        const cat = cats.find(ct => ct.id === c.tagId);
        const ponente = ponentes.find(p => p.id === c.speaker?.id);

        return {
          ...c,
          room: sala?.name || 'Sin sala',
          tagName: cat?.name || 'Sin categoría',
          tag: cat?.name || 'General',
          tagStyle: cat ? { bg: cat.bg, text: cat.text } : undefined,
          speaker: ponente || c.speaker
        };
      });
    },
    staleTime: 1000 * 60 * 2,
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
