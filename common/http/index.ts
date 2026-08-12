import qs from "qs";

import { toastError, toastSuccess } from "@/common/components/shared/ToastAlert/toast-alert";
import {
  API_ERROR_TOAST_FALLBACK,
  API_NETWORK_ERROR_TOAST,
  getApiSuccessToast,
} from "@/common/constants/shared/toast";
import { DEFAULT_API_HOST } from "@/common/constants/shared/constants";
import type { HttpRequestOptions } from "./types";

/** ApiError own properties that must not be overwritten by response-body spread. */
const API_ERROR_RESERVED_KEYS = new Set([
  "name",
  "message",
  "msg",
  "statusCode",
  "body",
  "stack",
  "maxAllowedAmount",
  "errors",
]);

/**
 * Typed error for API responses that returned a non-2xx status code.
 */
export class ApiError extends Error {
  /** Remaining dollars allowed when a payment overpays. */
  public readonly maxAllowedAmount?: number;
  /** Field-level validation errors from the backend, if present. */
  public readonly errors?: unknown;

  constructor(
    message: string,
    /** HTTP status code returned by the server */
    public readonly statusCode: number,
    /** Parsed response body, if available */
    public readonly body?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";

    if (typeof body?.maxAllowedAmount === "number") {
      this.maxAllowedAmount = body.maxAllowedAmount;
    }
    if (body?.errors !== undefined) {
      this.errors = body.errors;
    }

    if (body) {
      for (const [key, value] of Object.entries(body)) {
        if (!API_ERROR_RESERVED_KEYS.has(key)) {
          (this as Record<string, unknown>)[key] = value;
        }
      }
    }
  }

  /**
   * Backward-compatible alias for `message`.
   */
  get msg(): string {
    return this.message;
  }
}

/**
 * Returns true when `error` is an `ApiError`.
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Reads a user-facing message from an unknown thrown value.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (isApiError(error) && error.msg) {
    return error.msg;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

/**
 * Resolves the API host for the current environment.
 */
const resolveHost = (override?: string): string => {
  if (override) {
    return override;
  }
  if (process.env.NEXT_PUBLIC_API_HOST) {
    return process.env.NEXT_PUBLIC_API_HOST;
  }
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }
  return DEFAULT_API_HOST;
};

/**
 * Serializes a request body for fetch.
 */
const serializeBody = (
  data: unknown,
): { body: BodyInit | undefined; contentType?: string } => {
  if (data === undefined || data === null) {
    return { body: undefined };
  }
  if (data instanceof FormData) {
    return { body: data };
  }
  if (typeof data === "string") {
    return { body: data, contentType: "application/json" };
  }
  return { body: JSON.stringify(data), contentType: "application/json" };
};

/**
 * Unwraps `{ success, data }` envelopes from this backend.
 */
const unwrapSuccessData = (json: unknown): unknown => {
  if (
    json !== null &&
    typeof json === "object" &&
    "success" in json &&
    "data" in json
  ) {
    return (json as { data: unknown }).data;
  }
  return json;
};

/**
 * True when an error toast would be noise (session probe).
 */
const shouldSkipErrorToast = (path: string, statusCode: number): boolean =>
  path === "users/me" && statusCode === 401;

/**
 * Shared fetch helper. Always sends cookies and unwraps `{ success, data }`.
 * Non-GET successes and all errors (except session 401) show a bottom-right toast.
 */
export const request = async (
  httpRequestOptions: HttpRequestOptions,
): Promise<unknown> => {
  const { method, args, asBlob } = httpRequestOptions;
  let { path, data, qsStringOptions, fetchOptions } = httpRequestOptions;
  const host = resolveHost(httpRequestOptions.host);

  data = data ?? undefined;

  qsStringOptions = {
    ...(qsStringOptions ?? undefined),
    addQueryPrefix: true,
    arrayFormat: "repeat" as const,
  };

  fetchOptions = {
    ...fetchOptions,
    method,
    credentials: "include",
    headers: {
      ...fetchOptions?.headers,
    },
  };

  if (method === "GET") {
    const queryString = qs.stringify(args, qsStringOptions);
    path = `${path}${queryString}`;
  } else if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {
    const serialized = serializeBody(data);
    fetchOptions = {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        ...(serialized.contentType && {
          "Content-Type": serialized.contentType,
        }),
      },
      body: serialized.body,
    };
  }

  const url = `${host}/${path}`;
  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch {
    toastError(API_NETWORK_ERROR_TOAST);
    throw new Error(API_NETWORK_ERROR_TOAST);
  }

  if (!response.ok) {
    let errorBody: Record<string, unknown> | undefined;
    try {
      errorBody = (await response.json()) as Record<string, unknown>;
    } catch {
      // empty or non-JSON error body
    }
    const msg =
      (typeof errorBody?.msg === "string" ? errorBody.msg : undefined) ??
      response.statusText ??
      API_ERROR_TOAST_FALLBACK;
    if (!shouldSkipErrorToast(path.split("?")[0] ?? path, response.status)) {
      toastError(msg);
    }
    throw new ApiError(msg, response.status, errorBody);
  }

  const successMessage = getApiSuccessToast(method, path.split("?")[0] ?? path);
  if (successMessage) {
    toastSuccess(successMessage);
  }

  if (asBlob) {
    return response.blob();
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const json: unknown = await response.json();
    return unwrapSuccessData(json);
  }

  return response.blob();
};
