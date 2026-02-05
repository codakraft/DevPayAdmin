import React, { useState, useEffect } from "react";
import styles from "../components/AdsTable.module.css";
import { useLazyGetAuditTrailQuery } from "../../../store/apiSlice";

export default function AuditTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [getAuditTrail, { isLoading, isFetching }] = useLazyGetAuditTrailQuery();

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await getAuditTrail({ 
          page: currentPage, 
          pageSize: pageSize 
        }).unwrap();
        
        // Try different response structures
        let items = [];
        let total = 0;
        
        if (Array.isArray(response)) {
          // Response is directly an array
          console.log("Response is array, length:", response.length);
          items = response;
          total = response.length;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            // response.data is an array
            console.log("response.data is array, length:", response.data.length);
            items = response.data;
            total = response.data.length;
          } else if (response.data.items) {
            // response.data.items is the array
            console.log("response.data.items exists, length:", response.data.items?.length);
            items = response.data.items;
            total = response.data.totalCount || response.data.totalRecords || items.length;
          } else {
            console.log("Unknown data structure in response.data");
          }
        } else if (response?.items) {
          // response.items is the array
          console.log("response.items exists, length:", response.items.length);
          items = response.items;
          total = response.totalCount || response.totalRecords || items.length;
        }
        
        console.log("Final items to set:", items);
        console.log("Final total to set:", total);
        console.log("First item:", items[0]);
        
        setAuditData(items);
        setTotalRecords(total);
      } catch (error) {
        console.error("Failed to fetch audit trail:", error);
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
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
            style={{ marginRight: 12 }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          
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

          {/* Pagination Controls */}
          <div className={styles.paginationContainer} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div>
              Showing {filteredData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <span style={{
                padding: '8px 16px',
                border: '1px solid #3A7145',
                borderRadius: '6px',
                background: '#3A7145',
                color: 'white',
                fontWeight: '600'
              }}>
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * pageSize >= totalRecords}
                className={styles.paginationBtn}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage * pageSize >= totalRecords ? '#f3f4f6' : 'white',
                  cursor: currentPage * pageSize >= totalRecords ? 'not-allowed' : 'pointer',
                  opacity: currentPage * pageSize >= totalRecords ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
