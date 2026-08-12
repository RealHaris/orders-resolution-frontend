import type { IStringifyOptions } from "qs";

/**
 * Options for the shared `request()` HTTP helper.
 */
export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  host?: string;
  data?: unknown;
  args?: Record<string, unknown>;
  qsStringOptions?: IStringifyOptions;
  fetchOptions?: RequestInit;
  /**
   * When true, always return a `Blob` (e.g. file downloads).
   */
  asBlob?: boolean;
}

/**
 * Successful backend envelope. `request()` unwraps `data` before returning.
 */
export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};
