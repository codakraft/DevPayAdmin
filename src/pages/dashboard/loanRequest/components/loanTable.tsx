import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../helpers";
import TablePagination, { usePagination } from "../../../../components/TablePagination";
import styles from "./loanTable.module.css";

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
    status: "Pending",
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
    status: "Approved",
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
    status: "Pending",
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
    status: "Approved",
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
    status: "Pending",
  },
];

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

// Badge colour per loan status (0 Pending, 1 Processing, 2 Approved, 3 Disbursed, 4 Rejected)
const statusBadgeClass = (status: number) => {
  switch (status) {
    case 0:
      return "statusPending";
    case 1:
      return "statusProcessing";
    case 2:
      return "statusApproved";
    case 3:
      return "statusDisbursed";
    case 4:
      return "statusRejected";
    default:
      return "statusOther";
  }
};

interface LoanRequestTableProps {
  data: LoanRequest[];
}

export default function LoanRequestTable({ data }: LoanRequestTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  // Filter data based on search query, status filter, and date filter
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      // Search by name (first, last or full) or email
      const query = searchQuery.trim().toLowerCase();
      const fullName = `${loan.userFirstName ?? ""} ${loan.userLastName ?? ""}`;
      const searchMatch =
        query === "" ||
        fullName.toLowerCase().includes(query) ||
        (loan.userEmail ?? "").toLowerCase().includes(query);

      // Status filter
      const statusMatch =
        statusFilter === "All" || loan.statusDisplay === statusFilter;

      // Date filter
      const dateMatch = dateFilter === "" || loan.createdAt === dateFilter;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, dateFilter, data]);
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
      "Status",
    ];

    const csvData = filteredData.map((loan) => [
      loan.userFirstName,
      loan.userLastName,
      loan.userEmail,
      `₦${Number(loan.amount).toLocaleString()}`,
      formatDate(loan.createdAt),
      loan.statusDisplay,
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
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
                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[statusBadgeClass(row.status)]
                    }`}
                  >
                    {row.statusDisplay}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.noResults}>
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
