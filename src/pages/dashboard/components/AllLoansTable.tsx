import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination, { usePagination } from "../../../components/TablePagination";
import styles from "./AdsTable.module.css";
import { LoanRequest } from "../loanRequest/components/loanTable";

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

interface LoanRequestTableProps {
  data: LoanRequest[];
  onStatusChange?: (status: string) => void;
}

export default function AllLoanTable({
  data,
  onStatusChange,
}: LoanRequestTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("2");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  console.log("dataloanActive", data);

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (row: LoanRequest) => {
    // Prevent navigation when clicking on checkbox or ellipsis button
    // const target = event.target as HTMLInputElement;
    // if (target.type === "checkbox" || target.closest("button")) {
    //   return;
    // }
    // const selectedRow = filteredData.find((row) => Number(row.id) === loanId);
    navigate(`/dashboard/loans/${row.id}`, { state: { row } });
  };

  // Filter data based on search query, status filter, and date filter
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      // ...existing code...
      const searchMatch =
        searchQuery === "" ||
        loan.userFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      // '2' means All Status, otherwise match the statusDisplay or status code
      let statusMatch = true;
      if (statusFilter !== "2") {
        // Try to match both statusDisplay and status code (as string or number)
        statusMatch =
          loan.statusDisplay === statusFilter ||
          String(loan.status) === statusFilter;
      }

      // Date filter
      const dateMatch = dateFilter === "" || loan.createdAt === dateFilter;

      return searchMatch && statusMatch && dateMatch;
    });
  }, [searchQuery, statusFilter, dateFilter, data]);
  const { pageItems, paginationProps } = usePagination(filteredData);

  // Notify parent when statusFilter changes
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(statusFilter);
    }
  }, [statusFilter, onStatusChange]);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((row) => Number(row.id)));
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

  console.log("Filtered Data:", filteredData);

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
            <option value="2">All Status</option>
            <option value="4">Active</option>
            <option value="0">Pending</option>
            <option value="3">Rejected</option>
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

          {(searchQuery || statusFilter !== "0" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("0");
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
                <td colSpan={11} className={styles.noResults}>
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
