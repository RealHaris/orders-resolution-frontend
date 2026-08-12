/**
 * Formats a dollar amount as USD for display. Does not convert cents.
 */
export const formatUsd = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Live form preview of quantity × unit price, rounded to 2 decimal places.
 * Server totals remain the source of truth after save.
 */
export const previewLineTotal = (
  quantity: number,
  unitPrice: number,
): number => {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return 0;
  }
  return Math.round(quantity * unitPrice * 100) / 100;
};
