import React, { useState } from "react";
import styles from "../components/AdsTable.module.css";

const dummyData = [
  {
    id: 1,
    date: "12-Jul-2025 10:05 AM",
    user: "admin@devpay.com",
    action: "Logged in",
    status: "Successful",
  },
  {
    id: 2,
    date: "12-Jul-2025 10:02 AM",
    user: "support@devpay.com",
    action: "Approved Loan Request #LP-12346 for John Alimi",
    status: "Completed",
  },
  {
    id: 3,
    date: "11-Jul-2025 04:30 PM",
    user: "admin@devpay.com",
    action: "Updated loan product 'Payday Loan' interest rate to 5%",
    status: "Modified",
  },
  {
    id: 4,
    date: "11-Jul-2025 02:15 PM",
    user: "admin@devpay.com",
    action: "Viewed user profile for Fayemi Kayode",
    status: "Viewed",
  },
  {
    id: 5,
    date: "11-Jul-2025 11:00 AM",
    user: "support@devpay.com",
    action: "Rejected Loan Request #LP-12345 for Elijah Akinpelu",
    status: "Completed",
  },
  {
    id: 6,
    date: "10-Jul-2025 09:00 AM",
    user: "admin@devpay.com",
    action: "Exported all loans data to CSV",
    status: "Completed",
  },
  {
    id: 7,
    date: "09-Jul-2025 05:00 PM",
    user: "admin@devpay.com",
    action: "Added new admin user 'new.admin@devpay.com'",
    status: "Completed",
  },
  {
    id: 8,
    date: "09-Jul-2025 03:12 PM",
    user: "support@devpay.com",
    action: "Searched for user with BVN '22245678901'",
    status: "Completed",
  },
  {
    id: 9,
    date: "08-Jul-2025 12:00 PM",
    user: "admin@devpay.com",
    action: "Logged out",
    status: "Successful",
  },
  {
    id: 10,
    date: "08-Jul-2025 09:05 AM",
    user: "admin@devpay.com",
    action: "Viewed dashboard analytics for 'This Month'",
    status: "Viewed",
  },
];

export default function AuditTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Filtered data based on search and action filter
  const filteredData = dummyData.filter((row) => {
    const searchMatch =
      searchQuery === "" ||
      row.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.status.toLowerCase().includes(searchQuery.toLowerCase());

    let actionMatch = true;
    if (actionFilter === "approvals") {
      actionMatch = row.action.toLowerCase().includes("approved loan request");
    } else if (actionFilter === "rejections") {
      actionMatch = row.action.toLowerCase().includes("rejected loan request");
    } else if (actionFilter === "logins") {
      actionMatch = row.action.toLowerCase().includes("logged in");
    } else if (actionFilter === "logouts") {
      actionMatch = row.action.toLowerCase().includes("logged out");
    } // add more filters as needed
    return searchMatch && actionMatch;
  });

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Date", "User", "Action", "Status"];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...dummyData.map((row) =>
        [
          `"${row.date}"`,
          `"${row.user}"`,
          `"${row.action}"`,
          `"${row.status}"`,
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
            <option value="approvals">Loan Approvals</option>
            <option value="rejections">Loan Rejections</option>
            <option value="logins">Logins</option>
            <option value="logouts">Logouts</option>
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

      <table className={styles.customTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Status</th>
            {/* <th></th> */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id}>
              <td>
                <div className={styles.adDetails}>
                  <div>
                    <p>{row.date}</p>
                  </div>
                </div>
              </td>
              <td>{row.user}</td>
              <td>{row.action}</td>
              <td>
                <span
                  className={`${styles.badge} ${styles[`status${row.status}`]}`}
                >
                  {row.status}
                </span>
              </td>
              <td>
                <button
                  className={styles.ellipsisBtn}
                  aria-label="More options"
                >
                  {/* ... */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
