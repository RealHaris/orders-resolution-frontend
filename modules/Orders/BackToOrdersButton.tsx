"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

/**
 * Navigates back to the orders dashboard.
 */
export function BackToOrdersButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href="/orders" />}
    >
      <ArrowLeftIcon />
      Back to orders
    </Button>
  );
}
