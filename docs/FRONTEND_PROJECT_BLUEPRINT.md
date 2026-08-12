# Order Resolutions Frontend — Project Blueprint & Implementation Guide

> **Purpose:** Opinionated blueprint for `my-frontend`. It copies the orders-resolution frontend’s architecture — API layer, React Query, types, constants, modules, shared components, and TanStack Table — and applies it here with **shadcn/ui** primitives instead of AlignUI primitives.
>
> Give this file (plus the orders-resolution frontend codebase) to any agent or engineer so they can implement features without guessing folder layout, cache keys, or table wiring.

> **Companion specs:**
> - Backend patterns: `orders-be/docs/BACKEND_PROJECT_BLUEPRINT.md`
> - Orders API: `orders-be/docs/ORDERS_AND_SETTLEMENTS_API.md`
> - This app talks to `orders-be/my-backend`

---

## Table of Contents

1. [Decisions for this project](#1-decisions-for-this-project)
2. [Tech stack](#2-tech-stack)
3. [High-level architecture](#3-high-level-architecture)
4. [Directory structure](#4-directory-structure)
5. [Layer responsibilities](#5-layer-responsibilities)
6. [Naming conventions](#6-naming-conventions)
7. [HTTP client](#7-http-client)
8. [REST API calls](#8-rest-api-calls)
9. [Types](#9-types)
10. [Constants](#10-constants)
11. [React Query](#11-react-query)
12. [React Table (DataTable)](#12-react-table-datatable)
13. [Pagination](#13-pagination)
14. [URL state (`nuqs`)](#14-url-state-nuqs)
15. [UI components (shadcn)](#15-ui-components-shadcn)
16. [Shared components](#16-shared-components)
17. [Module components](#17-module-components)
18. [Layouts & route files](#18-layouts--route-files)
19. [Forms](#19-forms)
20. [Toasts, errors & loading](#20-toasts-errors--loading)
21. [Auth & session](#21-auth--session)
22. [Client stores (Valtio)](#22-client-stores-valtio)
23. [Hooks](#23-hooks)
24. [JSDoc & comments](#24-jsdoc--comments)
25. [Tooling & quality gates](#25-tooling--quality-gates)
26. [Step-by-step: adding a new feature](#26-step-by-step-adding-a-new-feature)
27. [Orders & settlements — frontend mapping](#27-orders--settlements--frontend-mapping)
28. [Reference file index](#28-reference-file-index)
29. [Anti-patterns to avoid](#29-anti-patterns-to-avoid)

---

## 1. Decisions for this project

These close the “orders-resolution vs this repo” ambiguities. Implement exactly this.

| Topic | Decision |
|-------|----------|
| UI primitives | **shadcn/ui** only. Live in `components/ui/`. Add via the shadcn CLI. Do **not** copy AlignUI buttons, inputs, badges, modals, selects, etc. |
| Data tables | Port the **AlignUI `DataTable` behavior** (TanStack Table v8 wrapper: server pagination, row selection, sorting, empty/loading, expandable rows). Render it with **shadcn** `Table`, `Pagination`, `Select`, and `Checkbox`. |
| Pagination chrome | **shadcn Pagination** (and shadcn Select for page-size). Never AlignUI `Pagination.Root` / `NavButton`. |
| Icons | **Lucide** (`lucide-react`), matching shadcn. Do not add `@remixicon/react`. |
| Design tokens | shadcn CSS variables (`bg-background`, `text-muted-foreground`, `border-border`, `--radius`, etc.). Do **not** use AlignUI tokens (`var(--bg-weak-50)`, `text-text-sub-600`, `text-label-sm`, …). |
| Toasts | **Sonner** via the shadcn `sonner` component. Do not copy AlignUI `toast-alert`. |
| Data fetching | **TanStack React Query v5** + `@lukemorales/query-key-factory`, same pattern as orders-resolution. |
| Query client | Singleton exported from `lib/query-client.ts`. Import `queryClient` from `@/lib/query-client` — never from `react-query` itself, never from a route file. |
| Cache updates | Prefer `queryClient.setQueriesData` over `invalidateQueries`. When invalidating, use `queries.<ns>.<key>._def` with `exact: false` so every variation of that query updates. |
| HTTP | One `request()` helper in `common/http`. Feature files never call `fetch` directly. |
| Cookies | `credentials: "include"` on every request. JWT lives in an httpOnly cookie set by the backend. |
| Money | API uses **decimal dollars**. Display with `Intl.NumberFormat`. Never invent cents on the client. |
| Dates | ISO 8601 UTC strings from the API. Format for display in one util. Do not parse with `new Date(str)` scattered through components. |
| Pagination contract | Backend `pageNum` is **1-indexed**. DataTable `pageIndex` is **0-indexed**. Convert at the module boundary. |
| List response | `{ list, count, totalPages, pageNum }`. Wrap with the `PaginatedData<T>` class. |
| Errors | Backend `{ msg, code, statusCode, errors? }`. Client `ApiError` exposes `message` / `msg` / `statusCode`. Never show raw stack traces. |
| Forms | `react-hook-form` + Zod + `@hookform/resolvers`. |
| URL filters | `nuqs` (`useQueryState` / `useQueryStates`) for page, search, status. |
| Client state | Valtio stores under `common/stores/` for session/user. Server data stays in React Query. |
| Barrel files | **Do not** create `index.ts` files whose only job is re-exporting components. Import from the file that defines the component. |
| `any` | Forbidden unless there is no alternative. Prefer `unknown` + narrowing. |
| Magic numbers | Belong in `common/constants/`. |

---

## 2. Tech stack

| Layer | Technology | Notes |
|-------|------------|--------|
| UI framework | React + TypeScript (strict) | JSDoc on functions |
| Styling | Tailwind CSS v4 + shadcn/ui (`base-nova`) | `components.json` |
| Component primitives | shadcn (Radix / Base UI under the hood) | `components/ui/*` |
| Data fetching | `@tanstack/react-query` ^5 | Singleton `queryClient` |
| Query keys | `@lukemorales/query-key-factory` | Merged `queries` object |
| Tables | `@tanstack/react-table` ^8 | AlignUI DataTable API, shadcn chrome |
| URL state | `nuqs` | Page/search/filter query params |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` | |
| Client stores | `valtio` | User/session only |
| Toasts | `sonner` (shadcn) | |
| Icons | `lucide-react` | |
| HTTP | `fetch` via `common/http` + `qs` | Cookie auth |
| Lint / format | ESLint 9 (flat) + Prettier + `prettier-plugin-tailwindcss` + `@tanstack/eslint-plugin-query` | orders-resolution frontend stack |
| Path alias | `@/*` → project root | `tsconfig.json` |

**Required packages to add** (not all are in the scaffold yet):

```
@tanstack/react-query
@lukemorales/query-key-factory
@tanstack/react-table
@tanstack/eslint-plugin-query
nuqs
qs
react-hook-form
zod
@hookform/resolvers
sonner
valtio
```

Dev / lint (match orders-resolution frontend):

```
prettier
prettier-plugin-tailwindcss
eslint-config-prettier
eslint-plugin-prettier
eslint-plugin-jsx-a11y
@tanstack/eslint-plugin-query
```

---

## 3. High-level architecture

Data never jumps layers. A screen does not call `fetch`. A query factory does not render UI. A shadcn primitive does not know about orders.

```
Route file (app/...)
    │  thin: layout + module only
    ▼
┌─────────────┐
│  layouts/   │  Shell (sidebar, topbar). No feature API calls except session.
└──────┬──────┘
       ▼
┌─────────────┐
│  modules/   │  Feature UI. Owns filters, useQuery/useMutation, table wiring.
└──────┬──────┘
       ▼
┌──────────────────┐
│ lib/queries/     │  Query keys + queryFn. No JSX.
└────────┬─────────┘
         ▼
┌──────────────────────────┐
│ common/rest-api-calls/   │  Typed functions. Call `request()`. No React.
└────────────┬─────────────┘
             ▼
┌──────────────────┐
│ common/http/     │  fetch + cookies + ApiError
└──────────────────┘
```

**Read path:** module `useQuery(queries.orders.list(params))` → query factory `queryFn` → `getOrdersList(params)` → `request({ method: "GET", path, args })`.

**Write path:** module `useMutation({ mutationFn: createOrder })` → REST function → `request({ method: "POST", path, data })` → `onSuccess` updates cache with `setQueriesData`.

**UI path:** module composes shadcn primitives + shared components + `DataTable` + column factories.

---

## 4. Directory structure

Target layout (orders-resolution folders, shadcn kept at `components/ui/`):

```
my-frontend/
├── app/                              # Route files only — thin
│   ├── layout.tsx                    # Root: fonts, Providers, Toaster
│   ├── page.tsx                      # Public landing / redirect
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── dashboard/
│       ├── layout.tsx                # DashboardLayout
│       ├── page.tsx                  # Orders list module
│       └── orders/[id]/page.tsx      # Order detail module
├── components/
│   ├── ui/                           # shadcn primitives ONLY
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── sonner.tsx
│   │   └── ...
│   ├── providers.tsx                 # QueryClientProvider + NuqsAdapter
│   └── app-sidebar.tsx               # Shell chrome (not a feature module)
├── common/
│   ├── http/
│   │   ├── index.ts                  # request(), ApiError
│   │   └── types.ts                  # HttpRequestOptions
│   ├── rest-api-calls/
│   │   └── application/
│   │       ├── accounts.ts           # login, signup, logout, getMe
│   │       └── orders.ts             # all order HTTP functions
│   ├── types/
│   │   ├── common.ts                 # PaginatedData, shared unions
│   │   └── application/
│   │       ├── user.ts
│   │       └── orders.ts
│   ├── constants/
│   │   └── shared/
│   │       ├── constants.ts          # app-wide
│   │       └── orders.ts             # page size, status labels, badges
│   ├── components/
│   │   └── shared/
│   │       ├── ErrorModal/
│   │       ├── ConfirmDialog/
│   │       └── ui/
│   │           └── table/
│   │               ├── data-table.tsx          # AlignUI DataTable port
│   │               ├── SortableColumnHeader.tsx
│   │               └── columns/
│   │                   └── orders/
│   │                       └── orders-columns.tsx
│   ├── hooks/                        # Reusable hooks (not feature-specific)
│   ├── stores/
│   │   └── application/
│   │       └── user-store.ts
│   └── utils/
│       ├── money.ts
│       ├── date.ts
│       └── auth.ts
├── lib/
│   ├── utils.ts                      # cn()
│   ├── query-client.ts               # singleton QueryClient
│   └── queries/
│       ├── index.ts                  # mergeQueryKeys → export queries
│       ├── users.ts
│       └── orders.ts
├── modules/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   └── Orders/
│       ├── Orders.tsx                # list container
│       ├── OrdersFilters.tsx
│       ├── OrderDetail.tsx
│       ├── CreateOrderDialog.tsx
│       └── RecordPaymentDialog.tsx
├── layouts/
│   └── DashboardLayout/
│       └── DashboardLayout.tsx
├── hooks/                            # shadcn-generated only (use-mobile)
├── components.json
├── eslint.config.mjs
├── .prettierrc
└── docs/
    └── FRONTEND_PROJECT_BLUEPRINT.md
```

**Rules:**

- `app/` files import a layout and a module. They do not contain tables, forms, or `useQuery`.
- `components/ui/` is generated/owned by shadcn. Do not put feature logic there.
- `common/components/shared/` is reusable across modules (confirm dialog, empty state, column helpers).
- `modules/<Feature>/` owns that feature’s screens and local subcomponents.
- `lib/queries/` has **no JSX** and **no** direct `fetch`.
- `common/rest-api-calls/` has **no React**.

---

## 5. Layer responsibilities

### 5.1 Route files (`app/**`)

- Export the page component.
- Wrap with the correct layout.
- Render **one** module (or a role switch between two modules).
- Set metadata if needed.
- No `useQuery`, no column defs, no form state.

### 5.2 Layouts (`layouts/`)

- App chrome: sidebar, topbar, breadcrumbs.
- May read `userStore` and `queries.users.me` to keep the session fresh.
- Must not fetch orders, payments, or other feature data.

### 5.3 Modules (`modules/`)

- Feature container: filters, dialogs, table, empty/error states.
- Calls `useQuery` / `useMutation`.
- Builds column defs via a factory (`getOrdersColumns({ onView, onPay })`).
- Converts 1-based `pageNum` ↔ 0-based `pageIndex`.
- Shows user-friendly errors from `ApiError.message`.

### 5.4 Shared components (`common/components/shared/`)

- Used by **more than one** module, or generic enough to be (DataTable, ConfirmDialog, CopyButton).
- May accept callbacks and data; they do not own query keys.

### 5.5 shadcn UI (`components/ui/`)

- Headless-styled primitives only.
- No domain types (`Order`, `User`) imported here.

### 5.6 Query factories (`lib/queries/`)

- `createQueryKeys("namespace", { ... })`.
- Each entry has `queryKey` and `queryFn`.
- Parameterized keys include every input that changes the response.

### 5.7 REST API (`common/rest-api-calls/`)

- One function per endpoint.
- JSDoc with HTTP method + path.
- `try/catch`: log, rethrow. Do not swallow.
- Return the typed response. Do not reshape into UI view-models here (mapping display labels belongs in constants / columns).

### 5.8 HTTP (`common/http/`)

- The only place `fetch` is called for the backend.
- Attaches cookies, serializes query strings, parses JSON, throws `ApiError`.

### 5.9 Types (`common/types/`)

- Request params, response bodies, enums/unions that match the API.
- No React types except where a shared UI contract truly needs `ReactNode`.

### 5.10 Constants (`common/constants/`)

- Page sizes, debounce ms, min search length, status labels, badge variants, validation limits that mirror the backend.

---

## 6. Naming conventions

| Kind | Pattern | Example |
|------|---------|---------|
| REST file | kebab-case, domain name | `common/rest-api-calls/application/orders.ts` |
| GET function | `get<Resource>` / `get<Resource>List` | `getOrdersList`, `getOrder` |
| POST/PATCH/DELETE | verb + resource | `createOrder`, `updateOrder`, `deleteOrder`, `addOrderPayment` |
| Query namespace | camelCase matching the merge key | `createQueryKeys("orders", { ... })` |
| Query entry | short noun | `list`, `detail`, `summary` |
| Type file | kebab-case | `common/types/application/orders.ts` |
| Type names | PascalCase, match API shape | `OrderListItem`, `OrdersListParams` |
| Constants file | kebab-case | `common/constants/shared/orders.ts` |
| Constant names | `SCREAMING_SNAKE` | `ORDERS_PAGE_SIZE`, `ORDER_STATUS_LABEL` |
| Module folder | PascalCase feature | `modules/Orders/` |
| Module root | same name as folder | `modules/Orders/Orders.tsx` |
| Column factory | `get<Feature>Columns` | `getOrdersColumns` |
| Shared component folder | PascalCase | `common/components/shared/ConfirmDialog/ConfirmDialog.tsx` |
| shadcn file | kebab-case | `components/ui/dropdown-menu.tsx` |
| Hook | `use<Thing>` | `useTeamRole` — only when logic is reused or large enough to extract |
| Store | `<name>-store.ts` | `user-store.ts` |

**Query key access (mandatory):**

```ts
queries.orders.list._def                          // all list variants
queries.orders.detail(orderId).queryKey           // one detail
queries.orders.summary.queryKey                   // static key
```

Never hand-write `["orders", "list", pageNum]`.

---

## 7. HTTP client

Port orders-resolution’s `src/common/http/index.ts` pattern. Adapt host and drop orders-resolution-only headers (`X-View-As-Client-Id`, `x-brand-id`) unless this app needs them.

### 7.1 `ApiError`

```ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    if (body) {
      for (const [key, value] of Object.entries(body)) {
        if (!API_ERROR_RESERVED_KEYS.has(key)) {
          (this as Record<string, unknown>)[key] = value;
        }
      }
    }
  }

  get msg(): string {
    return this.message;
  }
}
```

Reserved keys that must not be overwritten by the response body: `name`, `message`, `msg`, `statusCode`, `body`, `stack`.

### 7.2 `request()`

```ts
export const request = async (
  httpRequestOptions: HttpRequestOptions
): Promise<unknown> => { ... }
```

Behavior:

| Concern | Rule |
|---------|------|
| Host (dev) | `process.env.NEXT_PUBLIC_API_HOST` or `http://localhost:<backend-port>/api` |
| Host (prod) | `/api` (same-origin proxy) or the public API origin |
| Cookies | `credentials: "include"` always |
| GET query | `qs.stringify(args, { addQueryPrefix: true, arrayFormat: "repeat" })` |
| POST/PUT/PATCH/DELETE body | `JSON.stringify` unless `FormData` |
| Content-Type | `application/json` unless `FormData` |
| Non-OK | Parse JSON if possible; `reject(new ApiError(msg, status, body))` |
| `msg` | `errorBody.msg ?? response.statusText ?? "Request failed"` |
| 401 | Reject as `ApiError`. Auth layer redirects to login. Do not infinite-loop refresh unless a refresh endpoint exists (this backend does not). |
| Success JSON | `response.json()` |
| Blob downloads | `asBlob: true` → `response.blob()` |

`HttpRequestOptions`:

```ts
export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  host?: string;
  data?: unknown;
  args?: Record<string, unknown>;
  fetchOptions?: RequestInit;
  asBlob?: boolean;
}
```

`path` is relative to `/api` — e.g. `"orders"`, `"orders/${id}/payments"`, `"users/login"`. Do not prefix with `/api`.

---

## 8. REST API calls

One file per domain under `common/rest-api-calls/application/`.

### 8.1 Shape of a function

```ts
import { request } from "@/common/http";
import type {
  OrdersListParams,
  OrdersListResponse,
} from "@/common/types/application/orders";

/**
 * Fetches a paginated list of the authenticated user's orders.
 * GET /api/orders?search=&status=&pageNum=&pageSize=
 */
export const getOrdersList = async (
  params: OrdersListParams
): Promise<OrdersListResponse> => {
  try {
    const response = (await request({
      method: "GET",
      path: "orders",
      args: params,
    })) as OrdersListResponse;
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
```

### 8.2 Body payloads

orders-resolution often sends `data: JSON.stringify(payload)`. Prefer:

```ts
await request({
  method: "POST",
  path: "orders",
  data: JSON.stringify(payload),
});
```

The HTTP helper sets `Content-Type: application/json` when `data` is not `FormData`.

### 8.3 What does **not** belong here

- React hooks
- Toast calls
- Cache updates
- Status label maps (those are constants)
- Column renderers

Mutations that are not reused as queries still live here (`createOrder`, `addOrderPayment`). The module’s `useMutation({ mutationFn: createOrder })` calls them.

---

## 9. Types

### 9.1 Where they live

| Kind | Path |
|------|------|
| Cross-cutting | `common/types/common.ts` |
| Domain | `common/types/application/<domain>.ts` |

Do not colocate API types inside modules unless they are purely view-local (e.g. a dialog’s internal tab enum). If the backend returns it, it belongs in `common/types`.

### 9.2 Pagination types

Port orders-resolution’s `PaginatedData`:

```ts
export class PaginatedData<T> {
  pageNum: number = 1;
  count: number = 1;
  totalPages: number = 1;
  hasMoreData: boolean = true;
  list: T[] = [];
  constructor(data: Partial<PaginatedData<T>>) {
    Object.assign(this, {
      ...data,
      hasMoreData: (data.pageNum ?? 1) < (data.totalPages ?? 1),
    });
  }
}
```

Backend list payload is already `{ list, count, totalPages, pageNum }`. The class is the frontend’s canonical wrapper.

### 9.3 Domain types match the API

Example (`common/types/application/orders.ts`):

```ts
export type OrderStatus = "pending" | "partially_paid" | "paid" | "overdue";

export type OrderListItem = {
  _id: string;
  customer: string;
  dueDate: string;
  status: OrderStatus;
  subtotal: number;
  orderTotal: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderLineItem = {
  _id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderPayment = {
  _id: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
};

export type OrderDetail = OrderListItem & {
  lineItems: OrderLineItem[];
  payments: OrderPayment[];
};

export type OrdersListParams = {
  pageNum: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
};

export type OrdersListResponse = {
  list: OrderListItem[];
  count: number;
  totalPages: number;
  pageNum: number;
};

export type OrdersSummary = {
  pending: number;
  partially_paid: number;
  paid: number;
  overdue: number;
};
```

Money fields are **numbers in dollars**. Dates are **ISO strings**.

### 9.4 Do not duplicate backend internals

The backend stores cents (`orderTotalCents`). The frontend never sees cents. Do not add `*Cents` fields to frontend types.

---

## 10. Constants

Hardcoded page sizes, debounce delays, min search length, and status copy are defects.

```ts
// common/constants/shared/orders.ts

/** Default page size for the orders table. Mirrors backend DEFAULT_PAGE_SIZE. */
export const ORDERS_PAGE_SIZE = 20;

export const ORDERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Minimum characters before a debounced search fires. */
export const SEARCH_MIN_CHARS = 3;

/** Debounce delay for the orders search input (ms). */
export const SEARCH_DEBOUNCE_MS = 500;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

/** Maps API status → shadcn Badge variant. */
export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  partially_paid: "outline",
  paid: "default",
  overdue: "destructive",
};
```

App-wide values go in `common/constants/shared/constants.ts` as an `abstract class Constants` (orders-resolution style) **or** as `as const` objects. Prefer `as const` objects for new files; stay consistent within a file.

Validation limits that the UI must enforce (max line items, min payment) must mirror `ORDER_CONSTANTS` on the backend. Copy the numbers into a frontend constants file — do not import from the backend package.

---

## 11. React Query

This is the orders-resolution pattern. Do not invent a parallel cache.

### 11.1 Singleton client

`lib/query-client.ts`:

```ts
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/common/http";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        return;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong, please try again or contact support.";

      toast.error(message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
```

**Defaults explained:**

- `staleTime: Infinity` — a query is fetched once per session unless you invalidate, `setQueryData`, or override `staleTime` on that call.
- `retry: false` — failed queries do not hammer the API.
- No refetch on focus/reconnect — lists stay stable while the user edits.

Override `staleTime` **only** when the data must be fresh (e.g. a drawer that must not show a stale order: `staleTime: 0`).

### 11.2 Provider

`components/providers.tsx` (client component) wraps the tree:

```tsx
<QueryClientProvider client={queryClient}>
  <NuqsAdapter>{children}</NuqsAdapter>
</QueryClientProvider>
```

Mount `<Toaster />` (shadcn sonner) once at the root layout.

### 11.3 Query key factory

`lib/queries/orders.ts`:

```ts
import {
  getOrder,
  getOrdersList,
  getOrdersSummary,
} from "@/common/rest-api-calls/application/orders";
import type { OrdersListParams } from "@/common/types/application/orders";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const orders = createQueryKeys("orders", {
  list: (params: OrdersListParams) => ({
    queryKey: [params],
    queryFn: () => getOrdersList(params),
  }),
  detail: (orderId: string) => ({
    queryKey: [orderId],
    queryFn: () => getOrder(orderId),
  }),
  summary: {
    queryKey: null,
    queryFn: () => getOrdersSummary(),
  },
});
```

`lib/queries/index.ts`:

```ts
import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { orders } from "./orders";
import { users } from "./users";

export const queries = mergeQueryKeys(orders, users);
```

Every new namespace is: create file → `createQueryKeys` → add to `mergeQueryKeys`.

### 11.4 Using queries in a module

Spread the factory entry into `useQuery` so `queryKey` and `queryFn` both apply:

```ts
const { data, isLoading, isError, error } = useQuery(
  queries.orders.list({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    pageNum: currentPageNum,
    pageSize,
  })
);
```

Static keys:

```ts
useQuery(queries.orders.summary);
useQuery(queries.users.me);
```

Parameterized:

```ts
useQuery({
  ...queries.orders.detail(orderId),
  enabled: Boolean(orderId),
  staleTime: 0, // drawer/detail that must be fresh
});
```

### 11.5 Mutations

```ts
const { mutateAsync: submitPayment, isPending } = useMutation({
  mutationFn: (input: { orderId: string; amount: number; date: string; note?: string }) =>
    addOrderPayment(input.orderId, {
      amount: input.amount,
      date: input.date,
      note: input.note,
    }),
  onSuccess: (updatedOrder, variables) => {
    queryClient.setQueryData(
      queries.orders.detail(variables.orderId).queryKey,
      updatedOrder
    );
    queryClient.setQueriesData(
      { queryKey: queries.orders.list._def, exact: false },
      (old: OrdersListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          list: old.list.map((row) =>
            row._id === updatedOrder._id
              ? { ...row, /* list fields from updatedOrder */ }
              : row
          ),
        };
      }
    );
    void queryClient.invalidateQueries({
      queryKey: queries.orders.summary.queryKey,
    });
  },
});
```

### 11.6 Cache update rules (orders-resolution AGENTS.md)

1. **Prefer `setQueriesData` / `setQueryData`** so the UI updates without a refetch.
2. Use `invalidateQueries` only when the new server state is hard to reconstruct (aggregates, unknown inserts, deletes that affect counts/pages).
3. When targeting a family of queries, use the factory `_def` + `exact: false`:

```ts
queryClient.invalidateQueries({
  queryKey: queries.orders.list._def,
  exact: false,
});
```

This updates **all** pages/filters of `orders.list`, not just the current `pageNum`.

4. Import `queryClient` from `@/lib/query-client`. Do not call `useQueryClient()` for imperative updates in non-hook code (column callbacks, stores). Inside custom hooks, `useQueryClient()` is fine if it is the same singleton (it will be, because of the provider). orders-resolution’s rule is: **one imported singleton**. Follow that in modules and columns:

```ts
import { queryClient } from "@/lib/query-client";
```

### 11.7 Infinite queries

If a list is infinite-scroll instead of paged:

```ts
infiniteList: (params: Omit<OrdersListParams, "pageNum">) => ({
  queryKey: [params],
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getOrdersList({ ...params, pageNum: pageParam }),
}),
```

Use `useInfiniteQuery` with `initialPageParam: 1` and `getNextPageParam` from `totalPages`. Default for orders is **paged DataTable**, not infinite scroll.

---

## 12. React Table (DataTable)

orders-resolution has two table implementations. **This project uses the AlignUI DataTable API** (the one modules actually use for new tables), re-skinned with shadcn.

**Source of behavior:** `orders-fe/src/common/components/alignui/data-table.tsx`  
**Do not use** the older `common/components/shared/ui/table/data-table.tsx` as the template (URL-coupled, orders-resolution-specific column visibility).

**Destination:** `common/components/shared/ui/table/data-table.tsx`

### 12.1 What to port vs replace

| AlignUI DataTable piece | This project |
|-------------------------|--------------|
| `useReactTable` + `ColumnDef` + `PaginationState` + `SortingState` | Keep |
| Props interface (`DataTableProps`) | Keep (same names) |
| Server-side `manualPagination` | Keep |
| Row selection, expandable rows, `getRowId`, `onRowClick` | Keep |
| Empty / loading states | Keep, restyle with shadcn/Tailwind |
| `Table.Root` / `Table.Row` / `Table.Cell` | Replace with shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `Pagination.Root` / `Item` / `NavButton` | Replace with shadcn `Pagination` |
| `Select.Root` page-size | Replace with shadcn `Select` |
| AlignUI `Checkbox` | Replace with shadcn `Checkbox` |
| Remixicon arrows | Lucide `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight` |
| AlignUI color tokens | shadcn tokens |

### 12.2 Props contract (keep these names)

```ts
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPaginate?: boolean;              // default true
  enableRowSelection?: boolean;      // default false
  pageSize?: number;                 // default 10; orders should pass ORDERS_PAGE_SIZE
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  getRowId?: (originalRow: TData, index: number) => string;
  manualPagination?: boolean;
  pageCount?: number;                // required when manualPagination
  onPaginationChange?: (pagination: PaginationState) => void;
  pageIndex?: number;                // 0-based, controlled
  className?: string;
  enableHover?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: TData) => void;
  tableMeta?: TableMeta<TData>;
  hideSelectionInfo?: boolean;
  rowSelectionResetKey?: number;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  sortingState?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  getRowClassName?: (row: Row<TData>) => string | undefined;
}
```

`PaginationState` is TanStack’s `{ pageIndex: number; pageSize: number }`.

### 12.3 Server-paged usage (canonical)

This is how orders-resolution’s BacklinkOrders module drives the table. Copy this for orders:

```tsx
const pageIndex = Math.max(0, pageNum - 1);
const ordersData = ordersResponse?.list ?? [];
const totalPages = ordersResponse?.totalPages ?? 1;

const handlePaginationChange = React.useCallback(
  (state: PaginationState) => {
    setPageSize(state.pageSize);
    void setPageNum(state.pageIndex + 1);
  },
  [setPageNum]
);

<DataTable
  columns={columns}
  data={ordersData}
  isPaginate
  manualPagination
  pageIndex={pageIndex}
  pageCount={totalPages}
  pageSize={pageSize}
  onPaginationChange={handlePaginationChange}
  isLoading={isLoading}
  emptyMessage={emptyMessage}
  getRowId={(row) => row._id}
/>
```

**Critical:** `data` is the **array** (`list`), not the paginated envelope. `pageCount` is `totalPages`. `pageIndex` is `pageNum - 1`.

### 12.4 Column definitions

Columns live in `common/components/shared/ui/table/columns/<feature>/`, not inside the module file.

```ts
export function getOrdersColumns(options: OrdersColumnsOptions): ColumnDef<OrderListItem>[] {
  return [
    {
      accessorKey: "customer",
      header: "Customer",
      size: 220,
      cell: ({ row }) => row.original.customer,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[row.original.status]}>
          {ORDER_STATUS_LABEL[row.original.status]}
        </Badge>
      ),
    },
    // ...
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => options.onView(row.original._id)}
        >
          View
        </Button>
      ),
    },
  ];
}
```

Rules:

- Factory function takes **callbacks** (`onView`, `onPay`, `onEdit`) so columns stay presentational.
- `useMemo` the factory in the module when callbacks change.
- Use `accessorKey` for real fields; `id` for action columns.
- Declare `size` / `minSize` when the table uses fixed layout.
- Interactive cells that should not trigger `onRowClick` must stop propagation (AlignUI used `meta.stopPropagation` — keep that if you port `DataTableColumnMeta`).

### 12.5 Sortable headers

Port `SortableColumnHeader` to use Lucide icons and shadcn `Button`/`Tooltip`:

- Cycle: unsorted → asc → desc → unsorted.
- Multi-sort: `column.toggleSorting(desc, true)`.
- For **server** sort, the module holds `sortingState` and passes `onSortingChange`; the query params include the sort. This orders API does **not** expose sort (backend always `dueDate` asc, `createdAt` desc). Do not add client-side sort that disagrees with the server. Leave columns unsortable unless the API supports it.

### 12.6 Loading and empty

- `isLoading === true`: show a centered spinner (Lucide `Loader2`) in the table body, not a blank page.
- Empty: `emptyMessage` as `ReactNode` (title + subtitle), not a raw `"No results."` string when the feature has copy.

### 12.7 Client-side pagination

If the full list is already in memory (`manualPagination` omitted / false), DataTable uses `getPaginationRowModel` and `getFilteredRowModel`. Default for API lists is **manual**.

---

## 13. Pagination

### 13.1 Chrome = shadcn

Add the shadcn `pagination` component. DataTable’s footer uses:

- Previous / next (and first / last when many pages)
- Page number items + ellipsis
- “Page X of N” text
- Page-size `Select` (`10 / page`, `20 / page`, …)

Do **not** use AlignUI `Pagination.Root`. Do **not** build a one-off pagination for each module — it belongs inside `DataTable`.

### 13.2 Index conversion

| Layer | Index |
|-------|--------|
| URL (`nuqs`) | `page` 1-based, default `1` |
| REST `pageNum` | 1-based |
| TanStack `pageIndex` | 0-based |
| Backend parser | converts 1-based → 0-based internally, returns 1-based in JSON |

Convert only in the module (`pageIndex = pageNum - 1`, `setPageNum(state.pageIndex + 1)`). DataTable itself stays 0-based.

### 13.3 Page size

- Default `ORDERS_PAGE_SIZE` (20) — matches backend.
- Options must stay within backend min 1 / max 100.
- Changing page size resets to page 1 (`table.setPageIndex(0)` in DataTable — already in the AlignUI implementation).

### 13.4 Standalone pagination

If a non-table list needs paging, extract a small `TablePagination` shared component that wraps shadcn Pagination — do not copy-paste footer markup. Prefer putting the list in DataTable.

---

## 14. URL state (`nuqs`)

Filters that should survive refresh live in the query string.

```ts
const [pageNum, setPageNum] = useQueryState(
  "page",
  parseAsInteger.withDefault(1)
);
const [searchQuery, setSearchQuery] = useQueryState(
  "search",
  parseAsString.withDefault("")
);
const [statusFilter, setStatusFilter] = useQueryState(
  "status",
  parseAsString.withDefault("")
);
```

Rules:

- Changing search or status **resets page to 1**.
- Debounce search in module state; only send to the API when `trim().length >= SEARCH_MIN_CHARS` (or empty = clear search).
- Wrap the tree in `NuqsAdapter` (see Providers).
- Do not duplicate the same filter in Valtio.

---

## 15. UI components (shadcn)

### 15.1 Location

All primitives: `components/ui/<name>.tsx`.

Add with the CLI (do not hand-roll a parallel button):

```bash
npx shadcn@latest add table pagination select checkbox dialog form sonner card badge label textarea calendar popover alert dropdown-menu
```

(Skip ones already present: `button`, `input`, `separator`, `sheet`, `sidebar`, `tooltip`, `skeleton`, `avatar`, `breadcrumb`, `collapsible`.)

### 15.2 How to import

```ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
```

No barrel `components/ui/index.ts`.

### 15.3 Styling

- Use `cn()` from `@/lib/utils`.
- Use shadcn variants (`variant="outline"`, `size="sm"`).
- Do not add AlignUI `tv()` / `recursiveCloneChildren` unless a primitive truly needs it — shadcn already handles variants via `cva`.

### 15.4 What is **not** a UI primitive

Feature widgets (status badge that knows `OrderStatus`, order filters bar) are **shared** or **module** components that *use* shadcn `Badge` / `Input`.

---

## 16. Shared components

`common/components/shared/<Name>/<Name>.tsx`

Use this folder when:

- Two or more modules need it, or
- It is a generic building block (ConfirmDialog, CopyButton, DateText, MoneyText, EmptyState).

Examples for this app:

| Component | Role |
|-----------|------|
| `ConfirmDialog` | Delete order, destructive confirms |
| `MoneyText` | `Intl.NumberFormat` USD |
| `DateText` | ISO → display |
| `StatusBadge` | Maps `OrderStatus` → shadcn Badge |
| `DataTable` | See §12 |
| `SortableColumnHeader` | See §12.5 |

Each component gets JSDoc. Export the component from its own file.

**Modal reset:** do not `useEffect` to reset form state when `open` flips. Use a `key` on the dialog to remount, or a `useRef` render-phase check (`prevOpenRef.current !== open`) as in orders-resolution AGENTS.md.

---

## 17. Module components

`modules/<Feature>/` is the feature’s home.

```
modules/Orders/
  Orders.tsx                 # list page body
  OrdersFilters.tsx          # search + status
  OrderDetail.tsx            # detail page body
  CreateOrderDialog.tsx
  RecordPaymentDialog.tsx
  DeleteOrderDialog.tsx
```

### 17.1 Container responsibilities (`Orders.tsx`)

1. Read URL state (`nuqs`).
2. Debounce search.
3. `useQuery(queries.orders.list(...))` and `useQuery(queries.orders.summary)`.
4. Memoize columns with action callbacks.
5. Render filters + error alert + DataTable + dialogs.
6. Wire pagination ↔ URL.

### 17.2 Keep modules focused

If a dialog is large, it is its own file in the same folder. If a helper is used only here, it may live next to the module. If a type is an API type, it still lives in `common/types`.

### 17.3 Do not import other features’ internals

`modules/Orders` may import `common/*`, `lib/queries`, `components/ui`. It must not import `modules/Auth/Login.tsx` internals. Shared needs go to `common/components/shared`.

---

## 18. Layouts & route files

### 18.1 Route files stay thin

```tsx
import { DashboardLayout } from "@/layouts/DashboardLayout/DashboardLayout";
import { Orders } from "@/modules/Orders/Orders";

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <Orders />
    </DashboardLayout>
  );
}
```

### 18.2 Dashboard layout

- Sidebar nav (Orders, maybe Account).
- User email from `userStore`.
- Logout calls `logout()` REST function, clears store, `queryClient.clear()`, redirect to login.
- On mount: `useQuery(queries.users.me)` and write into `userStore`.

### 18.3 Auth gate

Unauthenticated users hitting dashboard routes redirect to `/login`. Implement the gate in one place (layout or a small `RequireAuth` wrapper). Do not scatter `if (!user)` in every module.

---

## 19. Forms

- `react-hook-form` + Zod schema + `zodResolver`.
- Schema lives next to the dialog or in `modules/Orders/order-form-schema.ts`.
- Mirror backend rules (trimmed strings, quantity ≥ 1, unit price ≥ 0.01, payment > 0, no future payment dates).
- Show field errors from Zod; on server 400, map `errors[].path` if present, else toast `ApiError.message`.
- Submit buttons use `isPending` from `useMutation`.
- After success: close dialog, toast, update cache (§11.6).

---

## 20. Toasts, errors & loading

| Situation | UI |
|-----------|-----|
| Query error (list) | Inline `Alert` with `error.message` / fallback copy |
| Query error (global unexpected) | QueryCache `onError` → `toast.error` |
| Mutation error | Toast in `onError` or catch; prefer `ApiError.message` |
| 401 | Redirect to login; do not toast a stack |
| Network `Failed to fetch` | Silent in QueryCache (orders-resolution); optional inline “offline” later |
| Loading list | DataTable spinner |
| Loading detail | Skeleton in the detail module |
| Empty list | `emptyMessage` in DataTable |

Never expose internal service names or raw exception strings. Fallback:

> Something went wrong, please try again or contact support.

---

## 21. Auth & session

Backend (`my-backend`):

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/users/signup` | Sets `accessToken` cookie; 201 `{ success, data: { user } }` |
| POST | `/api/users/login` | Sets cookie; `{ success, data: { user } }` |
| POST | `/api/users/logout` | Clears cookie even if unauthenticated |
| GET | `/api/users/me` | Auth required |

Frontend:

1. `login` / `signup` REST functions; on success write `user` into `userStore`.
2. `credentials: "include"` so the cookie is stored.
3. `getMe` on dashboard mount; 401 → logout locally and redirect.
4. Do not put the JWT in `localStorage`.
5. Role is `User` only for this product — no admin/microworker splits.

---

## 22. Client stores (Valtio)

Use Valtio for **session and UI chrome**, not for server lists.

`common/stores/application/user-store.ts`:

```ts
interface UserStoreState {
  user?: User;
  update: {
    user: (user: User | undefined) => void;
  };
}
```

- Read with `useSnapshot(userStore)` in components.
- Write with `userStore.update.user(user)`.
- Orders list/detail **must not** live in Valtio.

---

## 23. Hooks

`common/hooks/` is for reusable hooks (media query, click outside, debounce).

Feature hooks (`useOrdersList`) are optional. orders-resolution often calls `useQuery` directly in the module. Do that unless the hook is shared or the module becomes unreadable.

Do **not** wrap every query in a custom hook that only forwards `useQuery(queries.x)`.

---

## 24. JSDoc & comments

- Every exported function and component: one short description.
- `@param` only when the name is not obvious.
- REST functions: include `GET /api/...` in the JSDoc.
- Do not narrate the code (`// increment i`).
- Do not delete existing commented-out code if you are editing orders-resolution files; in **this** repo, do not leave new commented-out code.

---

## 25. Tooling & quality gates

This frontend follows the **orders-resolution frontend** lint/format stack (ESLint + Prettier), not the backend Biome config.

### 25.1 ESLint

Extend orders-resolution’s `eslint.config.mjs`:

- `next`, `next/core-web-vitals`, `next/typescript`
- `plugin:@tanstack/eslint-plugin-query/recommended`
- `plugin:prettier/recommended`
- `plugin:jsx-a11y/recommended`

Notable rule choices from orders-resolution (keep unless they fight this repo):

- `react-hooks/exhaustive-deps`: off (orders-resolution). Prefer correct deps in **new** code anyway.
- `@typescript-eslint/no-explicit-any`: treat as error in this repo (stricter than orders-resolution’s off).

### 25.2 Prettier

`.prettierrc`:

```json
{
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn"]
}
```

### 25.3 Scripts

```json
{
  "lint": "eslint",
  "lint:fix": "eslint --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

### 25.4 TypeScript

- `strict: true`
- Path `@/*` → `./*`
- No `any`

### 25.5 VS Code (recommended)

Format on save with Prettier. Tailwind `classRegex` for `cn(`.

---

## 26. Step-by-step: adding a new feature

Work **top-down from types**, same order every time.

1. **Read the backend endpoint** (path, method, query/body, response, errors).
2. **Types** in `common/types/application/<feature>.ts`.
3. **Constants** (page size, labels, limits).
4. **REST functions** in `common/rest-api-calls/application/<feature>.ts`.
5. **Query factory** in `lib/queries/<feature>.ts` → merge in `lib/queries/index.ts`.
6. **Column factory** if there is a table.
7. **Module** container: URL state, `useQuery`, DataTable, dialogs.
8. **Route file** that only mounts the module + layout.
9. **shadcn add** any missing primitive.
10. **JSDoc**, user-facing errors, cache updates on mutations.

Do not start with the page file. Do not call `fetch` in the module.

---

## 27. Orders & settlements — frontend mapping

This app’s product surface. Implement against `my-backend`, not orders-resolution backlink orders.

### 27.1 Screens

| Route | Module | Data |
|-------|--------|------|
| `/login` | `Auth/Login` | `POST users/login` |
| `/signup` | `Auth/Signup` | `POST users/signup` |
| `/dashboard` | `Orders/Orders` | `GET orders`, `GET orders/summary` |
| `/dashboard/orders/[id]` | `Orders/OrderDetail` | `GET orders/:id` |

Optional: create-order as a dialog on the list, or a dedicated route. Prefer a dialog on the list to stay close to orders-resolution’s “list + modal” pattern.

### 27.2 API catalog (frontend functions)

| Function | HTTP | Query key |
|----------|------|-----------|
| `getOrdersList(params)` | `GET orders` | `queries.orders.list(params)` |
| `getOrdersSummary()` | `GET orders/summary` | `queries.orders.summary` |
| `getOrder(id)` | `GET orders/:id` | `queries.orders.detail(id)` |
| `createOrder(body)` | `POST orders` | mutation → invalidate `list` + `summary` |
| `updateOrder(id, body)` | `PUT orders/:id` | mutation → `setQueryData` detail + `setQueriesData` list |
| `deleteOrder(id)` | `DELETE orders/:id` | mutation → invalidate `list` + `summary` |
| `addOrderPayment(id, body)` | `POST orders/:id/payments` | mutation → set detail + patch list row + invalidate summary |

### 27.3 List query params

```
pageNum, pageSize, status?, search?
```

- `search` = customer name (backend regex). Debounce; min 3 chars.
- `status` = `pending | partially_paid | paid | overdue`.
- Sort is **server-fixed** (overdue first via `dueDate` asc). No sort toggles.

### 27.4 List columns (suggested)

| Column | Source |
|--------|--------|
| Customer | `customer` |
| Status | `status` → `StatusBadge` |
| Due date | `dueDate` → `DateText` |
| Total | `orderTotal` → `MoneyText` |
| Paid | `amountPaid` |
| Due | `amountDue` |
| Created | `createdAt` |
| Actions | View; Record payment if not `paid`; Edit; Delete if no payments |

List payload **excludes** `lineItems` and `payments`. Do not expect them on the table row. Open detail for those.

### 27.5 Detail

- Header: customer, status, due date, money summary.
- Line items table (client-side, small) — can use DataTable with `isPaginate={false}`.
- Payments table, append-only. “Record payment” dialog.
- Edit customer / due date (and line items only when `amountPaid === 0`).
- Delete only when there are zero payments; otherwise hide/disable with a tooltip.

### 27.6 Mutations & cache

| Action | Cache |
|--------|--------|
| Create order | `invalidateQueries(queries.orders.list._def)` + summary (new row + counts; page membership unknown) |
| Update order | `setQueryData` detail; `setQueriesData` list row |
| Add payment | `setQueryData` detail (response is full order); patch list money/status; invalidate summary |
| Delete order | `invalidateQueries` list + summary; redirect to list |

### 27.7 Idempotency

`POST .../payments` accepts optional `Idempotency-Key`. Generate a UUID per submit click; reuse the same key on retry of the **same** payload. Do not generate a new key on every render.

### 27.8 Money & dates on forms

- Inputs are dollars (`0.01` step).
- Send JSON numbers, not cents.
- `dueDate` / payment `date` as ISO date strings the backend parser accepts.
- Reject future payment dates in Zod (UTC calendar day).

### 27.9 Summary strip

`GET /api/orders/summary` drives four count cards above the table (pending, partially paid, paid, overdue). Clicking a card sets the `status` query param and resets page to 1.

---

## 28. Reference file index

Copy **patterns** from these orders-resolution files. Do not copy AlignUI primitives or orders-resolution-only product code (brands, backlinks, microworkers).

| Pattern | orders-resolution file |
|---------|-----------------|
| HTTP + `ApiError` | `src/common/http/index.ts`, `src/common/http/types.ts` |
| REST function | `src/common/rest-api-calls/application/backlink-orders.ts` |
| Query factory | `src/lib/queries/backlink-orders.ts` |
| Merged `queries` | `src/lib/queries/index.ts` |
| QueryClient defaults | `src/pages/_app.tsx` (`new QueryClient({...})`) — port to `lib/query-client.ts` |
| `setQueriesData` | `src/common/hooks/projects/useProject.ts` |
| Invalidate `_def` | `src/lib/invalidate-billing-queries.ts` |
| List module + DataTable | `src/modules/BacklinkOrders/BacklinkOrders.tsx` |
| Column factory | `src/common/components/shared/ui/table/columns/backlink-orders/backlink-orders-columns.tsx` |
| DataTable behavior | `src/common/components/alignui/data-table.tsx` |
| Sortable header | `src/common/components/shared/ui/table/SortableColumnHeader.tsx` |
| `PaginatedData` | `src/common/types/common.ts` |
| Domain types | `src/common/types/application/backlink-orders.ts` |
| Domain constants | `src/common/constants/shared/backlink-orders.ts` |
| Thin route | `src/pages/backlink-orders.tsx` |
| User store | `src/common/stores/application/user-store.ts` |
| ESLint | `eslint.config.mjs` |
| Prettier | `.prettierrc` |
| `cn()` | `src/lib/utils.ts` |

Backend contracts for this app:

| Concern | File |
|---------|------|
| Order routes | `my-backend/src/routes/orders.ts` |
| Auth routes | `my-backend/src/routes/users.ts` |
| List/detail JSON | `my-backend/src/utils/order-response.utils.ts` |
| Pagination JSON | `my-backend/src/types/pagination.types.ts` |
| Error JSON | `my-backend/src/types/error.ts` |
| Limits | `my-backend/src/constants/order.constants.ts` |

---

## 29. Anti-patterns to avoid

1. **`fetch` / `axios` in a module or component.** Always `common/http` → REST file → query/mutation.
2. **Hand-written query keys** (`["orders", page]`). Always `queries.*`.
3. **`invalidateQueries` for a single page** by passing `pageNum` into the key. Use `_def` + `exact: false`, or `setQueriesData`.
4. **Importing `QueryClient` from `@tanstack/react-query` to `new QueryClient()` inside a component.** One singleton.
5. **Putting feature JSX in `app/` route files.**
6. **Putting API types in the module** when they mirror the backend.
7. **Hardcoding `20`, `500`, `"Overdue"`** in JSX.
8. **AlignUI components or AlignUI CSS tokens** in this repo.
9. **A second DataTable implementation.** One shared `DataTable`.
10. **Client-side sort/filter that disagrees with the server** on a manually paginated table.
11. **Barrel `index.ts` files** for components.
12. **`any`.**
13. **Showing `error.stack` or backend internals** in the UI.
14. **Storing the access token in localStorage.**
15. **Valtio for the orders list.**
16. **`useEffect` to reset dialog forms** — remount with `key` or render-phase ref.
17. **Calling `invalidateQueries` after you already have the new entity** in the mutation response — `setQueryData` instead.
18. **Pagination UI copied into every module** instead of DataTable’s footer.
19. **Treating list rows as details** (no `payments` / `lineItems` on list).
20. **Converting dollars ↔ cents on the client.** The API already speaks dollars.

---

## Appendix A — Data flow cheat sheet (orders list)

```
URL ?page=2&status=overdue&search=
        │
        ▼
Orders module (nuqs + debounce)
        │
        ▼
useQuery(queries.orders.list({ pageNum: 2, status, pageSize: 20 }))
        │
        ▼
getOrdersList → request GET /api/orders?...
        │
        ▼
{ list, count, totalPages, pageNum }
        │
        ▼
DataTable
  data={list}
  manualPagination
  pageIndex={1}          // 2 - 1
  pageCount={totalPages}
  pageSize={20}
  columns={getOrdersColumns(...)}
  isLoading={isLoading}
        │
        ▼
shadcn Table + shadcn Pagination + shadcn Select
```

## Appendix B — Mutation cheat sheet

```
User submits RecordPaymentDialog
        │
        ▼
useMutation({ mutationFn: addOrderPayment })
        │
        ▼
POST /api/orders/:id/payments  + Idempotency-Key
        │
        ▼
onSuccess(updatedOrder)
  setQueryData(queries.orders.detail(id).queryKey, updatedOrder)
  setQueriesData(queries.orders.list._def, patch row)
  invalidateQueries(queries.orders.summary.queryKey)
  toast.success(...)
  close dialog
```

---

*End of blueprint. When a pattern is missing here, look up the orders-resolution reference file in §28 and adapt it: same layering, shadcn instead of AlignUI primitives, DataTable behavior unchanged.*
