import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, parseApiDate } from "../../../../helpers";
import TablePagination, { usePagination } from "../../../../components/TablePagination";
import styles from "./loanTable.module.css";

export interface LoanRequest {
  amount: number;
  approvedAt: string | null;
  companyId: string;
  companyName: string;
  companyShortName: string;
  createdAt: string;
  dueDate: string | null;
  durationInMonths: number;
  id: string;
  isMandateGenerated: boolean;
  mandateId: string;
  message: string;
  productId: string;
  productInterestRate: number;
  productName: string;
  purpose: string;
  rejectedAt: string | null;
  status: number;
  statusDisplay: string;
  updatedAt: string;
  userEmail: string;
  userFirstName: string;
  userFullName: string;
  userId: string;
  userLastName: string;
}

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";

// "YYYY-MM-DD" in the viewer's time zone, comparable as a string
const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const daysAgoKey = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDayKey(date);
};

interface LoanRequestTableProps {
  data: LoanRequest[];
}

export default function LoanRequestTable({ data }: LoanRequestTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inclusive [from, to] day range; an open end is unbounded
  const dateRange = useMemo(() => {
    const today = toDayKey(new Date());
    switch (datePreset) {
      case "today":
        return { from: today, to: today };
      case "7d":
        return { from: daysAgoKey(6), to: today };
      case "30d":
        return { from: daysAgoKey(29), to: today };
      case "custom":
        return startDate || endDate
          ? { from: startDate || undefined, to: endDate || undefined }
          : null;
      default:
        return null;
    }
  }, [datePreset, startDate, endDate]);
  const hasDateFilter = dateRange !== null;
  const navigate = useNavigate();

  // Filter data based on search query and date filter
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      // Search by name (first, last or full) or email
      const query = searchQuery.trim().toLowerCase();
      const fullName = `${loan.userFirstName ?? ""} ${loan.userLastName ?? ""}`;
      const searchMatch =
        query === "" ||
        fullName.toLowerCase().includes(query) ||
        (loan.userEmail ?? "").toLowerCase().includes(query);

      // Date filter
      let dateMatch = true;
      if (dateRange) {
        const created = parseApiDate(loan.createdAt);
        const day = isNaN(created.getTime()) ? "" : toDayKey(created);
        dateMatch =
          day !== "" &&
          (!dateRange.from || day >= dateRange.from) &&
          (!dateRange.to || day <= dateRange.to);
      }

      return searchMatch && dateMatch;
    });
  }, [searchQuery, dateRange, data]);
  const { pageItems, paginationProps } = usePagination(filteredData);

  const handleViewLoan = (row: LoanRequest) => {
    navigate(`/loan-management/details/${row.id}`, { state: { row } });
  };

  const exportToCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Amount Requested",
      "Date Created",
    ];

    const csvData = filteredData.map((loan) => [
      loan.userFirstName,
      loan.userLastName,
      loan.userEmail,
      `₦${Number(loan.amount).toLocaleString()}`,
      formatDate(loan.createdAt),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) =>
        row.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    // The BOM tells Excel the file is UTF-8, otherwise "₦" shows as garbage
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
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
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersContainer}>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
            className={styles.filterSelect}
            aria-label="Date created"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range…</option>
          </select>

          {datePreset === "custom" && (
            <div className={styles.dateRange}>
              <label>
                <span>Start date</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateFilter}
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateFilter}
                />
              </label>
            </div>
          )}

          <button onClick={exportToCSV} className={styles.exportBtn}>
            Export CSV
          </button>

          {(searchQuery || hasDateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setDatePreset("all");
                setStartDate("");
                setEndDate("");
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
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row: LoanRequest) => (
              <tr
                key={`${row.id}-${row.userFirstName}-${row.userLastName}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleViewLoan(row)}
              >
                <td>
                  <div className={styles.adDetails}>
                    {/* <img src={row.image} alt={row.title} /> */}
                    <div>
                      {/* <strong>{row.dateCreated}</strong> */}
                      <p>
                        {new Date(row.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{row.userFirstName}</td>
                <td>{row.userLastName}</td>
                <td>{row.userEmail}</td>
                <td>{row.purpose}</td>
                <td>₦{row.amount.toLocaleString()}</td>
                <td>{row.durationInMonths} Months</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.noResults}>
                  No loan requests found matching your search criteria.
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
