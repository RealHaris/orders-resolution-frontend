import type { OrderStatus } from "@/common/types/application/orders";

/** Default page size for the orders dashboard table. */
export const ORDERS_PAGE_SIZE = 20;

/** Page-size options shown in the table footer. */
export const ORDERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Minimum characters before customer search is sent to the API. */
export const SEARCH_MIN_CHARS = 3;

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

/** Mirrors backend `ORDER_CONSTANTS` for client-side Zod limits. */
export const ORDER_LIMITS = {
  MIN_LINE_ITEMS: 1,
  MAX_LINE_ITEMS: 50,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10_000,
  MIN_UNIT_PRICE: 0.01,
  MAX_UNIT_PRICE: 1_000_000,
  MIN_PAYMENT_AMOUNT: 0.01,
  MAX_CUSTOMER_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTE_LENGTH: 500,
} as const;

/** Default due-date offset (days from today UTC) for new orders. */
export const DEFAULT_DUE_DATE_OFFSET_DAYS = 7;
