import type { ReactNode } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { HeaderUser } from "@/components/header-user";

/**
 * Dashboard top bar with title slot, mode toggle, and user avatar. Server Component.
 */
export function DashboardHeader({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="text-base font-medium">{title}</div>
          <div className="flex items-center gap-2">
            {actions}
            <ModeToggle />
            <HeaderUser />
          </div>
        </div>
      </div>
    </header>
  );
}
