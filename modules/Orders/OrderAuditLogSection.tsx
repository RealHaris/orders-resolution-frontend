import { DateText } from "@/common/components/shared/DateText/DateText";
import {
  AUDIT_ACTION_LABEL,
  ORDER_STATUS_LABEL,
} from "@/common/constants/shared/orders";
import type { OrderAuditEvent } from "@/common/types/application/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Append-only audit log of status-changing events.
 */
export function OrderAuditLogSection({
  auditLog,
}: {
  auditLog: OrderAuditEvent[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-medium">Audit log</h3>
      {auditLog.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit events yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <DateText iso={event.createdAt} />
                  </TableCell>
                  <TableCell>{AUDIT_ACTION_LABEL[event.action]}</TableCell>
                  <TableCell>
                    {event.fromStatus
                      ? ORDER_STATUS_LABEL[event.fromStatus]
                      : "—"}
                  </TableCell>
                  <TableCell>{ORDER_STATUS_LABEL[event.toStatus]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
