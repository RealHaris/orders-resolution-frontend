import { z } from "zod";

import { ORDER_LIMITS } from "@/common/constants/shared/orders";

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
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(ORDER_LIMITS.MIN_QUANTITY, "Quantity must be at least 1")
    .max(
      ORDER_LIMITS.MAX_QUANTITY,
      `Quantity must be at most ${ORDER_LIMITS.MAX_QUANTITY}`,
    ),
  unitPrice: z
    .number({ error: "Unit price must be a number" })
    .min(ORDER_LIMITS.MIN_UNIT_PRICE, "Unit price must be at least $0.01")
    .max(
      ORDER_LIMITS.MAX_UNIT_PRICE,
      `Unit price must be at most ${ORDER_LIMITS.MAX_UNIT_PRICE}`,
    ),
});

/**
 * Zod schema for create and edit order forms.
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

/** Empty line used when adding a row. */
export const emptyLineItem: OrderFormValues["lineItems"][number] = {
  description: "",
  quantity: 1,
  unitPrice: 0.01,
};
