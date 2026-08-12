import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTriggerButton } from "@/layouts/DashboardLayout/SidebarTriggerButton";

/**
 * Dashboard top bar with sidebar trigger and a title slot. Server Component.
 */
export function DashboardHeader({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTriggerButton />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="text-base font-medium">{title}</div>
          {actions}
        </div>
      </div>
    </header>
  );
}
