import { toast } from "sonner";

import { cn } from "@/lib/utils";

/** Shared class names for bottom-right toast alerts. */
export const toastAlertClassNames = {
  success: cn(
    "cn-toast border-border bg-popover text-popover-foreground shadow-md",
  ),
  error: cn(
    "cn-toast border-destructive/40 bg-popover text-destructive shadow-md",
  ),
} as const;

/**
 * Shows a success toast in the bottom-right toaster.
 */
export const toastSuccess = (message: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  toast.success(message, { className: toastAlertClassNames.success });
};

/**
 * Shows an error toast in the bottom-right toaster.
 */
export const toastError = (message: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  toast.error(message, { className: toastAlertClassNames.error });
};
