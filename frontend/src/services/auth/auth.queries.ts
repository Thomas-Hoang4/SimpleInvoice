import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { queryKeys } from '../../constants/query-keys';
import { useAuth } from '../../context/AuthContext';
import { LoginCredentials } from '../../types/auth.types';

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });
}

export function useCurrentUserQuery() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}
