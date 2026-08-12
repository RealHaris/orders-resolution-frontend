import { getMe } from "@/common/rest-api-calls/application/accounts";
import { createQueryKeys } from "@lukemorales/query-key-factory";

/**
 * React Query keys for the authenticated user.
 */
export const users = createQueryKeys("users", {
  /**
   * Current session user from GET /api/users/me.
   */
  me: {
    queryKey: null,
    queryFn: () => getMe(),
  },
});
