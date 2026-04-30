import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnrolledWorkshopsQuery, getAttendancesQuery } from '../supabase/enrollment/enrollmentQueries';
import { syncUserEnrollmentsMutation, markAttendanceMutation } from '../supabase/enrollment/enrollmentMutations';

// --- QUERIES ---

export function useEnrolledWorkshops(userId: string | undefined) {
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: () => getEnrolledWorkshopsQuery(userId!),
    enabled: !!userId,
  });
}

export function useAttendances(userId: string | undefined) {
  return useQuery({
    queryKey: ['attendances', userId],
    queryFn: () => getAttendancesQuery(userId!),
    enabled: !!userId,
  });
}

// --- MUTATIONS ---

export function useSyncUserEnrollments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, workshopIds }: { userId: string; workshopIds: string[] }) => syncUserEnrollmentsMutation(userId, workshopIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, workshopId }: { userId: string; workshopId: string }) => markAttendanceMutation(userId, workshopId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendances', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
