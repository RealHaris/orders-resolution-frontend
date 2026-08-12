"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";

import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { previewLineTotal } from "@/common/utils/money";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OrderFormValues } from "@/modules/Orders/order-form-schema";
import { Trash2Icon } from "lucide-react";

/**
 * One editable line-item row with a live dollar preview.
 */
export function LineItemsEditorRow({
  index,
  control,
  register,
  disabled,
  canRemove,
  onRemove,
  errors,
}: {
  index: number;
  control: Control<OrderFormValues>;
  register: UseFormRegister<OrderFormValues>;
  disabled?: boolean;
  canRemove: boolean;
  onRemove: () => void;
  errors?: {
    description?: { message?: string };
    quantity?: { message?: string };
    unitPrice?: { message?: string };
  };
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      {/* Row 1 – Description (full width) */}
      <Field data-invalid={!!errors?.description || undefined} className="col-span-full">
        <FieldLabel htmlFor={`line-description-${index}`}>
          Description
        </FieldLabel>
        <Textarea
          id={`line-description-${index}`}
          rows={3}
          disabled={disabled}
          className="resize-none"
          {...register(`lineItems.${index}.description`)}
        />
        <FieldError errors={[errors?.description]} />
      </Field>

      {/* Row 2 – Qty | Unit price | Line total | Remove */}
      <div className="grid grid-cols-[5rem_7rem_6rem_auto] gap-3 items-end">
        <Field data-invalid={!!errors?.quantity || undefined}>
          <FieldLabel htmlFor={`line-quantity-${index}`}>Qty</FieldLabel>
          <Input
            id={`line-quantity-${index}`}
            type="number"
            min={1}
            step={1}
            disabled={disabled}
            {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
          />
          <FieldError errors={[errors?.quantity]} />
        </Field>
        <Field data-invalid={!!errors?.unitPrice || undefined}>
          <FieldLabel htmlFor={`line-unit-price-${index}`}>Unit price</FieldLabel>
          <Input
            id={`line-unit-price-${index}`}
            type="number"
            min={0.01}
            step={0.01}
            disabled={disabled}
            {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
          />
          <FieldError errors={[errors?.unitPrice]} />
        </Field>
        <Field>
          <FieldLabel>Line total</FieldLabel>
          <div className="flex h-8 items-center text-sm">
            <Controller
              control={control}
              name={`lineItems.${index}.quantity`}
              render={({ field: quantityField }) => (
                <Controller
                  control={control}
                  name={`lineItems.${index}.unitPrice`}
                  render={({ field: unitPriceField }) => (
                    <MoneyText
                      amount={previewLineTotal(
                        Number(quantityField.value) || 0,
                        Number(unitPriceField.value) || 0,
                      )}
                    />
                  )}
                />
              )}
            />
          </div>
        </Field>
        <div className="flex items-end pb-0.5">
          {canRemove && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Remove line item"
            >
              <Trash2Icon />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
