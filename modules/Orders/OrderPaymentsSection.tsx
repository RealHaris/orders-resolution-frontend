import { DateText } from "@/common/components/shared/DateText/DateText";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { PAYMENT_KIND_LABEL } from "@/common/constants/shared/orders";
import type { OrderPayment } from "@/common/types/application/orders";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Payment history table (oldest first, matching the API). Server Component.
 */
export function OrderPaymentsSection({
  payments,
}: {
  payments: OrderPayment[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-medium">Payments and refunds</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Recorded at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <Badge
                      variant={
                        payment.kind === "refund" ? "destructive" : "default"
                      }
                    >
                      {PAYMENT_KIND_LABEL[payment.kind ?? "payment"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DateText iso={payment.date} />
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyText amount={payment.amount} />
                  </TableCell>
                  <TableCell>{payment.note || "—"}</TableCell>
                  <TableCell>
                    <DateText iso={payment.createdAt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
