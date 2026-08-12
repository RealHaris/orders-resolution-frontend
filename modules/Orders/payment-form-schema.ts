import { z } from "zod";

import { ORDER_LIMITS } from "@/common/constants/shared/orders";

/**
 * Zod schema for recording a payment.
 */
export const paymentFormSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .min(
      ORDER_LIMITS.MIN_PAYMENT_AMOUNT,
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
