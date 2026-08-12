"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { DEFAULT_DUE_DATE_OFFSET_DAYS } from "@/common/constants/shared/orders";
import { createOrder } from "@/common/rest-api-calls/application/orders";
import { utcDateInputFromToday } from "@/common/utils/date";
import { Button } from "@/components/ui/button";
import {
  Field,
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
import { invalidateOrdersListAndSummary } from "@/modules/Orders/order-cache";
import {
  emptyLineItem,
  orderFormSchema,
  type OrderFormValues,
} from "@/modules/Orders/order-form-schema";

/**
 * Create-order sheet. Remount with a new `key` when opened so the form resets.
 */
export function CreateOrderSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer: "",
      dueDate: utcDateInputFromToday(DEFAULT_DUE_DATE_OFFSET_DAYS),
      lineItems: [emptyLineItem],
    },
  });

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
    mutation.mutate(values);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Create order</SheetTitle>
          <SheetDescription>
            Add a customer, due date, and at least one line item.
          </SheetDescription>
        </SheetHeader>
        <form
          id="create-order-form"
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.customer || undefined}>
              <FieldLabel htmlFor="create-customer">Customer</FieldLabel>
              <Input id="create-customer" {...form.register("customer")} />
              <FieldError errors={[form.formState.errors.customer]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.dueDate || undefined}>
              <FieldLabel htmlFor="create-due-date">Due date</FieldLabel>
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
        <SheetFooter>
          <Button
            type="submit"
            form="create-order-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create order"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
