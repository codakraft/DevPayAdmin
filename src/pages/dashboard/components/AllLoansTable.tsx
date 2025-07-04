import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
    loanAmount: 12000,
    amountRequested: 20000,
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
    dateCreated: "2025-06-27",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 8500,
    amountRequested: 12000,
    email: "aliyu.abubakar@example.com",
    status: "Active",
  },
  {
    id: 6,
    BVN: "32345678901",
    firstName: "Sarah",
    lastName: "Johnson",
    title: "Coca Cola",
    subtitle: "Summer Time Ad",
    dateCreated: "2025-06-01",
    daysLeft: 12,
    phone: "+234 123 4567",
    loanAmount: 6000,
    amountRequested: 11000,
    email: "sarah.johnson@example.com",
    status: "Active",
  },
];

export default function AllLoanTable() {
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (loanId: number, event: React.MouseEvent) => {
    // Prevent navigation when clicking on checkbox or ellipsis button
    const target = event.target as HTMLInputElement;
    if (target.type === "checkbox" || target.closest("button")) {
      return;
    }
    navigate(`/dashboard/loans/${loanId}`);
  };

  // Filter data based on search query, status filter, and date filter
  const filteredData = useMemo(() => {
    return dummyData.filter((loan) => {
      // Search filter - searches in name, email, BVN, and phone
      const searchMatch =
        searchQuery === "" ||
        loan.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.BVN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.phone.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch =
        statusFilter === "All" || loan.status === statusFilter;

      // Date filter
      const dateMatch = dateFilter === "" || loan.dateCreated === dateFilter;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, dateFilter]);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((row) => row.id));
  };

  const exportToCSV = () => {
    const headers = [
      "BVN",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Loan Amount",
      "Amount Requested",
      "Date Created",
      "Status",
    ];

    const csvData = filteredData.map((loan) => [
      loan.BVN,
      loan.firstName,
      loan.lastName,
      loan.phone,
      loan.email,
      `₦${loan.loanAmount.toLocaleString()}`,
      `₦${loan.amountRequested.toLocaleString()}`,
      loan.dateCreated,
      loan.status,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `loans_${new Date().toISOString().split("T")[0]}.csv`
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
            placeholder="Search by name, email, BVN, or phone..."
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

          <button onClick={exportToCSV} className={styles.exportBtn}>
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
          {filteredData.map((row) => (
            <tr
              key={`${row.id}-${row.firstName}-${row.lastName}`}
              onClick={(e) => handleRowClick(row.id, e)}
              className={styles.clickableRow}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => toggleOne(row.id)}
                />
              </td>
              <td>
                <div className={styles.adDetails}>
                  {/* <img src={row.image} alt={row.title} /> */}
                  <div>
                    {/* <strong>{row.dateCreated}</strong> */}
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
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={11} className={styles.noResults}>
                No loans found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
