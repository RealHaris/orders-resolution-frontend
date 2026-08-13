import { z } from "zod";

import { ORDER_LIMITS } from "@/common/constants/shared/orders";

/**
 * Builds the payment/refund form schema for a single order. The amount is
 * kept as a string in the form (like line-item prices) so users can fully
 * clear the field; it is converted to a number when the payment is submitted.
 *
 * @param maxAmount Remaining balance (payment) or refundable amount (refund).
 * @param exceedsMessage Message shown when the amount is above maxAmount.
 */
export const createPaymentFormSchema = (
  maxAmount: number,
  exceedsMessage: string,
) =>
  z.object({
    amount: z
      .string()
      .trim()
      .min(1, "Amount is required")
      // Lenient on purpose: `.5` and `12.` are valid mid-typing values.
      .refine(
        (value) => /^\d*\.?\d*$/.test(value),
        "Amount must be a number",
      )
      .refine(
        (value) => (value.split(".")[1] ?? "").length <= 2,
        "Amount can have at most 2 decimal places",
      )
      .refine(
        (value) => Number(value) >= ORDER_LIMITS.MIN_PAYMENT_AMOUNT,
        "Amount must be at least $0.01",
      )
      .refine(
        (value) => Number(value) <= maxAmount,
        exceedsMessage,
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

export type PaymentFormValues = z.infer<
  ReturnType<typeof createPaymentFormSchema>
>;