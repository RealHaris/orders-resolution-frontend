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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LineItemsEditor } from "@/modules/Orders/LineItemsEditor";
import {
  patchOrderInLists,
  setOrderDetailCache,
} from "@/modules/Orders/order-cache";
import {
  orderFormSchema,
  type OrderFormValues,
} from "@/modules/Orders/order-form-schema";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";

/**
 * Edit-order sheet. Line items lock after the first payment.
 */
export function EditOrderSheet({
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
    defaultValues: {
      customer: order.customer,
      dueDate: toDateInputValue(order.dueDate),
      lineItems: order.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
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
      body.lineItems = values.lineItems;
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Edit order</SheetTitle>
          <SheetDescription>
            Customer and due date can always be changed.
          </SheetDescription>
        </SheetHeader>
        <form
          id="edit-order-form"
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.customer || undefined}>
              <FieldLabel htmlFor="edit-customer">Customer</FieldLabel>
              <Input id="edit-customer" {...form.register("customer")} />
              <FieldError errors={[form.formState.errors.customer]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.dueDate || undefined}>
              <FieldLabel htmlFor="edit-due-date">Due date</FieldLabel>
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
        <SheetFooter>
          <Button
            type="submit"
            form="edit-order-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
