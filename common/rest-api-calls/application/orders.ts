import { request } from "@/common/http";
import type {
  CreateOrderBody,
  CreatePaymentBody,
  CreateRefundBody,
  DeleteOrderResult,
  ExportOrdersBody,
  OrderDetail,
  OrdersListParams,
  OrdersListResponse,
  OrdersSummary,
  UpdateOrderBody,
} from "@/common/types/application/orders";
import { PaginatedData } from "@/common/types/common";

/**
 * GET /api/orders
 */
export const getOrdersList = async (
  params: OrdersListParams,
): Promise<OrdersListResponse> => {
  try {
    const response = await request({
      method: "GET",
      path: "orders",
      args: {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    });
    return new PaginatedData(response as OrdersListResponse);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * GET /api/orders/summary
 */
export const getOrdersSummary = async (): Promise<OrdersSummary> => {
  try {
    const response = await request({
      method: "GET",
      path: "orders/summary",
    });
    return response as OrdersSummary;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * GET /api/orders/:id
 */
export const getOrder = async (orderId: string): Promise<OrderDetail> => {
  try {
    const response = await request({
      method: "GET",
      path: `orders/${orderId}`,
    });
    return response as OrderDetail;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/orders
 */
export const createOrder = async (
  body: CreateOrderBody,
): Promise<OrderDetail> => {
  try {
    const response = await request({
      method: "POST",
      path: "orders",
      data: body,
    });
    return response as OrderDetail;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * PUT /api/orders/:id
 */
export const updateOrder = async (
  orderId: string,
  body: UpdateOrderBody,
): Promise<OrderDetail> => {
  try {
    const response = await request({
      method: "PUT",
      path: `orders/${orderId}`,
      data: body,
    });
    return response as OrderDetail;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (
  orderId: string,
): Promise<DeleteOrderResult> => {
  try {
    const response = await request({
      method: "DELETE",
      path: `orders/${orderId}`,
    });
    return response as DeleteOrderResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/orders/:id/payments
 * Sends `Idempotency-Key` when provided so retries do not double-charge.
 */
export const addOrderPayment = async (
  orderId: string,
  body: CreatePaymentBody,
  idempotencyKey: string,
): Promise<OrderDetail> => {
  try {
    const response = await request({
      method: "POST",
      path: `orders/${orderId}/payments`,
      data: body,
      fetchOptions: {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    });
    return response as OrderDetail;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/orders/:id/refunds
 * Sends `Idempotency-Key` when provided so retries do not double-refund.
 */
export const addOrderRefund = async (
  orderId: string,
  body: CreateRefundBody,
  idempotencyKey: string,
): Promise<OrderDetail> => {
  try {
    const response = await request({
      method: "POST",
      path: `orders/${orderId}/refunds`,
      data: body,
      fetchOptions: {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    });
    return response as OrderDetail;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST /api/orders/export
 */
export const exportOrdersCsv = async (
  body: ExportOrdersBody,
): Promise<Blob> => {
  try {
    const response = await request({
      method: "POST",
      path: "orders/export",
      data: body,
      asBlob: true,
    });
    return response as Blob;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
