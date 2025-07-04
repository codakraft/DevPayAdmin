import React, { useState, useMemo } from "react";
import styles from "./AdsTable.module.css";

const dummyData = [
  {
    id: 1,
    BVN: "32345678901",
    firstName: "Fayemi",
    lastName: "Kayode",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-06-03",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 5000,
    amountRequested: 10000,
    email: "fayemi.kayode@example.com",
    status: "Active",
  },
  {
    id: 2,
    BVN: "22245678901",
    firstName: "John",
    lastName: "Alimi",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-06-15",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 7500,
    amountRequested: 15000,
    email: "john.alimi@example.com",
    status: "Pending",
  },
  {
    id: 3,
    BVN: "22345678901",
    firstName: "Elijah",
    lastName: "Akinpelu",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-06-20",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 3000,
    amountRequested: 8000,
    email: "elijah.akinpelu@example.com",
    status: "Rejected",
  },
  {
    id: 4,
    BVN: "22145678901",
    firstName: "Emeka",
    lastName: "Emmanuel",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-06-25",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 6000,
    amountRequested: 12000,
    email: "emeka.emmanuel@example.com",
    status: "Active",
  },
  {
    id: 5,
    BVN: "21345678901",
    firstName: "Aliyu",
    lastName: "Abubakar",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-07-01",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 4500,
    amountRequested: 9000,
    email: "aliyu.abubakar@example.com",
    status: "Active",
  },
  {
    id: 6,
    BVN: "32345678902",
    firstName: "Sarah",
    lastName: "Johnson",
    title: "Pepsi Cola",
    subtitle: "Winter Campaign",
    dateCreated: "2025-07-05",
    daysLeft: 8,
    phone: "+234 567 8901",
    loanAmount: 8000,
    amountRequested: 16000,
    email: "sarah.johnson@example.com",
    status: "Pending",
  },
];

export default function AdsTable() {
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Filter data based on search query, status filter, and date filter
  const filteredData = useMemo(() => {
    return dummyData.filter((ad) => {
      // Search filter - searches in name, email, BVN, phone, and title
      const searchMatch =
        searchQuery === "" ||
        ad.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.BVN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === "All" || ad.status === statusFilter;

      // Date filter
      const dateMatch = dateFilter === "" || ad.dateCreated === dateFilter;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, dateFilter]);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((row) => row.id));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Date Created",
      "First Name",
      "Last Name",
      "Email",
      "BVN",
      "Phone",
      "Title",
      "Subtitle",
      "Loan Amount",
      "Amount Requested",
      "Status",
    ];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredData.map((row) =>
        [
          row.dateCreated,
          `"${row.firstName}"`,
          `"${row.lastName}"`,
          row.email,
          row.BVN,
          row.phone,
          `"${row.title}"`,
          `"${row.subtitle}"`,
          row.loanAmount,
          row.amountRequested,
          row.status,
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
      `ads-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className={styles.tableControls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, email, BVN, phone, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersContainer}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.dateFilter}
          />

          <button
            onClick={exportToCSV}
            className={styles.exportBtn}
            title="Export to CSV"
          >
            Export CSV
          </button>

          {(searchQuery || statusFilter !== "All" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDateFilter("");
              }}
              className={styles.clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <table className={styles.customTable}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
              />
            </th>
            <th>Date Created</th>
            <th>First Name</th>
            <th>Last name</th>
            <th>BVN</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Loan Amount</th>
            <th>Amount requested</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={11} className={styles.noResults}>
                No ads found matching your filters.
              </td>
            </tr>
          ) : (
            filteredData.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleOne(row.id)}
                  />
                </td>
                <td>
                  <div className={styles.adDetails}>
                    <div>
                      <p>{row.dateCreated}</p>
                    </div>
                  </div>
                </td>
                <td>{row.firstName}</td>
                <td>{row.lastName}</td>
                <td>{row.BVN}</td>
                <td>{row.email}</td>
                <td>{row.phone}</td>
                <td>₦{row.loanAmount.toLocaleString()}</td>
                <td>₦{row.amountRequested.toLocaleString()}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[row.status.toLowerCase()]
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.ellipsisBtn}
                    aria-label="More options"
                  >
                    ...
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
