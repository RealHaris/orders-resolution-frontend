"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { ApiError } from "@/common/http";
import { addOrderRefund } from "@/common/rest-api-calls/application/orders";
import type { OrderDetail } from "@/common/types/application/orders";
import { todayUtcDateInput } from "@/common/utils/date";
import { formatUsd } from "@/common/utils/money";
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
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";
import {
  patchOrderInLists,
  setOrderDetailCache,
} from "@/modules/Orders/order-cache";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "@/modules/Orders/payment-form-schema";

/**
 * Record-refund dialog. Mints one Idempotency-Key per unique payload.
 */
export function RecordRefundDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail;
}) {
  const [idempotency, setIdempotency] = useState<{
    key: string;
    payload: string;
  } | null>(null);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: order.amountPaid,
      date: todayUtcDateInput(),
      note: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      values,
      idempotencyKey,
    }: {
      values: PaymentFormValues;
      idempotencyKey: string;
    }) =>
      addOrderRefund(
        order._id,
        {
          amount: values.amount,
          date: values.date,
          note: values.note?.trim() ? values.note.trim() : undefined,
        },
        idempotencyKey,
      ),
    onSuccess: (updated) => {
      setOrderDetailCache(updated);
      patchOrderInLists(updated);
      void queryClient.invalidateQueries({
        queryKey: queries.orders.summary.queryKey,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.maxAllowedAmount !== undefined) {
        form.setError("amount", {
          message: `${error.msg} Maximum allowed: ${formatUsd(error.maxAllowedAmount)}.`,
        });
      }
    },
  });

  /**
   * Submits the refund, reusing the idempotency key when the payload is unchanged.
   */
  const onSubmit = form.handleSubmit((values) => {
    const payloadKey = JSON.stringify({
      amount: values.amount,
      date: values.date,
      note: values.note?.trim() ?? "",
    });
    const key =
      idempotency?.payload === payloadKey
        ? idempotency.key
        : crypto.randomUUID();
    if (idempotency?.payload !== payloadKey) {
      setIdempotency({ key, payload: payloadKey });
    }
    mutation.mutate({
      values,
      idempotencyKey: key,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record refund</DialogTitle>
          <DialogDescription>
            Maximum allowed: <MoneyText amount={order.amountPaid} />
          </DialogDescription>
        </DialogHeader>
        <form id="record-refund-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.amount || undefined}>
              <FieldLabel htmlFor="refund-amount">Amount</FieldLabel>
              <Input
                id="refund-amount"
                type="number"
                min={0.01}
                step={0.01}
                {...form.register("amount", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.amount]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.date || undefined}>
              <FieldLabel htmlFor="refund-date">Date</FieldLabel>
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    id="refund-date"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.date]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.note || undefined}>
              <FieldLabel htmlFor="refund-note">Note (optional)</FieldLabel>
              <Textarea id="refund-note" rows={3} {...form.register("note")} />
              <FieldError errors={[form.formState.errors.note]} />
              <FieldDescription>
                Refunds reduce the amount paid. Line items stay locked.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="record-refund-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Recording…" : "Record refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
