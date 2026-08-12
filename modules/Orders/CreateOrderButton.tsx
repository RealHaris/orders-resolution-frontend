"use client";

import { Button } from "@/components/ui/button";
import { useCreateOrderSheet } from "@/layouts/DashboardLayout/CreateOrderSheetProvider";
import { PlusIcon } from "lucide-react";

/**
 * Opens the create-order sheet from the dashboard header.
 */
export function CreateOrderButton() {
  const { setOpen } = useCreateOrderSheet();
  return (
    <Button
      type="button"
      onClick={() => {
        setOpen(true);
      }}
    >
      <PlusIcon />
      Create order
    </Button>
  );
}
