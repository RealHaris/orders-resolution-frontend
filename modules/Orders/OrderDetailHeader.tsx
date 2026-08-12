import { DateText } from "@/common/components/shared/DateText/DateText";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { StatusBadge } from "@/common/components/shared/StatusBadge/StatusBadge";
import type { OrderDetail } from "@/common/types/application/orders";

/**
 * Customer, status, due date, and money summary. Server Component.
 */
export function OrderDetailHeader({ order }: { order: OrderDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">{order.customer}</h2>
        <StatusBadge status={order.status} />
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Order total</dt>
          <dd className="text-base font-medium">
            <MoneyText amount={order.orderTotal} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Amount paid</dt>
          <dd className="text-base font-medium">
            <MoneyText amount={order.amountPaid} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Amount due</dt>
          <dd className="text-base font-medium">
            <MoneyText amount={order.amountDue} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Due date</dt>
          <dd className="text-base font-medium">
            <DateText iso={order.dueDate} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
