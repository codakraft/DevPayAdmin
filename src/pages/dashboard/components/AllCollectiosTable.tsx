import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination, { usePagination } from "../../../components/TablePagination";
import styles from "./AdsTable.module.css";
import { LoanRequest } from "../loanRequest/components/loanTable";

const dummyData = [
  {
    id: 1,
    name: "Fayemi Kayode",
    accountNo: "ACC001234567",
    loanAmount: 500000,
    dateCreated: "2025-06-03",
    tenureMonths: 12,
    pendingPrincipal: 125000,
    pendingInterest: 8750,
    totalPending: 133750,
  },
  {
    id: 2,
    name: "John Alimi",
    accountNo: "ACC002234567",
    loanAmount: 750000,
    dateCreated: "2025-06-15",
    tenureMonths: 18,
    pendingPrincipal: 187500,
    pendingInterest: 14500,
    totalPending: 202000,
  },
  {
    id: 3,
    name: "Elijah Akinpelu",
    accountNo: "ACC003234567",
    loanAmount: 300000,
    dateCreated: "2025-06-20",
    tenureMonths: 6,
    pendingPrincipal: 50000,
    pendingInterest: 3200,
    totalPending: 53200,
  },
  {
    id: 4,
    name: "Emeka Emmanuel",
    accountNo: "ACC004234567",
    loanAmount: 600000,
    dateCreated: "2025-06-25",
    tenureMonths: 24,
    pendingPrincipal: 100000,
    pendingInterest: 7500,
    totalPending: 107500,
  },
  {
    id: 5,
    name: "Aliyu Abubakar",
    accountNo: "ACC005234567",
    loanAmount: 450000,
    dateCreated: "2025-06-27",
    tenureMonths: 12,
    pendingPrincipal: 75000,
    pendingInterest: 5250,
    totalPending: 80250,
  },
  {
    id: 6,
    name: "Sarah Johnson",
    accountNo: "ACC006234567",
    loanAmount: 800000,
    dateCreated: "2025-06-01",
    tenureMonths: 36,
    pendingPrincipal: 200000,
    pendingInterest: 16000,
    totalPending: 216000,
  },
];

interface LoanRequestTableProps {
  data: LoanRequest[];
}

export default function AllCollectionsTable({ data }: LoanRequestTableProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter data based on search query and date filter
  const filteredData = useMemo(() => {
    return data.filter((loan) => {
      console.log("loan", loan);
      // Search filter - searches in name and account number
      const searchMatch =
        searchQuery === "" ||
        loan.userFullName.toLowerCase().includes(searchQuery.toLowerCase());
      // loan.accountNo.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filter
      const dateMatch = dateFilter === "" || loan.createdAt === dateFilter;

      return searchMatch && dateMatch;
    });
  }, [searchQuery, dateFilter, data]);
  const { pageItems, paginationProps } = usePagination(filteredData);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((row) => Number(row.id)));
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Date Created",
      "Name",
      // "Account No.",
      "Loan Amount",
      "Tenure (Months)",
      "Pending Principal",
      "Pending Interest",
      "Total Pending",
    ];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredData.map((row) =>
        [
          row.createdAt,
          `"${row.userFullName}"`, // Wrap in quotes to handle names with commas
          // row.accountNo,
          row.amount,
          row.durationInMonths,
          row.amount,
          (row.amount * 0.045 || 0).toLocaleString(),
          row.amount,
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
      `collections-${new Date().toISOString().split("T")[0]}.csv`
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
            placeholder="Search by name or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersContainer}>
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
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th>
              <th>Date Created</th>
              <th>Name</th>
              {/* <th>Account No.</th> */}
              <th>Loan Amount</th>
              <th>Tenure(Months)</th>
              <th>Pending Principal</th>
              <th>Pending Interest</th>
              <th>Total Pending</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr
                key={`${row.id}-${row.userFullName}`}
                onClick={(e) => handleRowClick(Number(row.id), e)}
                className={styles.clickableRow}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(Number(row.id))}
                    onChange={() => toggleOne(Number(row.id))}
                  />
                </td>
                <td>
                  <div className={styles.adDetails}>
                    <div>
                      <p>{row.createdAt}</p>
                    </div>
                  </div>
                </td>
                <td>{row.userFullName}</td>
                {/* <td>{row.accountNo}</td> */}
                <td>₦{row.amount.toLocaleString()}</td>
                <td>{row.durationInMonths} months</td>
                <td>₦{row.amount.toLocaleString()}</td>
                <td>₦{(row.amount * 0.045 || 0).toLocaleString()}</td>
                <td>₦{(row.amount * 0.045 + row.amount).toLocaleString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
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
                  No collections found matching your search criteria.
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
