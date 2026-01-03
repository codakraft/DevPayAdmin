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
  disbursedAt?: string;
}

const AllDisbursements: React.FC = () => {
  const navigate = useNavigate();
  const [getLoans, { isLoading, error }] = useLazyGetLoansQuery();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const fetchLoans = React.useCallback(async () => {
    try {
      const response = await getLoans({ status: 3 }).unwrap();
      console.log("Fetched disbursed loans:", response.data);
      if (response?.data?.loans) {
        setLoans(Array.isArray(response.data.loans) ? response.data.loans : []);
      } else if (response?.data) {
        setLoans(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch disbursed loans:", error);
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
      case 3:
        return <span className="status-badge status-disbursed">Disbursed</span>;
      default:
        return <span className="status-badge status-unknown">Unknown</span>;
    }
  };

  const calculateTotalDisbursed = () => {
    return filteredLoans.reduce((total, loan) => total + loan.amount, 0);
  };

  return (
    <div className="disbursements-container">
      <div className="disbursements-header">
        <h1>All Disbursements</h1>
        <p>Complete record of disbursed loans</p>
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
            <span className="stat-label">Total Disbursed:</span>
            <span className="stat-value">{filteredLoans.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Amount:</span>
            <span className="stat-value stat-amount">
              {formatCurrency(calculateTotalDisbursed())}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading disbursed loans...</p>
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
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>No Disbursed Loans</h3>
          <p>There are currently no disbursed loans in the system.</p>
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

export default AllDisbursements;
