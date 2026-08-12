import { formatUsd } from "@/common/utils/money";

/**
 * Dollar amount formatted as USD. Server Component.
 */
export function MoneyText({ amount }: { amount: number }) {
  return <span className="tabular-nums">{formatUsd(amount)}</span>;
}
