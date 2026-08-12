"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/common/components/shared/EmptyState/EmptyState";
import { PageHeader } from "@/common/components/shared/PageHeader/PageHeader";
import { getOrdersColumns } from "@/common/components/shared/ui/table/columns/orders/orders-columns";
import { DataTable } from "@/common/components/shared/ui/table/data-table";
import {
  ORDERS_PAGE_SIZE,
  ORDER_STATUSES,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_CHARS,
} from "@/common/constants/shared/orders";
import { getErrorMessage } from "@/common/http";
import { useDebouncedValue } from "@/common/hooks/use-debounced-value";
import type { OrderStatus } from "@/common/types/application/orders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { queries } from "@/lib/queries";
import { CreateOrderButton } from "@/modules/Orders/CreateOrderButton";
import { ExportOrdersDialog } from "@/modules/Orders/ExportOrdersDialog";
import { OrdersFilters } from "@/modules/Orders/OrdersFilters";
import { OrdersSummaryStrip } from "@/modules/Orders/OrdersSummaryStrip";
import type { PaginationState } from "@tanstack/react-table";
import { CircleAlertIcon, DownloadIcon } from "lucide-react";

/**
 * Dashboard island: summary cards, filters, and the paginated orders table.
 */
export function OrdersDashboard() {
  const router = useRouter();
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    status: parseAsStringLiteral(ORDER_STATUSES),
    search: parseAsString.withDefault(""),
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [exportOpen, setExportOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = debouncedSearch.trim();
  const searchParam =
    trimmedSearch.length >= SEARCH_MIN_CHARS ? trimmedSearch : undefined;

  useEffect(() => {
    const next = searchParam ?? "";
    if (next === filters.search) {
      return;
    }
    void setFilters({ search: next || null });
  }, [filters.search, searchParam, setFilters]);

  const listParams = {
    pageNum: filters.page,
    pageSize: ORDERS_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
    ...(searchParam ? { search: searchParam } : {}),
  };

  const listQuery = useQuery({
    ...queries.orders.list(listParams),
  });
  const summaryQuery = useQuery({
    ...queries.orders.summary,
  });

  const columns = useMemo(() => getOrdersColumns(), []);
  const ordersData = listQuery.data?.list ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const pageIndex = Math.max(0, filters.page - 1);

  /**
   * Syncs DataTable pagination with the URL `page` param.
   */
  const handlePaginationChange = (state: PaginationState) => {
    void setFilters({ page: state.pageIndex + 1 });
  };

  /**
   * Applies a status filter and resets to the first page.
   */
  const handleStatusChange = (status: OrderStatus | undefined) => {
    void setFilters({ status: status ?? null, page: 1 });
  };

  /**
   * Updates the local search box. The query uses the debounced value.
   */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    void setFilters({ page: 1 });
  };

  const emptyMessage = (
    <EmptyState
      title="No orders yet"
      description="Create an order to start tracking payments and amounts due."
    >
      <CreateOrderButton />
    </EmptyState>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 lg:px-6">
        <PageHeader
          title="Orders"
          description="Track status, amounts due, and payments."
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setExportOpen(true);
                }}
              >
                <DownloadIcon />
                Export CSV
              </Button>
              <CreateOrderButton />
            </>
          }
        />
      </div>
      <OrdersSummaryStrip
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        activeStatus={filters.status ?? undefined}
        onSelectStatus={handleStatusChange}
      />
      <OrdersFilters
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        statusValue={filters.status ?? undefined}
        onStatusChange={handleStatusChange}
      />
      {listQuery.isError ? (
        <div className="px-4 lg:px-6">
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Could not load orders</AlertTitle>
            <AlertDescription>
              {getErrorMessage(listQuery.error)}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div className="px-4 lg:px-6">
        <DataTable
          columns={columns}
          data={ordersData}
          isPaginate
          manualPagination
          pageIndex={pageIndex}
          pageCount={totalPages}
          pageSize={ORDERS_PAGE_SIZE}
          onPaginationChange={handlePaginationChange}
          isLoading={listQuery.isLoading}
          emptyMessage={emptyMessage}
          getRowId={(row) => row._id}
          onRowClick={(row) => {
            router.push(`/orders/${row._id}`);
          }}
        />
      </div>
      <ExportOrdersDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
