export interface PageResult<T> {
  items: T[];
  // From the API when it reports it; otherwise a short page means "last page"
  hasNextPage?: boolean;
}

// Reads paging metadata from a `{ data: { <list>, hasNextPage?, page?, totalPages? } }` response
export const toPageResult = <T>(response: any, listKey: string): PageResult<T> => {
  const data = response?.data;
  const items: T[] = Array.isArray(data?.[listKey])
    ? data[listKey]
    : Array.isArray(data)
    ? data
    : [];
  const hasNextPage =
    typeof data?.hasNextPage === "boolean"
      ? data.hasNextPage
      : typeof data?.totalPages === "number" && typeof data?.page === "number"
      ? data.page < data.totalPages
      : undefined;
  return { items, hasNextPage };
};

/**
 * Loads every page of a paged endpoint so tables can search, filter and
 * paginate across all records. Stops when the API says there's no next page,
 * when a page comes back short, or when a page adds nothing new (an API that
 * ignores the paging parameters).
 */
export const fetchAllPages = async <T extends { id?: unknown }>(
  fetchPage: (page: number, pageSize: number) => Promise<PageResult<T>>,
  pageSize = 100,
  maxPages = 50
): Promise<T[]> => {
  const all: T[] = [];
  const seen = new Set<unknown>();

  for (let page = 1; page <= maxPages; page++) {
    const { items, hasNextPage } = await fetchPage(page, pageSize);
    const fresh = items.filter((item) => {
      const key = item?.id ?? JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    all.push(...fresh);

    const isLastPage =
      hasNextPage === undefined ? items.length < pageSize : !hasNextPage;
    if (isLastPage || fresh.length === 0) break;
  }
  return all;
};
