"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog/ConfirmDialog";
import { deleteOrder } from "@/common/rest-api-calls/application/orders";
import { invalidateOrdersListAndSummary } from "@/modules/Orders/order-cache";

/**
 * Confirms deletion of an unpaid order.
 */
export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: () => deleteOrder(orderId),
    onSuccess: async () => {
      onOpenChange(false);
      await invalidateOrdersListAndSummary();
      router.push("/orders");
    },
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this order?"
      description="This cannot be undone. Only orders with no payments can be deleted."
      confirmLabel="Delete order"
      isPending={mutation.isPending}
      variant="destructive"
      onConfirm={() => {
        mutation.mutate();
      }}
    />
  );
}
