"use client";

import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, WalletIcon } from "lucide-react";

/**
 * Record payment / Edit / Delete actions for an order detail page.
 */
export function OrderDetailActions({
  canRecordPayment,
  canDelete,
  onRecordPayment,
  onEdit,
  onDelete,
}: {
  canRecordPayment: boolean;
  canDelete: boolean;
  onRecordPayment: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canRecordPayment ? (
        <Button type="button" onClick={onRecordPayment}>
          <WalletIcon />
          Record payment
        </Button>
      ) : null}
      <Button type="button" variant="outline" onClick={onEdit}>
        <PencilIcon />
        Edit
      </Button>
      {canDelete ? (
        <Button type="button" variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete
        </Button>
      ) : null}
    </div>
  );
}
