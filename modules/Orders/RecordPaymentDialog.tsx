"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { DatePicker } from "@/common/components/shared/DatePicker/DatePicker";
import { CharacterCounter } from "@/common/components/shared/CharacterCounter/CharacterCounter";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { ApiError } from "@/common/http";
import { ORDER_LIMITS } from "@/common/constants/shared/orders";
import { addOrderPayment } from "@/common/rest-api-calls/application/orders";
import type { OrderDetail } from "@/common/types/application/orders";
import { formatUsd } from "@/common/utils/money";
import { todayUtcDateInput } from "@/common/utils/date";
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
import { InputGroup, InputGroupPrefix } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  blockNonNumericKey,
  insertNumericPaste,
} from "@/modules/Orders/numeric-input-helpers";
import {
  patchOrderInLists,
  setOrderDetailCache,
} from "@/modules/Orders/order-cache";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "@/modules/Orders/payment-form-schema";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";

/**
 * Record-payment dialog. Mints one Idempotency-Key per unique payload.
 */
export function RecordPaymentDialog({
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
      amount: String(order.amountDue),
      date: todayUtcDateInput(),
      note: "",
    },
  });

  const note = useWatch({ control: form.control, name: "note" });

  const mutation = useMutation({
    mutationFn: ({
      values,
      idempotencyKey,
    }: {
      values: PaymentFormValues;
      idempotencyKey: string;
    }) =>
      addOrderPayment(
        order._id,
        {
          amount: Number(values.amount),
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
   * Submits the payment, reusing the idempotency key when the payload is unchanged.
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
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[85dvh]">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Maximum allowed: <MoneyText amount={order.amountDue} />
          </DialogDescription>
        </DialogHeader>
        <form
          id="record-payment-form"
          onSubmit={onSubmit}
          className="flex min-h-0 flex-col gap-4"
        >
          <FieldGroup className="flex-1 min-h-0 overflow-y-auto">
            <Field data-invalid={!!form.formState.errors.amount || undefined}>
              <FieldLabel htmlFor="payment-amount" required>
                Amount
              </FieldLabel>
              <InputGroup>
                <InputGroupPrefix>$</InputGroupPrefix>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <Input
                      id="payment-amount"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      className="pl-6"
                      value={field.value}
                      onChange={field.onChange}
                      onKeyDown={(event) => blockNonNumericKey(event, true)}
                      onPaste={(event) =>
                        insertNumericPaste(event, field.onChange, true)
                      }
                    />
                  )}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.amount]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.date || undefined}>
              <FieldLabel htmlFor="payment-date" required>
                Date
              </FieldLabel>
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    id="payment-date"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.date]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.note || undefined}>
              <FieldLabel htmlFor="payment-note">Note (optional)</FieldLabel>
              <Textarea id="payment-note" rows={3} {...form.register("note")} />
              <FieldError errors={[form.formState.errors.note]} />
              <CharacterCounter
                value={note ?? ""}
                max={ORDER_LIMITS.MAX_NOTE_LENGTH}
              />
              <FieldDescription>
                Notes are stored with the payment and cannot be edited later.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="record-payment-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Recording…" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
