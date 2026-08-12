"use client";

import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/common/constants/shared/orders";
import type { OrderStatus } from "@/common/types/application/orders";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_ITEMS = [
  { label: "All statuses", value: "all" },
  ...ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABEL[status],
    value: status,
  })),
];

/**
 * Customer search and status select for the orders dashboard.
 */
export function OrdersFilters({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue?: OrderStatus;
  onStatusChange: (status: OrderStatus | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center lg:px-6">
      <Input
        value={searchValue}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
        placeholder="Search customers"
        className="max-w-sm"
        aria-label="Search customers"
      />
      <Select
        value={statusValue ?? "all"}
        onValueChange={(value) => {
          if (!value || value === "all") {
            onStatusChange(undefined);
            return;
          }
          onStatusChange(value as OrderStatus);
        }}
        items={STATUS_ITEMS}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
