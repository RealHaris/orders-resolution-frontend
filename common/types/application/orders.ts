import type { PaginatedData } from "@/common/types/common";

/** API-facing order status including derived overdue. */
export type OrderStatus = "pending" | "partially_paid" | "paid" | "overdue";

/** A single line item in dollar amounts. */
export type OrderLineItem = {
  _id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

/** Append-only payment on an order, amounts in dollars. */
export type OrderPayment = {
  _id: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
};

/** Full order returned by create, get, update, and payment endpoints. */
export type OrderDetail = {
  _id: string;
  customer: string;
  dueDate: string;
  status: OrderStatus;
  subtotal: number;
  orderTotal: number;
  amountPaid: number;
  amountDue: number;
  lineItems: OrderLineItem[];
  payments: OrderPayment[];
  createdAt: string;
  updatedAt: string;
};

/** Dashboard list row — no line items or payments. */
export type OrderListItem = Omit<OrderDetail, "lineItems" | "payments">;

/** Query params for GET /orders. */
export type OrdersListParams = {
  pageNum: number;
  pageSize: number;
  status?: OrderStatus;
  search?: string;
};

/** Paginated orders list after HTTP unwrap. */
export type OrdersListResponse = PaginatedData<OrderListItem>;

/** Counts for dashboard summary cards. */
export type OrdersSummary = {
  all: number;
  pending: number;
  partially_paid: number;
  paid: number;
  overdue: number;
};

/** Line item body sent on create / update (no server-computed totals). */
export type OrderLineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

/** POST /orders body. */
export type CreateOrderBody = {
  customer: string;
  dueDate: string;
  lineItems: OrderLineItemInput[];
};

/** PUT /orders/:id partial body. */
export type UpdateOrderBody = {
  customer?: string;
  dueDate?: string;
  lineItems?: OrderLineItemInput[];
};

/** POST /orders/:id/payments body. */
export type CreatePaymentBody = {
  amount: number;
  date: string;
  note?: string;
};

/** DELETE /orders/:id success payload. */
export type DeleteOrderResult = {
  deleted: true;
};
