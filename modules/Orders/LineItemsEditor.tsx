"use client";

import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { ORDER_LIMITS } from "@/common/constants/shared/orders";
import { previewLineTotal } from "@/common/utils/money";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  emptyLineItem,
  type OrderFormValues,
} from "@/modules/Orders/order-form-schema";
import { LineItemsEditorRow } from "@/modules/Orders/LineItemsEditorRow";
import { PlusIcon } from "lucide-react";

/**
 * Add/remove line-item rows with a live order-total preview. Only the list of
 * rows scrolls; the Add line / Preview total row stays fixed at the bottom.
 */
export function LineItemsEditor({
  control,
  register,
  disabled = false,
  errors,
}: {
  control: Control<OrderFormValues>;
  register: UseFormRegister<OrderFormValues>;
  disabled?: boolean;
  errors?: FieldErrors<OrderFormValues>["lineItems"];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });
  const lineItems = useWatch({ control, name: "lineItems" }) ?? [];
  const previewTotal = lineItems.reduce(
    (sum, item) =>
      sum + previewLineTotal(Number(item?.quantity) || 0, Number(item?.unitPrice) || 0),
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Scrollable list of line items */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {fields.map((field, index) => (
          <LineItemsEditorRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            disabled={disabled}
            canRemove={fields.length > 1}
            onRemove={() => {
              remove(index);
            }}
            errors={
              errors && typeof errors === "object" && index in errors
                ? errors[index]
                : undefined
            }
          />
        ))}
      </div>
      {errors && "message" in errors && typeof errors.message === "string" ? (
        <FieldError>{errors.message}</FieldError>
      ) : errors && "root" in errors && errors.root?.message ? (
        <FieldError>{errors.root.message}</FieldError>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || fields.length >= ORDER_LIMITS.MAX_LINE_ITEMS}
          onClick={() => {
            append(emptyLineItem);
          }}
        >
          <PlusIcon />
          Add line
        </Button>
        <p className="text-sm">
          Preview total: <MoneyText amount={previewTotal} />
        </p>
      </div>
    </div>
  );
}
