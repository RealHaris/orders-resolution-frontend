import type { ReactNode } from "react";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/common/constants/shared/nav";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Centered card chrome for login and signup. Server Component.
 */
export function AuthPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/login"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          {APP_NAME}
        </Link>
        <p className="sr-only">{title}</p>
        {children}
      </div>
    </div>
  );
}
