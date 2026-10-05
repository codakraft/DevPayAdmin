import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

interface LoanRequestTableProps {
  data: LoanRequest[];
}

export default function LoanRequestTable({ data }: LoanRequestTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  // Filter data based on search query, status filter, and date filter
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      // Search filter - searches in name, email, BVN, and phone
      const searchMatch =
        searchQuery === "" ||
        loan.userFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch =
        statusFilter === "All" || loan.statusDisplay === statusFilter;

      // Date filter
      const dateMatch = dateFilter === "" || loan.createdAt === dateFilter;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, dateFilter, data]);
  const { pageItems, paginationProps } = usePagination(filteredData);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((row) => Number(row.id)));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleViewLoan = (row: LoanRequest) => {
    navigate(`/loan-management/details/${row.id}`, { state: { row } });
    setDropdownOpen(null);
  };

  const toggleDropdown = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
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
      `₦${loan.amount.toLocaleString()}`,
      loan.createdAt,
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
      `loan_requests_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

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
              <th>Email</th>
              <th>Loan Purpose</th>
              <th>Loan Amount</th>
              <th>Loan Duration</th>
              <th>Status</th>
              <th>Action</th>
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
                  <input
                    type="checkbox"
                    checked={selected.includes(Number(row.id))}
                    onChange={() => toggleOne(Number(row.id))}
                  />
                </td>
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
                      styles[row.statusDisplay.toLowerCase()]
                    }`}
                  >
                    {row.statusDisplay}
                  </span>
                </td>
                <td>
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <button
                      className={styles.ellipsisBtn}
                      aria-label="More options"
                      style={{ zIndex: 3, position: "relative" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(Number(row.id));
                      }}
                    >
                      ...
                    </button>
                    {dropdownOpen === Number(row.id) && (
                      <div
                        className={styles.dropdownMenu}
                        role="menu"
                        style={{
                          zIndex: 10,
                          position: "absolute",
                          pointerEvents: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={styles.dropdownItem}
                          onClick={() => handleViewLoan(row)}
                          role="menuitem"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={11} className={styles.noResults}>
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
