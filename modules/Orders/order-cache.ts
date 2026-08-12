import type {
  OrderDetail,
  OrderListItem,
  OrdersListResponse,
} from "@/common/types/application/orders";
import { queryClient } from "@/lib/query-client";
import { queries } from "@/lib/queries";

/**
 * Strips line items and payments so a detail payload can patch a list row.
 */
export const toOrderListItem = (order: OrderDetail): OrderListItem => {
  return {
    _id: order._id,
    customer: order.customer,
    dueDate: order.dueDate,
    status: order.status,
    subtotal: order.subtotal,
    orderTotal: order.orderTotal,
    amountPaid: order.amountPaid,
    amountDue: order.amountDue,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * Replaces the matching row in every cached orders list page.
 */
export const patchOrderInLists = (order: OrderDetail) => {
  const listItem = toOrderListItem(order);
  queryClient.setQueriesData(
    { queryKey: queries.orders.list._def, exact: false },
    (current: OrdersListResponse | undefined) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        list: current.list.map((row) =>
          row._id === listItem._id ? listItem : row,
        ),
      };
    },
  );
};

/**
 * Writes the returned order into the detail cache.
 */
export const setOrderDetailCache = (order: OrderDetail) => {
  queryClient.setQueryData(queries.orders.detail(order._id).queryKey, order);
};

/**
 * Refetches every orders list variation and the summary counts.
 */
export const invalidateOrdersListAndSummary = async () => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queries.orders.list._def,
      exact: false,
    }),
    queryClient.invalidateQueries({
      queryKey: queries.orders.summary.queryKey,
    }),
  ]);
};
