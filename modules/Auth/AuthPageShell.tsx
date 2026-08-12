import type { ReactNode } from "react";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/common/constants/shared/nav";

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
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
