import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyGetLoansQuery } from "../../../store/apiSlice";
import "./disbursements.css";

interface Loan {
  id: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  purpose: string;
  amount: number;
  durationInMonths: number;
  status: number;
  createdAt: string;
}

const Disburse: React.FC = () => {
  const navigate = useNavigate();
  const [getLoans, { isLoading, error }] = useLazyGetLoansQuery();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const fetchLoans = React.useCallback(async () => {
    try {
      const response = await getLoans({ status: 2 }).unwrap();
      console.log("Fetched approved loans:", response.data);
      if (response?.data?.loans) {
        setLoans(Array.isArray(response.data.loans) ? response.data.loans : []);
      } else if (response?.data) {
        setLoans(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch approved loans:", error);
      setLoans([]);
    }
  }, [getLoans]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const filteredLoans = Array.isArray(loans)
    ? loans.filter(
        (loan) =>
          loan.userFirstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          loan.userLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoans = filteredLoans.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleViewDetails = (loanId: string) => {
    const loanData = loans.find((loan) => loan.id === loanId);
    navigate(`/disbursements/details/${loanId}`, { state: { loan: loanData } });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2:
        return <span className="status-badge status-approved">Approved</span>;
      default:
        return <span className="status-badge status-unknown">Unknown</span>;
    }
  };

  return (
    <div className="disbursements-container">
      <div className="disbursements-header">
        <h1>Disburse Loans</h1>
        <p>Approved loans ready for disbursement</p>
      </div>

      <div className="disbursements-actions">
        <div className="search-box">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or purpose..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total Approved:</span>
            <span className="stat-value">{filteredLoans.length}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading approved loans...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error loading loans. Please try again.</p>
        </div>
      ) : paginatedLoans.length === 0 ? (
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 11L12 14L22 4M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>No Approved Loans</h3>
          <p>There are currently no approved loans ready for disbursement.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Loan Purpose</th>
                  <th>Loan Amount</th>
                  <th>Loan Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{formatDate(loan.createdAt)}</td>
                    <td>{loan.userFirstName || "N/A"}</td>
                    <td>{loan.userLastName || "N/A"}</td>
                    <td>{loan.userEmail || "N/A"}</td>
                    <td>{loan.purpose || "N/A"}</td>
                    <td className="amount-cell">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td>{loan.durationInMonths} months</td>
                    <td>{getStatusBadge(loan.status)}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewDetails(loan.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Disburse;
