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

/** Cash-ledger row type. Amount is always positive dollars. */
export type PaymentKind = "payment" | "refund";

/** Audit actions written with every state-changing mutation. */
export type OrderAuditAction =
  | "order.created"
  | "order.updated"
  | "payment.recorded"
  | "refund.recorded";

/** Append-only payment or refund on an order, amounts in dollars. */
export type OrderPayment = {
  _id: string;
  kind: PaymentKind;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
};

/** Append-only audit event on an order. */
export type OrderAuditEvent = {
  _id: string;
  action: OrderAuditAction;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  actorUserId: string;
  note?: string;
  metadata?: Record<string, unknown>;
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
  auditLog: OrderAuditEvent[];
  createdAt: string;
  updatedAt: string;
};

/** Dashboard list row — no line items, payments, or audit. */
export type OrderListItem = Omit<
  OrderDetail,
  "lineItems" | "payments" | "auditLog"
>;

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

/** POST /orders/:id/refunds body. */
export type CreateRefundBody = {
  amount: number;
  date: string;
  note?: string;
};

/** POST /orders/export body. */
export type ExportOrdersBody = {
  startDate: string;
  endDate: string;
  fileName?: string;
};

/** DELETE /orders/:id success payload. */
export type DeleteOrderResult = {
  deleted: true;
};
