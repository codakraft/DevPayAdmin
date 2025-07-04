import React, { useState } from "react";
import styles from "../components/AdsTable.module.css";

const dummyData = [
  {
    id: 1,
    date: "20-Jun-2025 9:16 AM",
    user: "damola@gmail.com",
    action: "Loan Application requested",
  },
  {
    id: 2,
    date: "18-Jun-2025 9:16 AM",
    user: "damola@gmail.com",
    action: "Login",
  },
  {
    id: 3,
    date: "15-Jun-2025 9:16 AM",
    user: "damola@gmail.com",
    action: "Salary eligibility check",
  },
  {
    id: 4,
    date: "13-Jun-2025 9:16 AM",
    user: "damola@gmail.com",
    action: "Loan Application",
  },
];

export default function AuditTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Date", "User", "Action"];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...dummyData.map((row) =>
        [`"${row.date}"`, `"${row.user}"`, `"${row.action}"`].join(",")
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
            {/* <th>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
              />
            </th> */}
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row) => (
            <tr key={row.id}>
              {/* <td>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => toggleOne(row.id)}
                />
              </td> */}
              <td>
                <div className={styles.adDetails}>
                  {/* <img src={row.image} alt={row.title} /> */}
                  <div>
                    {/* <strong>{row.dateCreated}</strong> */}
                    <p>{row.date}</p>
                  </div>
                </div>
              </td>
              <td>{row.user}</td>
              <td>{row.action}</td>
              {/* <td>{row.}</td>
              <td>{row.email}</td>
              <td>{row.phone}</td>
              <td>{row.loanAmount}</td>
              <td>{row.amountRequested}</td>
              <td>
                <span className={styles.badge}>{row.status}</span>
              </td> */}
              <td>
                <button
                  className={styles.ellipsisBtn}
                  aria-label="More options"
                >
                  ...
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
