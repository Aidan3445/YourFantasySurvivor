import { useQuery } from '@tanstack/react-query';

export function useSysAdmin() {
  return useQuery<string | null>({
    queryKey: ['sysAdmin'],
    queryFn: async () => {
      const response = await fetch('/api/sys/redirects');
      if (!response.ok) return null;

      const { userId } = (await response.json()) as {
        userId: string | null;
      };

      return userId;

    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: 'always',
  });
}
