import React, { useEffect, useMemo, useState } from "react";
import "./TablePagination.css";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface TablePaginationProps {
  page: number;
  pageSize: number;
  // Total number of records. Leave undefined when the API doesn't report it;
  // `hasNextPage` then decides whether "Next" is enabled.
  total?: number;
  hasNextPage?: boolean;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  total,
  hasNextPage,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages =
    total === undefined ? undefined : Math.max(Math.ceil(total / pageSize), 1);
  const canGoNext =
    totalPages === undefined ? !!hasNextPage : page < totalPages;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last =
    total === undefined ? page * pageSize : Math.min(page * pageSize, total);

  return (
    <div className="table-pagination">
      <div className="pagination-summary">
        {total === undefined
          ? `Showing ${first} to ${last}`
          : `Showing ${first} to ${last} of ${total} records`}
      </div>
      <div className="pagination-controls">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1 || disabled}
        >
          Previous
        </button>
        <span className="pagination-current">
          {totalPages === undefined
            ? `Page ${page}`
            : `Page ${page} of ${totalPages}`}
        </span>
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || disabled}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Client-side paging over an already-filtered list. Goes back to page 1 when
// the list or page size changes (e.g. after a search).
export const usePagination = <T,>(items: T[], initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    pageItems,
    paginationProps: {
      page,
      pageSize,
      total: items.length,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    },
  };
};

export default TablePagination;
