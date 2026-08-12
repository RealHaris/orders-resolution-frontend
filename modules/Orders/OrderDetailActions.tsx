"use client";

import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";

/**
 * Record payment / refund / Edit / Delete actions for an order detail page.
 */
export function OrderDetailActions({
  canRecordPayment,
  canRecordRefund,
  canDelete,
  onRecordPayment,
  onRecordRefund,
  onEdit,
  onDelete,
}: {
  canRecordPayment: boolean;
  canRecordRefund: boolean;
  canDelete: boolean;
  onRecordPayment: () => void;
  onRecordRefund: () => void;
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
      {canRecordRefund ? (
        <Button type="button" variant="outline" onClick={onRecordRefund}>
          <RotateCcwIcon />
          Record refund
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
