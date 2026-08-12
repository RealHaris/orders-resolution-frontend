import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreateOrderSheetProvider } from "@/layouts/DashboardLayout/CreateOrderSheetProvider";
import { DashboardHeader } from "@/layouts/DashboardLayout/DashboardHeader";
import { DashboardHeaderTitle } from "@/layouts/DashboardLayout/DashboardHeaderTitle";
import { SessionHydrator } from "@/layouts/DashboardLayout/SessionHydrator";

/**
 * Protected dashboard chrome: sidebar, header, session hydrate.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <CreateOrderSheetProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SessionHydrator />
          <DashboardHeader title={<DashboardHeaderTitle />} />
          {children}
        </SidebarInset>
      </CreateOrderSheetProvider>
    </SidebarProvider>
  );
}
