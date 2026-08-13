"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

/**
 * Navigates back to the orders dashboard. Compact icon-only button.
 */
export function BackToOrdersButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      nativeButton={false}
      render={<Link href="/orders" />}
      aria-label="Back to orders"
    >
      <ArrowLeftIcon />
    </Button>
  );
}
