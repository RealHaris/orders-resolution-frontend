"use client";

import { useRouter } from "next/navigation";
import { useSnapshot } from "valtio";
import { LogOutIcon } from "lucide-react";

import { performLogout } from "@/common/components/shared/LogoutButton/LogoutButton";
import userStore from "@/common/stores/application/user-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Builds avatar initials from an email address.
 */
const initialsFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "U";
};

/**
 * Top-bar avatar button: shows initials, opens a dropdown with email and logout.
 */
export function HeaderUser() {
  const router = useRouter();
  const { user } = useSnapshot(userStore);
  const email = user?.email ?? "";
  const initials = email ? initialsFromEmail(email) : "…";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="size-8 border">
          <AvatarFallback className="rounded-full bg-muted text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left">
              <Avatar className="size-8">
                <AvatarFallback className="rounded-full bg-muted text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-muted-foreground">
                {email || "Signed in"}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => {
            void (async () => {
              await performLogout();
              router.replace("/login");
            })();
          }}
        >
          <LogOutIcon className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
