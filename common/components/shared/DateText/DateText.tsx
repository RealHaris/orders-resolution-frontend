import { formatDate } from "@/common/utils/date";

/**
 * ISO date formatted for display. Server Component.
 */
export function DateText({ iso }: { iso: string }) {
  return <span>{formatDate(iso)}</span>;
}
