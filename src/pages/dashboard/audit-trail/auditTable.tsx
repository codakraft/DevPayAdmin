import React, { useState, useEffect, useMemo } from "react";
import styles from "../components/AdsTable.module.css";
import {
  useGetAuditCategoriesQuery,
  useLazyGetAuditTrailQuery,
} from "../../../store/apiSlice";
import TablePagination from "../../../components/TablePagination";
import { parseApiDate } from "../../../helpers";

// Badge colours by category value
const CATEGORY_COLORS: Record<string, { background: string; color: string }> = {
  Authentication: { background: "#dcfce7", color: "#166534" },
  Security: { background: "#fee2e2", color: "#991b1b" },
  User: { background: "#dbeafe", color: "#1e40af" },
  Loan: { background: "#fef3c7", color: "#92400e" },
  Financial: { background: "#ede9fe", color: "#5b21b6" },
};
const DEFAULT_CATEGORY_COLOR = { background: "#f3f4f6", color: "#374151" };

export default function AuditTable() {
  const [searchQuery, setSearchQuery] = useState("");
  // Exact category, filtered on the server so it applies across all pages
  const [categoryFilter, setCategoryFilter] = useState("");
  // Fallback when Audit/categories isn't available: categories seen so far
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [auditData, setAuditData] = useState<any[]>([]);
  // Undefined when the API doesn't report a total
  const [totalRecords, setTotalRecords] = useState<number | undefined>();
  
  const [getAuditTrail, { isLoading, isFetching }] = useLazyGetAuditTrailQuery();

  const { data: categoriesResponse } = useGetAuditCategoriesQuery();
  const categoryOptions = useMemo(() => {
    const fromApi = categoriesResponse?.data;
    if (Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
    return knownCategories.map((value) => ({ value, label: value }));
  }, [categoriesResponse, knownCategories]);
  const categoryLabels = useMemo(
    () => new Map(categoryOptions.map((c) => [c.value, c.label])),
    [categoryOptions]
  );

  // The person who acted: name, then email (failed logins only have the typed email)
  const getUserLabel = (row: any): string =>
    row.userName ||
    row.userEmail ||
    (row.userId ? "Unknown user" : "System");

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await getAuditTrail({
          page: currentPage,
          pageSize: pageSize,
          category: categoryFilter || undefined,
        }).unwrap();
        
        // Try different response structures
        // A plain array doesn't say how many records exist in total, so the
        // total stays undefined and "Next" relies on whether this page was full
        let items: any[] = [];
        let total: number | undefined;
        let nextPage: boolean | undefined;
        
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (Array.isArray(response.data.logs)) {
            items = response.data.logs;
            total = response.data.totalCount;
            nextPage = response.data.hasNextPage;
          } else if (response.data.items) {
            items = response.data.items;
            total = response.data.totalCount ?? response.data.totalRecords;
          }
        } else if (response?.items) {
          items = response.items;
          total = response.totalCount ?? response.totalRecords;
        }
        
        
        setAuditData(items);
        setTotalRecords(total);
        setHasNextPage(nextPage);
        setKnownCategories((prev) => {
          const all = new Set(prev);
          items.forEach((row: any) => row.category && all.add(row.category));
          return all.size === prev.length ? prev : Array.from(all).sort();
        });
      } catch (error) {
        
      }
    };

    fetchAuditTrail();
  }, [currentPage, pageSize, categoryFilter, getAuditTrail]);

  // Filtered data based on search and action filter
  const filteredData = auditData.filter((row) => {
    const searchMatch =
      searchQuery === "" ||
      (getUserLabel(row).toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.details?.toLowerCase().includes(searchQuery.toLowerCase()));

    return searchMatch;
  });

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Date", "User", "Action", "Category", "Details", "Status"];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredData.map((row: any) =>
        [
          `"${parseApiDate(row.timestamp).toLocaleString()}"`,
          `"${getUserLabel(row)}"`,
          `"${row.action || 'N/A'}"`,
          `"${categoryLabels.get(row.category) || row.category || 'N/A'}"`,
          `"${row.details || 'N/A'}"`,
          `"${row.isSuccess ? 'Success' : 'Failed'}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    // BOM so Excel reads the file as UTF-8
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit-trail-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className={styles.tableControls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersContainer}>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by category"
            className={styles.filterSelect}
            style={{ marginRight: 12 }}
          >
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={exportToCSV}
            className={styles.exportBtn}
            title="Export to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{
            width: 40,
            height: 40,
            border: '4px solid #eee',
            borderTop: '4px solid #3A7145',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <style>
            {`@keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }`}
          </style>
        </div>
      ) : (
        <>
          <div className="table-scroll">
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Category</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row: any, index: number) => (
                  <tr key={row.id || index}>
                    <td>
                      <div className={styles.adDetails}>
                        <div>
                          <p>{parseApiDate(row.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getUserLabel(row)}
                      {row.userEmail && getUserLabel(row) !== row.userEmail && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {row.userEmail}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {row.action?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge}`} style={{
                        ...(CATEGORY_COLORS[row.category] ?? DEFAULT_CATEGORY_COLOR),
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {categoryLabels.get(row.category) || row.category || 'General'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.details || 'N/A'}
                    </td>
                    <td>
                      <span className={`${styles.badge}`} style={{
                        background: row.isSuccess ? '#d1fae5' : '#fee2e2',
                        color: row.isSuccess ? '#065f46' : '#991b1b',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {row.isSuccess ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No audit records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          <div style={{ padding: "0 20px" }}>
            <TablePagination
              page={currentPage}
              pageSize={pageSize}
              total={totalRecords}
              hasNextPage={hasNextPage ?? auditData.length === pageSize}
              disabled={isFetching}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
