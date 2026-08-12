import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient. Import from `@/lib/query-client`, never from react-query.
 * 401 handling lives in SessionHydrator so we can use the Next.js router.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});
