import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination, { usePagination } from "../../../components/TablePagination";
import styles from "./AdsTable.module.css";
import { LoanRequest } from "../loanRequest/components/loanTable";

interface LoanRequestTableProps {
  data: LoanRequest[];
  onStatusChange?: (status: string) => void;
}

export default function AllLoanTable({
  data,
  onStatusChange,
}: LoanRequestTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Loan status codes: 2 = Approved (Active), 4 = Rejected
  const [statusFilter, setStatusFilter] = useState("2");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  const handleRowClick = (row: LoanRequest) => {
    // Prevent navigation when clicking on checkbox or ellipsis button
    // const target = event.target as HTMLInputElement;
    // if (target.type === "checkbox" || target.closest("button")) {
    //   return;
    // }
    // const selectedRow = filteredData.find((row) => Number(row.id) === loanId);
    navigate(`/dashboard/loans/${row.id}`, { state: { row } });
  };

  // Filter data based on search query and date filter.
  // The status filter is applied server-side via onStatusChange.
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      const searchMatch =
        searchQuery === "" ||
        loan.userFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filter
      const dateMatch = dateFilter === "" || loan.createdAt === dateFilter;

      return searchMatch && dateMatch;
    });
  }, [searchQuery, dateFilter, data]);
  const { pageItems, paginationProps } = usePagination(filteredData);

  // Notify parent when statusFilter changes
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(statusFilter);
    }
  }, [statusFilter, onStatusChange]);

  const exportToCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Amount Requested",
      "Date Created",
      "Status",
    ];

    const csvData = filteredData.map((loan) => [
      loan.userFirstName,
      loan.userLastName,
      loan.userEmail,
      `₦${loan.amount.toLocaleString()}`,
      loan.createdAt,
      loan.statusDisplay,
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
      `loan_requests_${new Date().toISOString().split("T")[0]}.csv`
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
            <option value="2">Active</option>
            <option value="4">Rejected</option>
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

          {(searchQuery || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDateFilter("");
              }}
              className={styles.clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="table-scroll">
        <table className={styles.customTable}>
          <thead>
            <tr>
              <th>Date Created</th>
              <th>First Name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Loan Purpose</th>
              <th>Loan Amount</th>
              <th>Loan Duration</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr
                key={`${row.id}-${row.userFirstName}-${row.userLastName}`}
                onClick={() => handleRowClick(row)}
                className={styles.clickableRow}
              >
                <td>
                  <div className={styles.adDetails}>
                    {/* <img src={row.image} alt={row.title} /> */}
                    <div>
                      {/* <strong>{row.dateCreated}</strong> */}
                      <p>{row.createdAt}</p>
                    </div>
                  </div>
                </td>
                <td>{row.userFirstName}</td>
                <td>{row.userLastName}</td>
                <td>{row.userEmail}</td>
                <td>{row.purpose}</td>
                <td>₦{row.amount.toLocaleString()}</td>
                <td>{row.durationInMonths} Months</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[row.statusDisplay.toLowerCase()]
                    }`}
                  >
                    {row.statusDisplay}
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
                <td colSpan={9} className={styles.noResults}>
                  No loans found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination {...paginationProps} />
    </div>
  );
}
