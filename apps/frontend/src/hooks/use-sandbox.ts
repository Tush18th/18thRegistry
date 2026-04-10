import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/lib/api';
import { SandboxSession, StackProfile, SandboxEvent } from '@/types/sandbox';

export function useStackProfiles() {
  return useQuery<StackProfile[]>(['stack-profiles'], async () => {
    const res = await api.get('/stack-profiles');
    return res.data;
  });
}

export function useUserSandboxes() {
  return useQuery<SandboxSession[]>(['user-sandboxes'], async () => {
    const res = await api.get('/sandbox');
    return res.data;
  });
}

export function useSandboxSession(id: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery<{ session: SandboxSession; events: SandboxEvent[] }>(
    ['sandbox-session', id],
    async () => {
      const res = await api.get(`/sandbox/${id}`);
      return res.data;
    },
    options
  );
}

export function useLaunchSandbox() {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: { moduleId: string; stackProfileId: string }) => {
      // Resolve the selected stack profile so we can embed the full object
      // that the backend's LaunchSandboxDto expects.
      const profileRes = await api.get(`/stack-profiles/${data.stackProfileId}`);
      const profile = profileRes.data;

      const payload = {
        moduleId: data.moduleId,
        stackProfile: {
          magentoVersion: profile.magentoVersion,
          phpVersion: profile.phpVersion,
          services: ['db', 'redis', 'php', 'web'],
        },
      };

      const res = await api.post('/sandbox', payload);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-sandboxes']);
      },
    }
  );
}

export function useTerminateSandbox() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (id: string) => {
      const res = await api.delete(`/sandbox/${id}`);
      return res.data;
    },
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(['user-sandboxes']);
        queryClient.invalidateQueries(['sandbox-session', id]);
      },
    }
  );
}

export function useApproveTeardown() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.post(`/sandboxes/${id}/teardown/approve`, { reason });
      return res.data;
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['sandbox-session', variables.id]);
        queryClient.invalidateQueries(['user-sandboxes']);
      },
    }
  );
}

export function useExtendSandbox() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ id, extensionHours }: { id: string; extensionHours: number }) => {
      const res = await api.post(`/sandboxes/${id}/teardown/extend`, { extensionHours });
      return res.data;
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['sandbox-session', variables.id]);
        queryClient.invalidateQueries(['user-sandboxes']);
      },
    }
  );
}
