import type { OrderStatus } from "@/common/types/application/orders";

/** Default page size for the orders dashboard table. */
export const ORDERS_PAGE_SIZE = 20;

/** Page-size options shown in the table footer. */
export const ORDERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Minimum characters before customer search is sent to the API. */
export const SEARCH_MIN_CHARS = 2;

/** Debounce delay for the dashboard search input. */
export const SEARCH_DEBOUNCE_MS = 500;

/** Order statuses accepted by the list filter and summary cards. */
export const ORDER_STATUSES = [
  "pending",
  "partially_paid",
  "paid",
  "overdue",
] as const satisfies readonly OrderStatus[];

/** Human-readable labels for order statuses. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

/** Human-readable labels for cash-ledger row kinds. */
export const PAYMENT_KIND_LABEL: Record<"payment" | "refund", string> = {
  payment: "Payment",
  refund: "Refund",
};

/** Human-readable labels for audit actions. */
export const AUDIT_ACTION_LABEL: Record<
  | "order.created"
  | "order.updated"
  | "payment.recorded"
  | "refund.recorded",
  string
> = {
  "order.created": "Order created",
  "order.updated": "Order updated",
  "payment.recorded": "Payment recorded",
  "refund.recorded": "Refund recorded",
};

/** Badge variant map for order statuses (shadcn Badge variants). */
export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "outline" | "secondary" | "default" | "destructive"
> = {
  pending: "outline",
  partially_paid: "secondary",
  paid: "default",
  overdue: "destructive",
};

/**
 * Extra classes so statuses stay distinct when light primary === secondary.
 */
export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: "",
  partially_paid: "bg-accent text-accent-foreground",
  paid: "",
  overdue: "",
};

/** Mirrors backend `ORDER_CONSTANTS` for client-side Zod limits. */
export const ORDER_LIMITS = {
  MIN_LINE_ITEMS: 1,
  MAX_LINE_ITEMS: 50,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10_000,
  MIN_UNIT_PRICE: 0.01,
  MAX_UNIT_PRICE: 1_000_000,
  MIN_PAYMENT_AMOUNT: 0.01,
  MIN_REFUND_AMOUNT: 0.01,
  MAX_CUSTOMER_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTE_LENGTH: 500,
} as const;

/** Default due-date offset (days from today UTC) for new orders. */
export const DEFAULT_DUE_DATE_OFFSET_DAYS = 7;
