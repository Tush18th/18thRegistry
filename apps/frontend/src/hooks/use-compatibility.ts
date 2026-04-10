import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/lib/api';
import { CompatibilityResult } from '@/types/compatibility';

export function useCompatibilityRecommendation(moduleId: string, options?: { enabled?: boolean }) {
  return useQuery<CompatibilityResult>(
    ['compatibility-recommendation', moduleId],
    async () => {
      const res = await api.get(`/compatibility/modules/${moduleId}`, { 
        silentErrors: [404] 
      } as any);
      return res.data;
    },
    {
      ...options,
      retry: false,
    }
  );
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (data: { moduleId: string; force?: boolean }) => {
      const endpoint = data.force ? '/compatibility/analyze/force' : '/compatibility/analyze';
      const res = await api.post(endpoint, { moduleId: data.moduleId });
      return res.data;
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['compatibility-recommendation', variables.moduleId]);
      },
    }
  );
}
