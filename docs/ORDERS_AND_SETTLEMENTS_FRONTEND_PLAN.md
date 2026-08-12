# Orders & Settlements — Frontend Implementation Plan

> **Purpose:** File-by-file plan for implementing the assignment in `my-frontend` against `orders-be/my-backend`. **Do not implement from this document yet.** It only names files, component splits, queries, stores, and auth.
>
> **Companions:**
> - Patterns: [`FRONTEND_PROJECT_BLUEPRINT.md`](./FRONTEND_PROJECT_BLUEPRINT.md)
> - Backend API: `orders-be/docs/ORDERS_AND_SETTLEMENTS_API.md`
> - Live backend: `orders-be/my-backend`

**Legend**

| Tag | Meaning |
|-----|---------|
| **S** | Server Component — no hooks, no click handlers, no `'use client'` |
| **C** | Client Component — `'use client'` because of state, events, React Query, or browser APIs |
| **Reuse** | Already in the repo; later modify, do not recreate from scratch |
| **shadcn** | Add via CLI into `components/ui/`; do not hand-roll |

---

## Table of Contents

1. [Open questions](#1-open-questions)
2. [Product scope (what we build / skip)](#2-product-scope-what-we-build--skip)
3. [Backend contract the UI must honor](#3-backend-contract-the-ui-must-honor)
4. [Server vs client rule](#4-server-vs-client-rule)
5. [Pages: public vs protected](#5-pages-public-vs-protected)
6. [Authentication & logout](#6-authentication--logout)
7. [Store](#7-store)
8. [React Query catalog](#8-react-query-catalog)
9. [REST functions to create](#9-rest-functions-to-create)
10. [Types & constants](#10-types--constants)
11. [Complete file tree](#11-complete-file-tree)
12. [Layouts & sidebar](#12-layouts--sidebar)
13. [Dashboard (orders list)](#13-dashboard-orders-list)
14. [Order detail](#14-order-detail)
15. [Dialogs / sheets](#15-dialogs--sheets)
16. [Shared presentational pieces](#16-shared-presentational-pieces)
17. [shadcn primitives to add](#17-shadcn-primitives-to-add)
18. [Existing files — keep, strip, or ignore](#18-existing-files--keep-strip-or-ignore)
19. [Sample scenario → UI checks](#19-sample-scenario--ui-checks)
20. [Implementation order (later)](#20-implementation-order-later)

---

## 1. Open questions

Defaults below are what this plan assumes if you do not answer. Confirm or override.

| # | Question | Plan default |
|---|----------|----------------|
| 1 | Root `/` — marketing landing, or redirect? | Logged-out → `/login`. Logged-in → `/dashboard`. No marketing page. |
| 2 | Create-order UX — small modal, sheet, or dedicated page? | **Sheet** on the dashboard (line items need vertical space). No `/new` route. |
| 3 | Customer **search** (API supports it; assignment only requires status filter)? | **Yes** — search box on the dashboard, min 3 chars, debounced. |
| 4 | Edit order from the **list** row, or **detail only**? | **Detail only** for edit/delete/pay. List has a **View** action (row click also goes to detail). |
| 5 | Frontend dev port? Backend `CORS_ORIGINS` is `http://localhost:6010`. Scaffold defaults to `3000`. | Run frontend on **6010** (or update backend CORS). Document in README later. |
| 6 | Stretch (refunds, audit log, CSV)? | **Out of scope** — backend did not build them. |
| 7 | After signup, go to dashboard immediately? | **Yes** (cookie is set; same as login). |

---

## 2. Product scope (what we build / skip)

### Build

- Sign up, log in, log out (email + password).
- Cookie session; each user only sees their own orders (backend enforces; UI never shows another user’s ids).
- Create order: customer, due date, line items (description, quantity ≥ 1, unit price).
- Auto-display subtotal / order total from the **API** (do not re-implement cents math on the client except live form preview).
- Dashboard list: customer, status, order total, amount paid, amount due, due date.
- Filter by status (+ optional search).
- Order detail: line items + full payment history.
- Record payment (amount ≥ 0.01, date, optional note).
- Over-payment: show backend `msg` and `maxAllowedAmount`.
- Edit: `customer` + `dueDate` always (while the order exists). Line items **only when `amountPaid === 0`**.
- Delete: only when there are **zero payments**.

### Skip

- Refunds, audit log, CSV export.
- Tax, discounts, currency picker.
- Teams, admin, “view as client”.
- Updating or deleting a payment (append-only).

### Document in README later (status edge cases)

Paid always wins. Overdue is not sticky. Due date **today** (UTC) is not overdue. Editing `dueDate` can move unpaid/partial orders in or out of overdue. Two concurrent payments: backend atomic write; UI still sends `Idempotency-Key` per submit click.

---

## 3. Backend contract the UI must honor

### Envelope

Every success body is:

```json
{ "success": true, "data": <payload> }
```

The HTTP helper **unwraps `data`** before returning to React Query. orders-resolution’s API returned the payload at the top level — **do not copy that**. This backend wraps.

Errors (typical):

```json
{ "msg": "...", "code": "user" | "auth" | "general" | "rate-limit", "statusCode": 400, "reqId": "...", "errors": [...], "maxAllowedAmount": 600 }
```

`ApiError` must surface `msg`, `statusCode`, `errors`, and `maxAllowedAmount`.

### Auth

| Method | Path | Auth | UI use |
|--------|------|------|--------|
| POST | `/api/users/signup` | Public | Sign up form |
| POST | `/api/users/login` | Public | Login form |
| POST | `/api/users/logout` | Public (always clears cookie) | Logout button |
| GET | `/api/users/me` | Cookie | Session hydrate |

Cookie: httpOnly `accessToken`. `credentials: "include"` on every `fetch`. Never put the JWT in `localStorage`.

User JSON: `{ _id, email, role }` where `role` is `"User"`. No name, no avatar.

### Orders

| Method | Path | UI use |
|--------|------|--------|
| POST | `/api/orders` | Create sheet |
| GET | `/api/orders` | Dashboard table |
| GET | `/api/orders/summary` | Status count cards |
| GET | `/api/orders/:id` | Detail page |
| PUT | `/api/orders/:id` | Edit sheet (partial body) |
| DELETE | `/api/orders/:id` | Delete confirm |
| POST | `/api/orders/:id/payments` | Record-payment dialog; header `Idempotency-Key` |

List query: `pageNum` (1-based), `pageSize` (default 20, max 100), `status?`, `search?`.

List `data`: `{ list, count, totalPages, pageNum }` — **no** `lineItems` / `payments` on rows.

Detail `data`: full `OrderResponse` including `lineItems` and `payments`.

Summary `data`: `{ all, pending, partially_paid, paid, overdue }`.

Delete `data`: `{ deleted: true }`.

Payment create: **201** if new, **200** if idempotent replay. Both return the full order in `data`.

Money in JSON is **dollars**. Dates are ISO 8601 UTC (client may send `YYYY-MM-DD`).

### Edit / delete rules (backend)

- After first payment: line items (and totals) **read-only**. Customer and due date still editable.
- Delete allowed only if `payments.length === 0` → else **409** `"Orders with payments cannot be deleted"`.
- Overpay → **400** with `maxAllowedAmount`.
- Other user’s order → **404** (not 403). Detail page shows not-found, not “forbidden”.

---

## 4. Server vs client rule

**Default to Server Components.** Add `'use client'` only when the file needs:

- `useState` / `useRef` / `useReducer`
- event handlers (`onClick`, `onChange`, `onSubmit`)
- React Query (`useQuery`, `useMutation`)
- `nuqs` / `useRouter` / `usePathname` for interactive nav
- Valtio `useSnapshot`
- Browser-only APIs

**Do not** make a whole page a client component because one button is interactive. Split:

```
Page (S)
  └── PageHeader (S)
  └── OrdersDashboard (C)          ← the island that fetches + filters + table
        └── StatusFilterButton (C) ← tiny
        └── DataTable (C)
        └── CreateOrderSheet (C)
```

**Presentational** pieces that only receive props and render text/markup stay **S**, even if a **C** parent imports them. (A server component imported into a client component is bundled into that client boundary — that is fine. The point is: do not mark *those files* `'use client'` so they stay reusable from server pages too.)

**Data fetching:** order/user **lists and details used in interactive dashboards** go through React Query inside **C** islands. Do not also `fetch` the same list in the Server Component (double source of truth). The **auth gate** is the exception: it runs on the server (cookie present / redirect) without loading orders.

---

## 5. Pages: public vs protected

### Public (no cookie required)

| Route file | Component | Kind | Renders |
|------------|-----------|------|---------|
| `app/page.tsx` | — | **S** | Redirect: cookie → `/dashboard`, else `/login` |
| `app/login/page.tsx` | `LoginPage` | **S** | Title + `LoginForm` (**C**) |
| `app/signup/page.tsx` | `SignupPage` | **S** | Title + `SignupForm` (**C**) |

If a logged-in user hits `/login` or `/signup`, redirect to `/dashboard`.

### Protected (cookie required)

| Route file | Component | Kind | Renders |
|------------|-----------|------|---------|
| `app/dashboard/layout.tsx` | `DashboardLayout` | **S** | Shell: sidebar + header slot + `{children}` |
| `app/dashboard/page.tsx` | `DashboardPage` | **S** | Title + `OrdersDashboard` (**C**) |
| `app/dashboard/orders/[id]/page.tsx` | `OrderDetailPage` | **S** | Back link chrome + `OrderDetail` (**C**) |

No other routes. No `/account`, `/billing`, `/settings`.

### Auth gate

- `proxy.ts` (request interception): if path starts with `/dashboard` and no `accessToken` cookie → redirect `/login`. If path is `/login` or `/signup` and cookie exists → redirect `/dashboard`.
- Client 401 from `GET /users/me` or any orders call → logout locally + redirect `/login`.

---

## 6. Authentication & logout

### Sign up

1. `SignupForm` (**C**) validates with Zod (email, password 8–128).
2. `useMutation` → `signup({ email, password })` → `POST /api/users/signup`.
3. Cookie is set by the backend (not in JSON).
4. `onSuccess`: `userStore.update.user(data.user)`, `queryClient.setQueryData(queries.users.me.queryKey, data.user)`, navigate `/dashboard`.
5. 409 duplicate email → field or form error from `msg`.

### Log in

Same as signup against `POST /api/users/login`. 401 → `"Invalid email or password"` (do not say which field).

### Session hydrate

`DashboardLayout` mounts `SessionHydrator` (**C**, tiny):

```
useQuery(queries.users.me)
onSuccess → userStore.update.user(user)
on 401 → clear store, queryClient.clear(), redirect /login
```

`NavUser` reads `userStore` (email). Fallback initials from email.

### Log out

`LogoutButton` (**C**) inside `NavUser`:

1. `POST /api/users/logout` (even if cookie already invalid).
2. `userStore.update.user(undefined)`.
3. `queryClient.clear()`.
4. Navigate `/login`.

Do not require a successful `/me` to show the logout item.

---

## 7. Store

**One store only:** `common/stores/application/user-store.ts` (Valtio).

```
user?: { _id: string; email: string; role: "User" }
update.user(user | undefined)
```

- **Use for:** who is logged in (sidebar email, auth-aware chrome).
- **Do not use for:** orders list, summary, detail, filters, pagination. Those live in React Query + `nuqs`.

No other stores (no cart, no view-as-client, no brand).

---

## 8. React Query catalog

Singleton: `lib/query-client.ts` (**not a component**). Defaults: `staleTime: Infinity`, `retry: false`, no refetch on focus.

Provider: `components/providers.tsx` (**C**) — `QueryClientProvider` + `NuqsAdapter` + shadcn `Toaster`.

Merged export: `lib/queries/index.ts` → `export const queries = mergeQueryKeys(users, orders)`.

### `lib/queries/users.ts`

| Key | Params | queryFn | Used by |
|-----|--------|---------|---------|
| `queries.users.me` | none | `getMe()` | `SessionHydrator`, optional `NavUser` |

Mutations (not in the factory): `login`, `signup`, `logout` called from forms/buttons via `useMutation`.

### `lib/queries/orders.ts`

| Key | Params | queryFn | Used by |
|-----|--------|---------|---------|
| `queries.orders.list(params)` | `{ pageNum, pageSize, status?, search? }` | `getOrdersList` | `OrdersDashboard` |
| `queries.orders.summary` | none | `getOrdersSummary` | `OrdersSummaryStrip` |
| `queries.orders.detail(id)` | `orderId` | `getOrder` | `OrderDetail` |

### Mutations (module-level `useMutation`)

| Mutation | REST | Cache after success |
|----------|------|---------------------|
| `createOrder` | `POST /orders` | `invalidateQueries(queries.orders.list._def)` + `summary` |
| `updateOrder` | `PUT /orders/:id` | `setQueryData(detail)` + `setQueriesData(list._def)` |
| `deleteOrder` | `DELETE /orders/:id` | invalidate `list._def` + `summary`; navigate `/dashboard` |
| `addOrderPayment` | `POST /orders/:id/payments` | `setQueryData(detail)` with returned order; patch matching list row; invalidate `summary` |

Payment mutation **must** send `Idempotency-Key` (UUID created once per dialog submit attempt; reuse on retry of the same payload).

Import `queryClient` from `@/lib/query-client`. Prefer `setQueriesData` over `invalidateQueries`. When invalidating a family, use `_def` + `exact: false`.

---

## 9. REST functions to create

All under `common/rest-api-calls/application/`. No React. Unwrap `{ success, data }`.

| File | Function | HTTP |
|------|----------|------|
| `accounts.ts` | `signup` | POST `users/signup` |
| | `login` | POST `users/login` |
| | `logout` | POST `users/logout` |
| | `getMe` | GET `users/me` |
| `orders.ts` | `getOrdersList` | GET `orders` + `args` |
| | `getOrdersSummary` | GET `orders/summary` |
| | `getOrder` | GET `orders/:id` |
| | `createOrder` | POST `orders` |
| | `updateOrder` | PUT `orders/:id` |
| | `deleteOrder` | DELETE `orders/:id` |
| | `addOrderPayment` | POST `orders/:id/payments` + `Idempotency-Key` header |

HTTP core: `common/http/index.ts` (`request`, `ApiError`), `common/http/types.ts`.

---

## 10. Types & constants

| File | Contents |
|------|----------|
| `common/types/common.ts` | `PaginatedData<T>` |
| `common/types/application/user.ts` | `User`, `UserRoles` |
| `common/types/application/orders.ts` | `OrderStatus`, `OrderListItem`, `OrderDetail`, `OrderLineItem`, `OrderPayment`, `OrdersListParams`, `OrdersListResponse`, `OrdersSummary`, create/update/payment bodies |
| `common/constants/shared/orders.ts` | `ORDERS_PAGE_SIZE` (20), page-size options, `SEARCH_MIN_CHARS` (3), `SEARCH_DEBOUNCE_MS` (500), `ORDER_STATUS_LABEL`, badge variant map, Zod-facing limits mirroring backend `ORDER_CONSTANTS` |
| `common/constants/shared/auth.ts` | password min/max (8 / 128) |
| `common/utils/money.ts` | `formatUsd(amount: number)` display only — **not** cents conversion |
| `common/utils/date.ts` | `formatDate`, `toDateInputValue` (ISO → `YYYY-MM-DD` for inputs) |

Frontend types use **dollars** and ISO strings. Never `*Cents` fields.

---

## 11. Complete file tree

```
my-frontend/
├── proxy.ts                                      # C-runtime intercept: auth redirects
├── app/
│   ├── layout.tsx                                # S — fonts, Providers, children
│   ├── page.tsx                                  # S — redirect
│   ├── login/page.tsx                            # S
│   ├── signup/page.tsx                           # S
│   └── dashboard/
│       ├── layout.tsx                            # S — DashboardLayout
│       ├── page.tsx                              # S — dashboard heading + OrdersDashboard
│       └── orders/[id]/page.tsx                  # S — OrderDetailPage
├── components/
│   ├── providers.tsx                             # C — QueryClient + Nuqs + Toaster
│   ├── app-sidebar.tsx                           # C — Reuse; strip teams/projects
│   ├── nav-main.tsx                              # C — Reuse; flatten to Orders
│   ├── nav-user.tsx                              # C — Reuse; email + logout only
│   ├── team-switcher.tsx                         # unused (leave file; do not mount)
│   ├── nav-projects.tsx                          # unused (leave file; do not mount)
│   └── ui/                                       # shadcn only
├── layouts/
│   └── DashboardLayout/
│       ├── DashboardLayout.tsx                   # S — composes sidebar chrome
│       ├── DashboardHeader.tsx                   # S — title slot + SidebarTrigger island
│       ├── SidebarTriggerButton.tsx              # C — only the trigger button
│       └── SessionHydrator.tsx                   # C — useQuery(users.me)
├── modules/
│   ├── Auth/
│   │   ├── LoginForm.tsx                         # C
│   │   ├── SignupForm.tsx                        # C
│   │   └── AuthPageShell.tsx                     # S — centered card chrome
│   └── Orders/
│       ├── OrdersDashboard.tsx                   # C — queries, filters, table, sheets
│       ├── OrdersSummaryStrip.tsx                # C — clickable cards (sets status filter)
│       ├── OrdersFilters.tsx                     # C — search + status select
│       ├── OrderDetail.tsx                       # C — detail query + actions
│       ├── OrderDetailHeader.tsx                 # S — customer, status, money (props)
│       ├── OrderLineItemsSection.tsx             # S — wraps line-items table markup
│       ├── OrderPaymentsSection.tsx              # S — wraps payments table markup
│       ├── CreateOrderSheet.tsx                  # C
│       ├── EditOrderSheet.tsx                    # C
│       ├── RecordPaymentDialog.tsx               # C
│       ├── DeleteOrderDialog.tsx                 # C
│       ├── LineItemsEditor.tsx                   # C — add/remove rows (create/edit unpaid)
│       ├── LineItemsEditorRow.tsx                # C — one row: inputs + remove button
│       ├── order-form-schema.ts                  # Zod (not a component)
│       └── payment-form-schema.ts                # Zod
├── common/
│   ├── http/index.ts
│   ├── http/types.ts
│   ├── rest-api-calls/application/accounts.ts
│   ├── rest-api-calls/application/orders.ts
│   ├── types/common.ts
│   ├── types/application/user.ts
│   ├── types/application/orders.ts
│   ├── constants/shared/orders.ts
│   ├── constants/shared/auth.ts
│   ├── stores/application/user-store.ts
│   ├── utils/money.ts
│   ├── utils/date.ts
│   └── components/shared/
│       ├── PageHeader/PageHeader.tsx             # S
│       ├── StatusBadge/StatusBadge.tsx           # S
│       ├── MoneyText/MoneyText.tsx               # S
│       ├── DateText/DateText.tsx                 # S
│       ├── EmptyState/EmptyState.tsx             # S
│       ├── ConfirmDialog/ConfirmDialog.tsx       # C — reusable destructive confirm
│       ├── LogoutButton/LogoutButton.tsx         # C
│       └── ui/table/
│           ├── data-table.tsx                    # C — AlignUI DataTable behavior, shadcn chrome
│           └── columns/orders/orders-columns.tsx # C (cells may include buttons)
├── lib/
│   ├── utils.ts                                  # Reuse cn()
│   ├── query-client.ts
│   └── queries/
│       ├── index.ts
│       ├── users.ts
│       └── orders.ts
└── docs/
    ├── FRONTEND_PROJECT_BLUEPRINT.md
    └── ORDERS_AND_SETTLEMENTS_FRONTEND_PLAN.md   # this file
```

No barrel `index.ts` files for components.

---

## 12. Layouts & sidebar

### Root `app/layout.tsx` — **S**

- Fonts, `html`/`body`.
- Wrap children with `Providers` (**C**).
- No sidebar here.

### `layouts/DashboardLayout/DashboardLayout.tsx` — **S**

Composes (reuse existing dashboard page structure):

- `SidebarProvider` (**C**, already in `components/ui/sidebar.tsx`)
- `AppSidebar` (**C**, reuse)
- `SidebarInset`
- `DashboardHeader` (**S**) with `SidebarTriggerButton` (**C**) + `PageHeader` (**S**)
- `SessionHydrator` (**C**)
- `{children}`

### Sidebar — reuse and slim

**Keep and modify later:**

| File | Now | Later |
|------|-----|--------|
| `components/app-sidebar.tsx` | Sample teams + playground nav | Header: app name text (not `TeamSwitcher`). Content: `NavMain` only. Footer: `NavUser`. |
| `components/nav-main.tsx` | Nested collapsible sample | **Flat** single item: Orders → `/dashboard`. No submenus. |
| `components/nav-user.tsx` | Fake name/avatar + Upgrade/Billing | Email + initials fallback. Menu: **Log out** only (`LogoutButton`). Drop Upgrade, Account, Billing, Notifications. |

**Do not mount:**

| File | Why |
|------|-----|
| `components/team-switcher.tsx` | No teams in this product |
| `components/nav-projects.tsx` | No projects |

Leave those files on disk until you decide to delete them; the plan is not to wire them.

### Nav data (constants, not hardcoded in JSX)

`common/constants/shared/nav.ts` — `{ title: "Orders", url: "/dashboard", icon: … }`.

---

## 13. Dashboard (orders list)

### `app/dashboard/page.tsx` — **S**

- `PageHeader` title: “Orders”.
- Slot: `OrdersDashboard` (**C**).
- Does **not** call `useQuery`.

### `OrdersDashboard.tsx` — **C** (the island)

Owns:

- `nuqs`: `page`, `status`, `search`
- Debounced search
- `useQuery(queries.orders.list(...))`
- `useQuery(queries.orders.summary)`
- `DataTable` + `getOrdersColumns`
- Opens create sheet

Break out (do not dump everything in one file):

| Child | Kind | Why |
|-------|------|-----|
| `OrdersSummaryStrip` | **C** | Cards are buttons that set `status` + reset page |
| `OrdersFilters` | **C** | Search input + status `Select` |
| `CreateOrderSheet` | **C** | Form |
| `DataTable` | **C** | Pagination, row click |

### Summary cards

Four (or five with “All”) counts from `GET /orders/summary`.

Each card: label (**S** text) + count + click handler (**C** wrapper). Clicking `overdue` sets `?status=overdue&page=1`. Clicking All clears `status`.

### Table columns (`getOrdersColumns`)

| Column | Cell | Interactive? |
|--------|------|----------------|
| Customer | text | no |
| Status | `StatusBadge` (**S**) | no |
| Order total | `MoneyText` (**S**) | no |
| Amount paid | `MoneyText` | no |
| Amount due | `MoneyText` | no |
| Due date | `DateText` (**S**) | no |
| Actions | `ViewOrderButton` (**C**) | yes — navigates to `/dashboard/orders/:id` |

Row click → same as View. Action cell `stopPropagation`.

Server pagination: `manualPagination`, `pageIndex = pageNum - 1`, `pageCount = totalPages`, `pageSize = ORDERS_PAGE_SIZE`.

Empty: `EmptyState` (**S**) “No orders yet” + the create button lives in the dashboard header (**C** `CreateOrderButton`).

---

## 14. Order detail

### `app/dashboard/orders/[id]/page.tsx` — **S**

- Back link chrome can be a **C** `BackToOrdersButton` (uses router) next to **S** `PageHeader`.
- `OrderDetail` (**C**) with `id` from `params` (await params in the server page, pass `id` as prop).

### `OrderDetail.tsx` — **C**

- `useQuery({ ...queries.orders.detail(id), enabled: Boolean(id) })`
- Loading: skeletons
- 404: `EmptyState` “Order not found”
- Composes:

| Child | Kind | Role |
|-------|------|------|
| `OrderDetailHeader` | **S** | Customer, `StatusBadge`, due date, money summary (props) |
| `OrderDetailActions` | **C** | Record payment / Edit / Delete — visibility from props |
| `OrderLineItemsSection` | **S** | Heading + table of line items (no pagination) |
| `OrderPaymentsSection` | **S** | Heading + table of payments |
| `RecordPaymentDialog` | **C** | |
| `EditOrderSheet` | **C** | |
| `DeleteOrderDialog` | **C** | |

### Action visibility (from detail payload)

| Action | Show when |
|--------|-----------|
| Record payment | `amountDue > 0` |
| Edit | always (sheet itself disables line items when `amountPaid > 0`) |
| Delete | `amountPaid === 0` (no payments). If 409, toast backend `msg`. |

Line items table columns: description, quantity, unit price, line total. Footer row: subtotal / order total (same number).

Payments table columns: date, amount, note, recorded at (`createdAt`). Oldest first (API already sorts).

---

## 15. Dialogs / sheets

All **C**. Reuse shadcn `Dialog` / `Sheet`. Reset by remounting with a `key` when opened — do not `useEffect` to reset forms.

### `CreateOrderSheet`

- Fields: customer, due date, `LineItemsEditor`.
- Live preview of line totals and order total **in the form only** (quantity × unit price in dollars, display rounded to 2 decimals). Server remains source of truth after save.
- Submit → `createOrder` → close → toast → invalidate list + summary.
- Zod: customer 1–200, ≥ 1 line, quantity ≥ 1, unit price ≥ 0.01, max 50 lines.

### `EditOrderSheet`

- Prefill from detail query.
- Customer + due date always enabled.
- `LineItemsEditor` **disabled / hidden** when `amountPaid > 0`, with helper text: line items are locked after the first payment.
- PUT partial body: only dirty fields.

### `RecordPaymentDialog`

- Amount (step 0.01), date (default today UTC), optional note.
- Helper text: “Maximum allowed: {amountDue}” from the current order.
- On 400: show `msg`; if `maxAllowedAmount` present, show it in the amount field error.
- Mint `Idempotency-Key` once when the user clicks submit; reuse if they retry the same values.

### `DeleteOrderDialog`

- Reuse `ConfirmDialog`.
- Copy: this cannot be undone; only unpaid orders.
- Success → toast → `/dashboard`.

### `ConfirmDialog` — shared **C**

Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `onConfirm`, `isPending`, `variant: "destructive" | "default"`. Used by delete (and nothing else unless needed).

### `LineItemsEditor` / `LineItemsEditorRow` — **C**

- Add line button
- Per row: description, quantity, unit price, computed line total (display), remove button (hidden if only one row)
- This is the reusable “button + inputs” unit — do not inline rows in the sheet

---

## 16. Shared presentational pieces

| Component | Kind | Props | Used by |
|-----------|------|-------|---------|
| `PageHeader` | **S** | title, description?, actions?: ReactNode | dashboard, detail, auth pages |
| `StatusBadge` | **S** | `status: OrderStatus` | table, detail, summary |
| `MoneyText` | **S** | `amount: number` | table, detail, forms preview |
| `DateText` | **S** | `iso: string` | table, detail, payments |
| `EmptyState` | **S** | title, description?, children? | empty table, 404 |
| `LogoutButton` | **C** | none (or `onLoggedOut?`) | `NavUser` |
| `CreateOrderButton` | **C** | `onClick` | dashboard header |
| `ViewOrderButton` | **C** | `orderId` | columns |
| `BackToOrdersButton` | **C** | none | detail page |
| `SidebarTriggerButton` | **C** | none | dashboard header |

Buttons are **minimal client components**. Do not embed a full sheet inside `CreateOrderButton`; the parent island owns sheet `open` state.

---

## 17. shadcn primitives to add

Already present: `button`, `input`, `separator`, `sheet`, `sidebar`, `tooltip`, `skeleton`, `avatar`, `breadcrumb`, `collapsible`, `dropdown-menu`.

Add later via CLI (not in this task):

`table`, `pagination`, `select`, `checkbox`, `dialog`, `form`, `sonner`, `card`, `badge`, `label`, `textarea`, `calendar`, `popover`, `alert`.

DataTable uses **table + pagination + select + checkbox** from this list, not AlignUI.

---

## 18. Existing files — keep, strip, or ignore

| File | Action later |
|------|----------------|
| `app/layout.tsx` | Keep; add `Providers` |
| `app/page.tsx` | Replace default marketing with redirect |
| `app/dashboard/page.tsx` | Replace sample cards with **S** page + `OrdersDashboard` |
| `components/app-sidebar.tsx` | Reuse; remove `TeamSwitcher` / `NavProjects` |
| `components/nav-main.tsx` | Reuse; flatten |
| `components/nav-user.tsx` | Reuse; logout only |
| `components/team-switcher.tsx` | Do not mount |
| `components/nav-projects.tsx` | Do not mount |
| `components/ui/*` | Keep; add more shadcn as listed |
| `hooks/use-mobile.ts` | Keep (sidebar) |
| `lib/utils.ts` | Keep `cn` |

---

## 19. Sample scenario → UI checks

| Step | UI |
|------|-----|
| Create order 2 × $500, due in 7 days | Create sheet → row status `pending`, total `$1,000`, due `$1,000` |
| Pay $400 | Detail → Record payment → status `partially_paid`, due `$600`; summary counts move |
| Pay $600 | Status `paid`, due `$0`; Record payment button **hidden** |
| Pay $1 more | Dialog still open or reopened → toast/field error with max allowed `0.00` |
| Two clicks on Pay | Same `Idempotency-Key` → 200 replay, no double charge |

---

## 20. Implementation order (later)

Do not start this until you say to implement. Suggested sequence:

1. HTTP client + unwrap `{ success, data }` + `ApiError`
2. Types, constants, user store, query client, providers
3. Auth REST + queries + login/signup pages + proxy gate + logout
4. shadcn table/pagination/dialog/sheet/form/sonner/card/badge
5. DataTable port (AlignUI behavior, shadcn chrome)
6. Orders REST + query factory
7. Dashboard island (summary, filters, table)
8. Detail island + payment/edit/delete dialogs
9. Slim sidebar to Orders + user email

---

*This file is the assignment-specific plan. Layering, React Query cache rules, and DataTable props stay in `FRONTEND_PROJECT_BLUEPRINT.md`.*
