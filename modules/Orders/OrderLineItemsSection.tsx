import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import type { OrderLineItem } from "@/common/types/application/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Line items table with a totals footer. Server Component.
 */
export function OrderLineItemsSection({
  lineItems,
  orderTotal,
}: {
  lineItems: OrderLineItem[];
  orderTotal: number;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-medium">Line items</h3>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right">
                  <MoneyText amount={item.unitPrice} />
                </TableCell>
                <TableCell className="text-right">
                  <MoneyText amount={item.lineTotal} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Order total</TableCell>
              <TableCell className="text-right">
                <MoneyText amount={orderTotal} />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </section>
  );
}
