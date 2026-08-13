"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { updateOrder } from "@/common/rest-api-calls/application/orders";
import { toDateInputValue } from "@/common/utils/date";
import type { OrderDetail, UpdateOrderBody } from "@/common/types/application/orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LineItemsEditor } from "@/modules/Orders/LineItemsEditor";
import {
  patchOrderInLists,
  setOrderDetailCache,
} from "@/modules/Orders/order-cache";
import {
  orderFormSchema,
  toOrderLineItemsInput,
  type OrderFormValues,
} from "@/modules/Orders/order-form-schema";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";

/**
 * Edit-order dialog. Line items lock after the first payment. The body
 * scrolls vertically when there are many line items; header and footer stay
 * fixed.
 */
export function EditOrderDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail;
}) {
  const lineItemsLocked = order.payments.length > 0;
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: "onChange",
    defaultValues: {
      customer: order.customer,
      dueDate: toDateInputValue(order.dueDate),
      lineItems: order.lineItems.map((item) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    },
  });

  const mutation = useMutation({
    mutationFn: (body: UpdateOrderBody) => updateOrder(order._id, body),
    onSuccess: (updated) => {
      setOrderDetailCache(updated);
      patchOrderInLists(updated);
      void queryClient.invalidateQueries({
        queryKey: queries.orders.summary.queryKey,
      });
      onOpenChange(false);
    },
  });

  /**
   * Sends only dirty fields as a partial PUT body.
   */
  const onSubmit = form.handleSubmit((values) => {
    const dirty = form.formState.dirtyFields;
    const body: UpdateOrderBody = {};
    if (dirty.customer) {
      body.customer = values.customer;
    }
    if (dirty.dueDate) {
      body.dueDate = values.dueDate;
    }
    if (!lineItemsLocked && dirty.lineItems) {
      body.lineItems = toOrderLineItemsInput(values.lineItems);
    }
    if (
      body.customer === undefined &&
      body.dueDate === undefined &&
      body.lineItems === undefined
    ) {
      onOpenChange(false);
      return;
    }
    mutation.mutate(body);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[75dvh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit order</DialogTitle>
          <DialogDescription>
            Customer and due date can always be changed.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-order-form"
          onSubmit={onSubmit}
          className="flex min-h-0 flex-col gap-4"
        >
          <FieldGroup className="flex-1 min-h-0">
            <Field data-invalid={!!form.formState.errors.customer || undefined}>
              <FieldLabel htmlFor="edit-customer" required>
                Customer
              </FieldLabel>
              <Input
                id="edit-customer"
                placeholder="Customer name"
                {...form.register("customer")}
              />
              <FieldError errors={[form.formState.errors.customer]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.dueDate || undefined}>
              <FieldLabel htmlFor="edit-due-date" required>
                Due date
              </FieldLabel>
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    id="edit-due-date"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.dueDate]} />
            </Field>
            {lineItemsLocked ? (
              <FieldDescription>
                Line items are locked after the first payment.
              </FieldDescription>
            ) : (
              <LineItemsEditor
                control={form.control}
                register={form.register}
                errors={form.formState.errors.lineItems}
              />
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="edit-order-form"
            disabled={mutation.isPending || !form.formState.isValid}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
