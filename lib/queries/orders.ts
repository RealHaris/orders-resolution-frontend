import {
  getOrder,
  getOrdersList,
  getOrdersSummary,
} from "@/common/rest-api-calls/application/orders";
import type { OrdersListParams } from "@/common/types/application/orders";
import { createQueryKeys } from "@lukemorales/query-key-factory";

/**
 * React Query keys for orders and settlements.
 */
export const orders = createQueryKeys("orders", {
  /**
   * Paginated dashboard list. Params include pageNum, pageSize, status, and search.
   */
  list: (params: OrdersListParams) => ({
    queryKey: [params],
    queryFn: () => getOrdersList(params),
  }),

  /**
   * Status counts for summary cards.
   */
  summary: {
    queryKey: null,
    queryFn: () => getOrdersSummary(),
  },

  /**
   * Full order detail including line items and payments.
   */
  detail: (orderId: string) => ({
    queryKey: [orderId],
    queryFn: () => getOrder(orderId),
  }),
});
