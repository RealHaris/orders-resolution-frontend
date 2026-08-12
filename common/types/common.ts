/**
 * Paginated list envelope returned by GET /orders.
 */
export class PaginatedData<T> {
  list: T[] = [];
  count: number = 0;
  totalPages: number = 1;
  pageNum: number = 1;

  constructor(data: Partial<PaginatedData<T>> = {}) {
    Object.assign(this, data);
  }
}
