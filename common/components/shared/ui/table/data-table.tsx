"use client";

import { EmptyState } from "@/common/components/shared/EmptyState/EmptyState";
import { ORDERS_PAGE_SIZE_OPTIONS } from "@/common/constants/shared/orders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  FlexRender,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableMeta,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2Icon,
} from "lucide-react";
import * as React from "react";

/** Default rows per page when the parent does not pass `pageSize`. */
const DEFAULT_PAGE_SIZE = 10;

/** Maximum numbered page buttons in the sliding window. */
const MAX_VISIBLE_PAGE_BUTTONS = 5;

/** Features registered for the shared DataTable (TanStack Table v9). */
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

/** Feature set type for DataTable column helpers. */
export type DataTableFeatures = typeof dataTableFeatures;

/** Column definition used by the shared DataTable. */
export type DataTableColumnDef<TData extends RowData, TValue = unknown> =
  ColumnDef<DataTableFeatures, TData, TValue>;

/**
 * Optional layout metadata supported by table columns.
 */
export type DataTableColumnMeta = {
  align?: "left" | "center" | "right";
  headClassName?: string;
  cellClassName?: string;
  stopPropagation?: boolean;
};

/**
 * Creates a typed column helper bound to DataTable features.
 */
export const createDataTableColumnHelper = <TData extends RowData>() =>
  createColumnHelper<DataTableFeatures, TData>();

/**
 * Public DataTable API — AlignUI prop names, shadcn chrome, TanStack v9 internals.
 */
export interface DataTableProps<TData extends RowData> {
  /**
   * Column defs from `createDataTableColumnHelper`.
   * TanStack v9 column defs are invariant in TValue, so mixed accessors need `any`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see JSDoc above
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  data: TData[];
  isPaginate?: boolean;
  enableRowSelection?: boolean;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  getRowId?: (originalRow: TData, index: number) => string;
  manualPagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  pageIndex?: number;
  className?: string;
  enableHover?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: TData) => void;
  tableMeta?: TableMeta<DataTableFeatures, TData>;
  hideSelectionInfo?: boolean;
  getRowClassName?: (row: Row<DataTableFeatures, TData>) => string | undefined;
  sortingState?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}

/**
 * Reads optional column meta without assuming a module-augmented ColumnMeta.
 */
const getColumnMeta = <TData extends RowData, TValue>(
  columnDef: ColumnDef<DataTableFeatures, TData, TValue>,
): DataTableColumnMeta | undefined => {
  return columnDef.meta as DataTableColumnMeta | undefined;
};

/**
 * Builds a sliding window of page indexes (and ellipsis markers) for the footer.
 */
const buildPageItems = (
  totalPages: number,
  currentPage: number,
): Array<number | "ellipsis"> => {
  if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
    return Array.from({ length: Math.max(totalPages, 0) }, (_, i) => i);
  }

  const items: Array<number | "ellipsis"> = [];
  let windowStart = Math.max(0, currentPage - 2);
  let windowEnd = Math.min(totalPages - 1, currentPage + 2);

  const windowSize = windowEnd - windowStart + 1;
  if (windowSize < MAX_VISIBLE_PAGE_BUTTONS) {
    const shiftRight = Math.min(
      totalPages - 1 - windowEnd,
      MAX_VISIBLE_PAGE_BUTTONS - windowSize,
    );
    windowEnd += shiftRight;
    const remaining = MAX_VISIBLE_PAGE_BUTTONS - (windowEnd - windowStart + 1);
    windowStart = Math.max(0, windowStart - remaining);
  }

  if (windowStart > 0) {
    items.push(0);
    if (windowStart > 1) {
      items.push("ellipsis");
    }
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }

  if (windowEnd < totalPages - 1) {
    if (windowEnd < totalPages - 2) {
      items.push("ellipsis");
    }
    items.push(totalPages - 1);
  }

  return items;
};

