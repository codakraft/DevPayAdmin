import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useLazyGetLoansByIDQuery,
  useDisburseLoanMutation,
} from "../../../store/apiSlice";
import "./disbursements.css";

interface LoanDetails {
  id: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  phoneNumber?: string;
  purpose: string;
  amount: number;
  durationInMonths: number;
  productInterestRate?: number;
  status: number;
  createdAt: string;
  disbursedAt?: string;
  employer?: string;
  monthlyIncome?: number;
  address?: string;
  productName?: string;
}

const DisbursementDetails: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [getLoanDetails, { data: loanData, isLoading, error }] =
    useLazyGetLoansByIDQuery();
  const [disburseLoan, { isLoading: isDisbursing }] = useDisburseLoanMutation();
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if loan data was passed via navigation state
    const passedLoan = location.state?.loan;
    if (passedLoan) {
      setLoan(passedLoan);
    } else if (loanId) {
      // Fallback to fetching from API if no state was passed
      getLoanDetails({ id: loanId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  useEffect(() => {
    if (loanData?.data && !location.state?.loan) {
      setLoan(loanData.data);
    }
  }, [loanData, location.state]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2:
        return <span className="status-badge status-approved">Approved</span>;
      case 3:
        return <span className="status-badge status-disbursed">Disbursed</span>;
      default:
        return <span className="status-badge status-unknown">Unknown</span>;
    }
  };

  const handleDisburse = async () => {
    if (!loan?.id) return;

    try {
      const response = await disburseLoan({ id: loan.id }).unwrap();
      console.log("Disbursement response:", response);

      if (response.success) {
        setShowSuccessModal(true);
        // Update loan status locally
        setLoan({ ...loan, status: 3 });

        // Navigate to all disbursements after a short delay
        setTimeout(() => {
          navigate("/disbursements/all");
        }, 2000);
      } else {
        setErrorMessage(response.message || "Failed to disburse loan");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Failed to disburse loan:", error);
      setErrorMessage(
        error.data?.message || "An error occurred while disbursing the loan"
      );
      setShowErrorModal(true);
    }
  };

  const calculateTotalRepayment = () => {
    if (!loan) return 0;
    const principal = loan.amount;
    const interestRate = loan.productInterestRate || 0;
    const interest = (principal * interestRate * loan.durationInMonths) / 100;
    return principal + interest;
  };

  const calculateMonthlyPayment = () => {
    if (!loan) return 0;
    return calculateTotalRepayment() / loan.durationInMonths;
  };

  if (isLoading) {
    return (
      <div className="disbursements-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="disbursements-container">
        <div className="error-container">
          <p>Error loading loan details. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="disbursements-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div>
          <h1>Loan Details</h1>
          <p>Loan ID: {loan.id}</p>
        </div>
      </div>

      <div className="details-content">
        <div className="details-grid">
          {/* Borrower Information */}
          <div className="details-card">
            <h2 className="card-title">Borrower Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">
                  {loan.userFirstName} {loan.userLastName}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{loan.userEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{loan.phoneNumber || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Employer</span>
                <span className="info-value">{loan.employer || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Monthly Income</span>
                <span className="info-value">
                  {loan.monthlyIncome
                    ? formatCurrency(loan.monthlyIncome)
                    : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{loan.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="details-card">
            <h2 className="card-title">Loan Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Loan Purpose</span>
                <span className="info-value">{loan.purpose}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loan Product</span>
                <span className="info-value">{loan.productName || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loan Amount</span>
                <span className="info-value highlight">
                  {formatCurrency(loan.amount)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Loan Duration</span>
                <span className="info-value">
                  {loan.durationInMonths} months
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Interest Rate</span>
                <span className="info-value">
                  {loan.productInterestRate || 0}%
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Repayment</span>
                <span className="info-value highlight">
                  {formatCurrency(calculateTotalRepayment())}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Monthly Payment</span>
                <span className="info-value">
                  {formatCurrency(calculateMonthlyPayment())}
                </span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="details-card">
            <h2 className="card-title">Status & Timeline</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Current Status</span>
                <span className="info-value">
                  {getStatusBadge(loan.status)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Application Date</span>
                <span className="info-value">{formatDate(loan.createdAt)}</span>
              </div>
              {loan.disbursedAt && (
                <div className="info-item">
                  <span className="info-label">Disbursement Date</span>
                  <span className="info-value">
                    {formatDate(loan.disbursedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {loan.status === 2 && (
          <div className="action-buttons">
            <button
              className="disburse-btn"
              onClick={handleDisburse}
              disabled={isDisbursing}
            >
              {isDisbursing ? (
                <>
                  <div className="btn-spinner"></div>
                  Disbursing...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
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
                  Disburse Loan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon success">
              <svg
                width="48"
                height="48"
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
            </div>
            <h2>Loan Disbursed Successfully!</h2>
            <p>The loan has been successfully disbursed to the borrower.</p>
            <button
              className="modal-btn"
              onClick={() => navigate("/disbursements/all")}
            >
              View All Disbursements
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon error">
              <svg
                width="48"
                height="48"
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
            </div>
            <h2>Disbursement Failed</h2>
            <p>{errorMessage}</p>
            <button
              className="modal-btn error"
              onClick={() => setShowErrorModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisbursementDetails;
