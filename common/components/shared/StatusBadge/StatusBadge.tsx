import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABEL,
} from "@/common/constants/shared/orders";
import type { OrderStatus } from "@/common/types/application/orders";
import { Badge } from "@/components/ui/badge";

/**
 * Status pill for an order. Server Component.
 */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant={ORDER_STATUS_BADGE_VARIANT[status]}
      className={ORDER_STATUS_BADGE_CLASS[status]}
    >
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
