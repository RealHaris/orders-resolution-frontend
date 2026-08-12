"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog/ConfirmDialog";
import { getErrorMessage } from "@/common/http";
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
      toast.success("Order deleted");
      onOpenChange(false);
      await invalidateOrdersListAndSummary();
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete the order"));
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