/**
 * Server-paginated (or client-paginated) table with loading and empty states.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  isPaginate = true,
  enableRowSelection = false,
  pageSize = DEFAULT_PAGE_SIZE,
  isLoading = false,
  emptyMessage = "No results.",
  onRowSelectionChange,
  getRowId,
  manualPagination = false,
  pageCount,
  onPaginationChange,
  pageIndex,
  className,
  enableHover = true,
  showHeader = true,
  onRowClick,
  tableMeta,
  hideSelectionInfo = false,
  getRowClassName,
  sortingState,
  onSortingChange,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: pageIndex ?? 0,
      pageSize,
    });

  const pagination: PaginationState = {
    pageIndex: pageIndex ?? internalPagination.pageIndex,
    pageSize,
  };

  const finalColumns = React.useMemo<
    ColumnDef<DataTableFeatures, TData, unknown>[]
  >(() => {
    if (!enableRowSelection) {
      return columns as ColumnDef<DataTableFeatures, TData, unknown>[];
    }

    const selectColumn: ColumnDef<DataTableFeatures, TData, unknown> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      ),
    };

    return [selectColumn, ...(columns as ColumnDef<DataTableFeatures, TData, unknown>[])];
  }, [columns, enableRowSelection]);

  /**
   * Applies a pagination updater and notifies the parent for server paging.
   */
  const handlePaginationChange = React.useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const current = {
        pageIndex: pageIndex ?? internalPagination.pageIndex,
        pageSize,
      };
      const next = typeof updater === "function" ? updater(current) : updater;
      setInternalPagination(next);
      onPaginationChange?.(next);
    },
    [internalPagination.pageIndex, onPaginationChange, pageIndex, pageSize],
  );

  /**
   * Forwards TanStack sorting updaters to the parent when controlled.
   */
  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const current = sortingState ?? [];
      const next = typeof updater === "function" ? updater(current) : updater;
      onSortingChange?.(next);
    },
    [onSortingChange, sortingState],
  );

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: finalColumns,
    meta: tableMeta,
    state: {
      pagination,
      rowSelection,
      sorting: sortingState ?? [],
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    manualPagination,
    ...(pageCount !== undefined ? { pageCount } : {}),
    ...(getRowId ? { getRowId } : {}),
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  React.useEffect(() => {
    if (!enableRowSelection || !onRowSelectionChange) {
      return;
    }
    onRowSelectionChange(
      table.getSelectedRowModel().rows.map((row) => row.original),
    );
    // Only re-run when the selection map changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex;
  const pageItems = buildPageItems(totalPages, currentPage);
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length;
  const pageSizeItems = ORDERS_PAGE_SIZE_OPTIONS.map((size) => ({
    label: String(size),
    value: String(size),
  }));

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="relative overflow-hidden rounded-xl border">
        <Table>
          {showHeader ? (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const meta = getColumnMeta(header.column.columnDef);
                    const align = meta?.align ?? "left";
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          align === "right" && "text-right",
                          align === "center" && "text-center",
                          meta?.headClassName,
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <FlexRender header={header} />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          ) : null}
          <TableBody>
            {isLoading && rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="h-40">
                  <div className="flex items-center justify-center">
                    <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="h-40">
                  {typeof emptyMessage === "string" ? (
                    <EmptyState title={emptyMessage} />
                  ) : (
                    emptyMessage
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    !enableHover && "hover:bg-transparent",
                    getRowClassName?.(row),
                  )}
                  onClick={() => {
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = getColumnMeta(cell.column.columnDef);
                    const align = meta?.align ?? "left";
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          align === "right" && "text-right",
                          align === "center" && "text-center",
                          meta?.cellClassName,
                        )}
                        onClick={
                          meta?.stopPropagation
                            ? (event) => {
                                event.stopPropagation();
                              }
                            : undefined
                        }
                      >
                        <FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {isLoading && rows.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </div>

      {isPaginate && totalPages > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!hideSelectionInfo && enableRowSelection ? (
              <span>
                {selectedCount} of {table.getRowCount()} row(s) selected
              </span>
            ) : (
              <span>
                Page {currentPage + 1} of {Math.max(totalPages, 1)}
              </span>
            )}
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                table.setPageSize(Number(value));
              }}
              items={pageSizeItems}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDERS_PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.firstPage();
              }}
              aria-label="First page"
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage();
              }}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </Button>
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  type="button"
                  variant={item === currentPage ? "outline" : "ghost"}
                  size="icon-sm"
                  onClick={() => {
                    table.setPageIndex(item);
                  }}
                >
                  {item + 1}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage();
              }}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.lastPage();
              }}
              aria-label="Last page"
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
