"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";

/**
 * Client providers for React Query, URL state, and toasts.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {children}
        <Toaster />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
