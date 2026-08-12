import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { orders } from "./orders";
import { users } from "./users";

/**
 * Merged query-key factory. Use `queries.users.me` / `queries.orders.list(params)`.
 */
export const queries = mergeQueryKeys(users, orders);
