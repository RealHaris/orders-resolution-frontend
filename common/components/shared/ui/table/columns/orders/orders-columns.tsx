"use client";

import { DateText } from "@/common/components/shared/DateText/DateText";
import { MoneyText } from "@/common/components/shared/MoneyText/MoneyText";
import { StatusBadge } from "@/common/components/shared/StatusBadge/StatusBadge";
import { createDataTableColumnHelper } from "@/common/components/shared/ui/table/data-table";
import type { OrderListItem } from "@/common/types/application/orders";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const columnHelper = createDataTableColumnHelper<OrderListItem>();

/**
 * Column definitions for the orders dashboard table.
 */
export const getOrdersColumns = () => [
  columnHelper.accessor("customer", {
    header: "Customer",
    cell: ({ getValue }) => getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  columnHelper.accessor("orderTotal", {
    header: "Order total",
    meta: { align: "right" },
    cell: ({ getValue }) => <MoneyText amount={getValue()} />,
  }),
  columnHelper.accessor("amountPaid", {
    header: "Amount paid",
    meta: { align: "right" },
    cell: ({ getValue }) => <MoneyText amount={getValue()} />,
  }),
  columnHelper.accessor("amountDue", {
    header: "Amount due",
    meta: { align: "right" },
    cell: ({ getValue }) => <MoneyText amount={getValue()} />,
  }),
  columnHelper.accessor("dueDate", {
    header: "Due date",
    cell: ({ getValue }) => <DateText iso={getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { stopPropagation: true, align: "right" },
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/dashboard/orders/${row.original._id}`} />}
      >
        View
      </Button>
    ),
  }),
];
