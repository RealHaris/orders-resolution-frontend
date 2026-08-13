import { z } from "zod";

import { ORDER_LIMITS } from "@/common/constants/shared/orders";

/**
 * Zod schema for recording a payment. The amount is kept as a string in the
 * form (like line-item prices) so users can fully clear the field; it is
 * converted to a number when the payment is submitted.
 */
export const paymentFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine(
      (value) => /^\d+(\.\d{0,2})?$/.test(value),
      "Amount must be a number",
    )
    .refine(
      (value) => Number(value) >= ORDER_LIMITS.MIN_PAYMENT_AMOUNT,
      "Amount must be at least $0.01",
    ),
  date: z.string().min(1, "Date is required"),
  note: z
    .string()
    .max(
      ORDER_LIMITS.MAX_NOTE_LENGTH,
      `Note must be at most ${ORDER_LIMITS.MAX_NOTE_LENGTH} characters`,
    )
    .optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
