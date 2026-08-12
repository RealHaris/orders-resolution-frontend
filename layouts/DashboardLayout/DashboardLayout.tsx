import type { ReactNode } from "react";

import { CreateOrderSheetProvider } from "@/layouts/DashboardLayout/CreateOrderSheetProvider";
import { DashboardHeader } from "@/layouts/DashboardLayout/DashboardHeader";
import { DashboardHeaderTitle } from "@/layouts/DashboardLayout/DashboardHeaderTitle";
import { SessionHydrator } from "@/layouts/DashboardLayout/SessionHydrator";

/**
 * Protected dashboard chrome: header + session hydrate (no sidebar).
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CreateOrderSheetProvider>
      <div className="flex min-h-svh flex-col">
        <SessionHydrator />
        <DashboardHeader title={<DashboardHeaderTitle />} />
        {children}
      </div>
    </CreateOrderSheetProvider>
  );
}
