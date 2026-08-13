"use client";

import {
  Controller,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";

import { CharacterCounter } from "@/common/components/shared/CharacterCounter/CharacterCounter";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { ORDER_LIMITS } from "@/common/constants/shared/orders";
import { previewLineTotal } from "@/common/utils/money";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupPrefix } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  blockNonNumericKey,
  insertNumericPaste,
} from "@/modules/Orders/numeric-input-helpers";
import type { OrderFormValues } from "@/modules/Orders/order-form-schema";
import { Trash2Icon } from "lucide-react";

/**
 * One editable line-item row with a live dollar preview. Quantity and unit
 * price are text inputs so they can be fully cleared; errors render below
 * each field without shifting the row (columns stay top-aligned). The
 * qty/price/total row sits on top with the remove button aligned to the
 * labels; the description spans the full width below.
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
  const description = useWatch({
    control,
    name: `lineItems.${index}.description`,
  });

  return (
    <div className="grid gap-3 rounded-lg border p-3">
      {/* Row 1 – Qty | Unit price | Line total | Remove */}
      <div className="grid grid-cols-[6rem_8rem_6rem_auto] items-start gap-3">
        <Field data-invalid={!!errors?.quantity || undefined}>
          <FieldLabel htmlFor={`line-quantity-${index}`} required>
            Qty
          </FieldLabel>
          <Controller
            control={control}
            name={`lineItems.${index}.quantity`}
            render={({ field }) => (
              <Input
                id={`line-quantity-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={disabled}
                value={field.value}
                onChange={field.onChange}
                onKeyDown={(event) => blockNonNumericKey(event)}
                onPaste={(event) => insertNumericPaste(event, field.onChange)}
              />
            )}
          />
          <FieldError errors={[errors?.quantity]} />
        </Field>
        <Field data-invalid={!!errors?.unitPrice || undefined}>
          <FieldLabel htmlFor={`line-unit-price-${index}`} required>
            Unit price
          </FieldLabel>
          <InputGroup>
            <InputGroupPrefix>$</InputGroupPrefix>
            <Controller
              control={control}
              name={`lineItems.${index}.unitPrice`}
              render={({ field }) => (
                <Input
                  id={`line-unit-price-${index}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  disabled={disabled}
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
        <div className="flex items-start justify-end">
          {canRemove && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Remove line item"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Row 2 – Description (full width) */}
      <Field
        data-invalid={!!errors?.description || undefined}
        className="col-span-full min-w-0"
      >
        <FieldLabel htmlFor={`line-description-${index}`} required>
          Description
        </FieldLabel>
        <Textarea
          id={`line-description-${index}`}
          rows={3}
          disabled={disabled}
          placeholder="Item description"
          className="resize-none break-words"
          {...register(`lineItems.${index}.description`)}
        />
        <FieldError errors={[errors?.description]} />
        <CharacterCounter
          value={description ?? ""}
          max={ORDER_LIMITS.MAX_DESCRIPTION_LENGTH}
        />
      </Field>
    </div>
  );
}
