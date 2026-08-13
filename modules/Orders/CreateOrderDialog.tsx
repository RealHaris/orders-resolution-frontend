"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { createOrder } from "@/common/rest-api-calls/application/orders";
import { todayUtcDateInput } from "@/common/utils/date";
import { Badge } from "@/components/ui/badge";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LineItemsEditor } from "@/modules/Orders/LineItemsEditor";
import { invalidateOrdersListAndSummary } from "@/modules/Orders/order-cache";
import {
  emptyLineItem,
  orderFormSchema,
  toOrderLineItemsInput,
  type OrderFormValues,
} from "@/modules/Orders/order-form-schema";

/**
 * Create-order dialog. Remount with a new `key` when opened so the form resets.
 * The body scrolls vertically when there are many line items; header and
 * footer stay fixed.
 */
export function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: "onChange",
    defaultValues: {
      customer: "",
      dueDate: todayUtcDateInput(),
      lineItems: [emptyLineItem],
    },
  });

  const dueDate = useWatch({ control: form.control, name: "dueDate" });
  const isOverdueOrder = !!dueDate && dueDate < todayUtcDateInput();

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      onOpenChange(false);
      await invalidateOrdersListAndSummary();
    },
  });

  /**
   * Submits a new order to POST /api/orders.
   */
  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      customer: values.customer,
      dueDate: values.dueDate,
      lineItems: toOrderLineItemsInput(values.lineItems),
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[85dvh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Add a customer, due date, and at least one line item.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-order-form"
          onSubmit={onSubmit}
          className="flex min-h-0 flex-col gap-4"
        >
          <FieldGroup className="flex-1 min-h-0">
            <Field data-invalid={!!form.formState.errors.customer || undefined}>
              <FieldLabel htmlFor="create-customer" required>
                Customer
              </FieldLabel>
              <Input
                id="create-customer"
                placeholder="Customer name"
                {...form.register("customer")}
              />
              <FieldError errors={[form.formState.errors.customer]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.dueDate || undefined}>
              <FieldLabel htmlFor="create-due-date" required>
                Due date
              </FieldLabel>
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    id="create-due-date"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.dueDate]} />
            </Field>
            <LineItemsEditor
              control={form.control}
              register={form.register}
              errors={form.formState.errors.lineItems}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {isOverdueOrder ? (
              <Badge variant="destructive">Overdue order</Badge>
            ) : null}
            <Button
              type="submit"
              form="create-order-form"
              disabled={mutation.isPending || !form.formState.isValid}
            >
              {mutation.isPending ? "Creating…" : "Create order"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
