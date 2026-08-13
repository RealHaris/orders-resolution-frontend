"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import orderHeaderStore from "@/common/stores/application/order-header-store";
import { EmptyState } from "@/common/components/shared/EmptyState/EmptyState";
import { ApiError, getErrorMessage } from "@/common/http";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { queries } from "@/lib/queries";
import { BackToOrdersButton } from "@/modules/Orders/BackToOrdersButton";
import { DeleteOrderDialog } from "@/modules/Orders/DeleteOrderDialog";
import { EditOrderDialog } from "@/modules/Orders/EditOrderDialog";
import { OrderAuditLogSection } from "@/modules/Orders/OrderAuditLogSection";
import { OrderDetailActions } from "@/modules/Orders/OrderDetailActions";
import { OrderDetailHeader } from "@/modules/Orders/OrderDetailHeader";
import { OrderLineItemsSection } from "@/modules/Orders/OrderLineItemsSection";
import { OrderPaymentsSection } from "@/modules/Orders/OrderPaymentsSection";
import { RecordPaymentDialog } from "@/modules/Orders/RecordPaymentDialog";
import { RecordRefundDialog } from "@/modules/Orders/RecordRefundDialog";
import { CircleAlertIcon } from "lucide-react";

/**
 * Order detail island: query, actions, line items, and payments.
 */
export function OrderDetail({ id }: { id: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [payKey, setPayKey] = useState(0);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundKey, setRefundKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const query = useQuery({
    ...queries.orders.detail(id),
    enabled: Boolean(id),
  });

  /**
   * Publishes the customer name to the header breadcrumb
   * ("Orders / <customer>'s orders") and clears it on unmount.
   */
  useEffect(() => {
    orderHeaderStore.update.customer(query.data?.customer);
    return () => orderHeaderStore.update.customer(undefined);
  }, [query.data?.customer]);

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
  const canRecordRefund = order.amountPaid > 0;
  const canDelete = order.payments.length === 0;

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

  /**
   * Opens the refund dialog and remounts it so the amount defaults to amount paid.
   */
  const handleRefund = () => {
    setRefundKey((current) => current + 1);
    setRefundOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <OrderDetailHeader order={order} />
        <OrderDetailActions
          canRecordPayment={canRecordPayment}
          canRecordRefund={canRecordRefund}
          canDelete={canDelete}
          onRecordPayment={handlePay}
          onRecordRefund={handleRefund}
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
      <OrderAuditLogSection auditLog={order.auditLog ?? []} />
      {editOpen ? (
        <EditOrderDialog
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
      {refundOpen ? (
        <RecordRefundDialog
          key={refundKey}
          open={refundOpen}
          onOpenChange={setRefundOpen}
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
