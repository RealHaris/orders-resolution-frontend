"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/common/components/shared/EmptyState/EmptyState";
import { ApiError, getErrorMessage } from "@/common/http";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { queries } from "@/lib/queries";
import { BackToOrdersButton } from "@/modules/Orders/BackToOrdersButton";
import { DeleteOrderDialog } from "@/modules/Orders/DeleteOrderDialog";
import { EditOrderSheet } from "@/modules/Orders/EditOrderSheet";
import { OrderDetailActions } from "@/modules/Orders/OrderDetailActions";
import { OrderDetailHeader } from "@/modules/Orders/OrderDetailHeader";
import { OrderLineItemsSection } from "@/modules/Orders/OrderLineItemsSection";
import { OrderPaymentsSection } from "@/modules/Orders/OrderPaymentsSection";
import { RecordPaymentDialog } from "@/modules/Orders/RecordPaymentDialog";
import { CircleAlertIcon } from "lucide-react";

/**
 * Order detail island: query, actions, line items, and payments.
 */
export function OrderDetail({ id }: { id: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [payKey, setPayKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useQuery({
    ...queries.orders.detail(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.error instanceof ApiError && query.error.statusCode === 404) {
    return (
      <div className="flex flex-col gap-4">
        <BackToOrdersButton />
        <EmptyState
          title="Order not found"
          description="This order does not exist or you do not have access to it."
        />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-4">
        <BackToOrdersButton />
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not load this order</AlertTitle>
          <AlertDescription>{getErrorMessage(query.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const order = query.data;
  const canRecordPayment = order.amountDue > 0;
  const canDelete = order.amountPaid === 0;

  /**
   * Opens the edit sheet and remounts it so values match the latest order.
   */
  const handleEdit = () => {
    setEditKey((current) => current + 1);
    setEditOpen(true);
  };

  /**
   * Opens the payment dialog and remounts it so the amount defaults to amount due.
   */
  const handlePay = () => {
    setPayKey((current) => current + 1);
    setPayOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <BackToOrdersButton />
          <OrderDetailHeader order={order} />
        </div>
        <OrderDetailActions
          canRecordPayment={canRecordPayment}
          canDelete={canDelete}
          onRecordPayment={handlePay}
          onEdit={handleEdit}
          onDelete={() => {
            setDeleteOpen(true);
          }}
        />
      </div>
      <OrderLineItemsSection
        lineItems={order.lineItems}
        orderTotal={order.orderTotal}
      />
      <OrderPaymentsSection payments={order.payments} />
      {editOpen ? (
        <EditOrderSheet
          key={editKey}
          open={editOpen}
          onOpenChange={setEditOpen}
          order={order}
        />
      ) : null}
      {payOpen ? (
        <RecordPaymentDialog
          key={payKey}
          open={payOpen}
          onOpenChange={setPayOpen}
          order={order}
        />
      ) : null}
      <DeleteOrderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orderId={order._id}
      />
    </div>
  );
}
