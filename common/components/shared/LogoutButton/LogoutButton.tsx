"use client";

import { logout as logoutRequest } from "@/common/rest-api-calls/application/accounts";
import userStore from "@/common/stores/application/user-store";
import { queryClient } from "@/lib/query-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Logs out, clears session state, and navigates to login.
 */
export async function performLogout(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // Cookie is cleared server-side even if the request fails; continue locally.
  }
  userStore.update.user(undefined);
  queryClient.clear();
}

/**
 * Logout control used by the sidebar user menu.
 */
export function LogoutButton({
  className,
  children = "Log out",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  /**
   * Clears the session and returns to the login page.
   */
  const handleLogout = async () => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    await performLogout();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() => {
        void handleLogout();
      }}
    >
      {children}
    </button>
  );
}
