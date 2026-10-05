import React, { useState, useEffect } from "react";
import styles from "../components/AdsTable.module.css";
import { useLazyGetAuditTrailQuery } from "../../../store/apiSlice";
import TablePagination from "../../../components/TablePagination";

export default function AuditTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [auditData, setAuditData] = useState<any[]>([]);
  // Undefined when the API doesn't report a total
  const [totalRecords, setTotalRecords] = useState<number | undefined>();
  
  const [getAuditTrail, { isLoading, isFetching }] = useLazyGetAuditTrailQuery();

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await getAuditTrail({ 
          page: currentPage, 
          pageSize: pageSize 
        }).unwrap();
        
        // Try different response structures
        // A plain array doesn't say how many records exist in total, so the
        // total stays undefined and "Next" relies on whether this page was full
        let items = [];
        let total: number | undefined;
        
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (Array.isArray(response.data.logs)) {
            items = response.data.logs;
            total = response.data.totalCount;
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
      } catch (error) {
        
      }
    };

    fetchAuditTrail();
  }, [currentPage, pageSize, getAuditTrail]);

  // Filtered data based on search and action filter
  const filteredData = auditData.filter((row) => {
    const searchMatch =
      searchQuery === "" ||
      (row.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.details?.toLowerCase().includes(searchQuery.toLowerCase()));

    let actionMatch = true;
    if (actionFilter !== "all") {
      actionMatch = row.action?.toLowerCase().includes(actionFilter.toLowerCase()) ||
                    row.category?.toLowerCase().includes(actionFilter.toLowerCase());
    }
    
    return searchMatch && actionMatch;
  });

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Date", "User", "Action", "Category", "Details", "Status"];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredData.map((row: any) =>
        [
          `"${new Date(row.timestamp).toLocaleString()}"`,
          `"${row.userEmail || 'N/A'}"`,
          `"${row.action || 'N/A'}"`,
          `"${row.category || 'N/A'}"`,
          `"${row.details || 'N/A'}"`,
          `"${row.isSuccess ? 'Success' : 'Failed'}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
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
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={styles.filterSelect}
            style={{ marginRight: 12 }}
          >
            <option value="all">All Actions</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="security">Security</option>
            <option value="loan">Loan Actions</option>
            <option value="user">User Actions</option>
            <option value="admin">Admin Actions</option>
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
                          <p>{new Date(row.timestamp).toLocaleString('en-US', {
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
                    <td>{row.userEmail || 'N/A'}</td>
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
                        background: row.category === 'Security' ? '#dbeafe' : '#e0e7ff',
                        color: row.category === 'Security' ? '#1e40af' : '#4338ca',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {row.category || 'General'}
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
              hasNextPage={auditData.length === pageSize}
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
