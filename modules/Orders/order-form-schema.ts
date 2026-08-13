import { z } from "zod";

import { ORDER_LIMITS } from "@/common/constants/shared/orders";
import type { OrderLineItemInput } from "@/common/types/application/orders";

const lineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(
      ORDER_LIMITS.MAX_DESCRIPTION_LENGTH,
      `Description must be at most ${ORDER_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
    ),
  quantity: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .refine((value) => /^\d+$/.test(value), "Quantity must be a whole number")
    .refine(
      (value) => Number(value) >= ORDER_LIMITS.MIN_QUANTITY,
      "Quantity must be at least 1",
    )
    .refine(
      (value) => Number(value) <= ORDER_LIMITS.MAX_QUANTITY,
      `Quantity must be at most ${ORDER_LIMITS.MAX_QUANTITY}`,
    ),
  unitPrice: z
    .string()
    .trim()
    .min(1, "Unit price is required")
    // Lenient on purpose: `.5` and `12.` are valid mid-typing values.
    .refine(
      (value) => /^\d*\.?\d*$/.test(value),
      "Unit price must be a number",
    )
    .refine(
      (value) => (value.split(".")[1] ?? "").length <= 2,
      "Unit price can have at most 2 decimal places",
    )
    .refine(
      (value) => Number(value) >= ORDER_LIMITS.MIN_UNIT_PRICE,
      "Unit price must be at least $0.01",
    )
    .refine(
      (value) => Number(value) <= ORDER_LIMITS.MAX_UNIT_PRICE,
      `Unit price must be at most ${ORDER_LIMITS.MAX_UNIT_PRICE}`,
    ),
});

/**
 * Zod schema for create and edit order forms. Quantity and unit price are
 * kept as strings in the form so users can clear them; the API body is
 * converted to numbers via `toOrderLineItemsInput`.
 */
export const orderFormSchema = z.object({
  customer: z
    .string()
    .trim()
    .min(1, "Customer is required")
    .max(
      ORDER_LIMITS.MAX_CUSTOMER_LENGTH,
      `Customer must be at most ${ORDER_LIMITS.MAX_CUSTOMER_LENGTH} characters`,
    ),
  dueDate: z.string().min(1, "Due date is required"),
  lineItems: z
    .array(lineItemSchema)
    .min(ORDER_LIMITS.MIN_LINE_ITEMS, "Add at least one line item")
    .max(
      ORDER_LIMITS.MAX_LINE_ITEMS,
      `You can add at most ${ORDER_LIMITS.MAX_LINE_ITEMS} line items`,
    ),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

/** Empty line used when adding a row. Unit price defaults to 1, quantity blank. */
export const emptyLineItem: OrderFormValues["lineItems"][number] = {
  description: "",
  quantity: "",
  unitPrice: "1",
};

/**
 * Converts form line items (string quantity/unit price) into the numeric
 * API body shape.
 */
export const toOrderLineItemsInput = (
  lineItems: OrderFormValues["lineItems"],
): OrderLineItemInput[] =>
  lineItems.map((item) => ({
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
