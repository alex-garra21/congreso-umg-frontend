import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsersQuery, getTokensQuery } from '../supabase/users/userQueries';
import {
  registerUserMutation,
  updateUserDataMutation,
  invalidatePaymentMutation,
  adminValidateUserMutation,
  deleteTokenMutation,
  generateTokenMutation,
  validateTokenMutation
} from '../supabase/users/userMutations';
import type { UserData } from '../../utils/auth';

// --- QUERIES ---

export function useAllUsers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersQuery,
    enabled
  });
}

export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: getTokensQuery,
  });
}

// --- MUTATIONS ---

export function useRegisterUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: UserData) => registerUserMutation(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedData: UserData) => updateUserDataMutation(updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useInvalidatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => invalidatePaymentMutation(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}

export function useAdminValidateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, adminId }: { userId: string; adminId?: string }) => adminValidateUserMutation(userId, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => deleteTokenMutation(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}

export function useGenerateToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, adminId }: { code: string; adminId?: string }) => generateTokenMutation(code, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}

export function useValidateToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, userId }: { code: string; userId: string }) => validateTokenMutation(code, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
}
