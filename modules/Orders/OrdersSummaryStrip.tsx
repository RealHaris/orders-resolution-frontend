"use client";

import { ORDER_STATUS_LABEL } from "@/common/constants/shared/orders";
import type { OrderStatus, OrdersSummary } from "@/common/types/application/orders";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_CARDS: Array<{
  key: keyof OrdersSummary;
  label: string;
  status?: OrderStatus;
}> = [
  { key: "all", label: "All" },
  { key: "pending", label: ORDER_STATUS_LABEL.pending, status: "pending" },
  {
    key: "partially_paid",
    label: ORDER_STATUS_LABEL.partially_paid,
    status: "partially_paid",
  },
  { key: "paid", label: ORDER_STATUS_LABEL.paid, status: "paid" },
  { key: "overdue", label: ORDER_STATUS_LABEL.overdue, status: "overdue" },
];

/**
 * Clickable status-count cards. Selecting a card sets the list status filter.
 */
export function OrdersSummaryStrip({
  summary,
  isLoading,
  activeStatus,
  onSelectStatus,
}: {
  summary?: OrdersSummary;
  isLoading: boolean;
  activeStatus?: OrderStatus;
  onSelectStatus: (status: OrderStatus | undefined) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-5">
      {SUMMARY_CARDS.map((card) => {
        const isActive =
          card.status === undefined
            ? activeStatus === undefined
            : activeStatus === card.status;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => {
              onSelectStatus(card.status);
            }}
            className="text-left"
          >
            <Card
              className={cn(
                "@container/card transition-shadow",
                isActive && "ring-2 ring-primary",
              )}
            >
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    (summary?.[card.key] ?? 0)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
