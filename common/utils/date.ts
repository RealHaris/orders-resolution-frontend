/**
 * Formats an ISO 8601 timestamp for display in UTC.
 */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

/**
 * Converts an ISO timestamp to a `YYYY-MM-DD` value for date inputs.
 */
export const toDateInputValue = (iso: string): string => {
  if (iso.length >= 10) {
    return iso.slice(0, 10);
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
};

/**
 * Today's calendar date in UTC as `YYYY-MM-DD`.
 */
export const todayUtcDateInput = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * UTC calendar date `days` from today as `YYYY-MM-DD`.
 */
export const utcDateInputFromToday = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Parses a `YYYY-MM-DD` string into a local Date at midnight (for calendars).
 */
export const parseDateInput = (value: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

/**
 * Formats a Date as `YYYY-MM-DD` using local calendar parts.
 */
export const toDateInputValueFromDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
