"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after `delayMs` of inactivity. Used for search debounce.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debounced;
}
