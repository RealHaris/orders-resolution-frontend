import type { ReactNode } from "react";

import { DashboardLayout } from "@/layouts/DashboardLayout/DashboardLayout";

/**
 * Shared chrome for every protected dashboard route.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
