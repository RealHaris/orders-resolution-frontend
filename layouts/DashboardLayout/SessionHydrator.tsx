"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ApiError } from "@/common/http";
import { performLogout } from "@/common/components/shared/LogoutButton/LogoutButton";
import userStore from "@/common/stores/application/user-store";
import { queries } from "@/lib/queries";

/**
 * Hydrates the session user into the Valtio store. Redirects on 401.
 */
export function SessionHydrator() {
  const router = useRouter();
  const { data, error } = useQuery({
    ...queries.users.me,
  });

  if (data) {
    userStore.update.user(data);
  }

  useEffect(() => {
    if (!(error instanceof ApiError) || error.statusCode !== 401) {
      return;
    }
    void (async () => {
      await performLogout();
      router.replace("/login");
    })();
  }, [error, router]);

  return null;
}
