/**
 * User-facing toast copy for non-GET API successes.
 */
export const API_SUCCESS_TOAST: Record<string, string> = {
  "POST:users/signup": "Account created",
  "POST:users/login": "Signed in",
  "POST:orders": "Order created",
  "POST:orders/export": "Export downloaded",
};

/**
 * Resolves a success toast for a mutation. GET never toasts success.
 */
export const getApiSuccessToast = (
  method: string,
  path: string,
): string | null => {
  if (method === "GET") {
    return null;
  }
  if (path === "users/logout") {
    return null;
  }
  const exact = API_SUCCESS_TOAST[`${method}:${path}`];
  if (exact) {
    return exact;
  }
  if (method === "POST" && /^orders\/[^/]+\/payments$/.test(path)) {
    return "Payment recorded";
  }
  if (method === "POST" && /^orders\/[^/]+\/refunds$/.test(path)) {
    return "Refund recorded";
  }
  if (method === "PUT" && /^orders\/[^/]+$/.test(path)) {
    return "Order updated";
  }
  if (method === "DELETE" && /^orders\/[^/]+$/.test(path)) {
    return "Order deleted";
  }
  return "Saved";
};

/** Fallback when the API does not return a message. */
export const API_ERROR_TOAST_FALLBACK = "Something went wrong. Please try again.";

/** Network / CORS failure. */
export const API_NETWORK_ERROR_TOAST = "Could not reach the server. Please try again.";
