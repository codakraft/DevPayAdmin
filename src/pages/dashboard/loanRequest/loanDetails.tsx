import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "../../../ui/components/button/button";
import "./loanDetails.css";
import {
  useApproveLoanMutation,
  useRejectLoanMutation,
  useLazyGetLoansByIDQuery,
} from "../../../store/apiSlice";

// SuccessModal component
const SuccessModal: React.FC<{
  open: boolean;
  onClose: () => void;
  action: "approve" | "reject" | null;
}> = ({ open, onClose, action }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" aria-modal="true">
      <div className="loan-action-modal success-modal">
        <div className="modal-header">
          <h2>Success</h2>
        </div>
        <div className="modal-body">
          <p>
            {action === "approve"
              ? "Loan approved successfully!"
              : action === "reject"
              ? "Loan rejected successfully!"
              : "Action completed successfully!"}
          </p>
        </div>
        <div className="modal-footer">
          <Button variant="primary" size="md" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const row = location.state?.row;
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loanData, setLoanData] = useState<any>(row || null);

  const [approveLoan, { isLoading: approveLoading }] = useApproveLoanMutation();
  const [rejectLoan, { isLoading: rejectLoading }] = useRejectLoanMutation();
  const [getLoanById, { isLoading }] = useLazyGetLoansByIDQuery();

  useEffect(() => {
    const fetchLoanDetails = async () => {
      console.log("Fetching loan details for ID:", id);
      if (id) {
        try {
          const response = await getLoanById({ id }).unwrap();
          console.log("Loan details response:", response);

          if (response.success && response.data) {
            setLoanData(response.data);
          }
        } catch (error) {
          console.error("Error fetching loan details:", error);
        }
      } else {
        console.warn("No loan ID found in URL parameters");
      }
    };

    fetchLoanDetails();
  }, [id, getLoanById]);

  console.log("Loan ID from params:", id, "Loan Data:", loanData);

  const handleApprove = () => {
    setModalAction("approve");
    setApprovedAmount(loanData?.amount);
    setShowModal(true);
  };

  // Add missing handlers and restore modal content
  const handleReject = () => {
    setModalAction("reject");
    setShowModal(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowModal(false);
      setComment("");
      setApprovedAmount("");
      setModalAction(null);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(-1);
  };

  const getActionButtonText = () => {
    return modalAction === "approve" ? "Approve Loan" : "Reject Loan";
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      const response = await approveLoan({
        id: loanData.id,
        reason: comment,
      }).unwrap();
      if (response.success) {
        setShowModal(false);
        setComment("");
        setApprovedAmount("");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error processing loan action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAction = async () => {
    setIsProcessing(true);
    try {
      const response = await rejectLoan({
        id: loanData.id,
        reason: comment,
      }).unwrap();
      if (response.success) {
        setShowModal(false);
        setComment("");
        setApprovedAmount("");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error processing loan action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading loan details...</p>
      </div>
    );
  }

  // Show error or no data state
  if (!loanData) {
    return (
      <div className="error-container">
        <p>No loan data available</p>
        <Button variant="primary" size="md" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // Format status for display
  const getStatusDisplay = (status: number) => {
    const statusMap: Record<number, string> = {
      0: "Pending",
      1: "Processing",
      2: "Approved",
      3: "Disbursed",
      4: "Rejected",
    };
    return statusMap[status] || "Unknown";
  };

  const statusDisplay = getStatusDisplay(loanData.status);

  // Calculate monthly repayment using productInterestRate from loanData
  let monthlyRepayment = "";
  if (
    loanData?.amount &&
    loanData?.durationInMonths &&
    loanData?.productInterestRate
  ) {
    const principal = Number(loanData.amount);
    // productInterestRate may be a string like "4.5%" or a number
    let interestRate = 0;
    if (typeof loanData.productInterestRate === "string") {
      interestRate =
        parseFloat(loanData.productInterestRate.replace("%", "")) / 100;
    } else {
      interestRate = Number(loanData.productInterestRate) / 100;
    }
    const totalWithInterest = principal + principal * interestRate;
    monthlyRepayment = `₦${(
      totalWithInterest / loanData.durationInMonths
    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  // Get salary history data from response
  const salaryHistory = loanData?.salaryHistory;
  const averageMonthlySalary = salaryHistory?.averageMonthlySalary
    ? `₦${Number(salaryHistory.averageMonthlySalary).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`
    : "N/A";
  const employerName =
    salaryHistory?.companyName || loanData?.companyName || "N/A";

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <div>
            <h1>Loan Application Details</h1>
            <p className="subtitle">
              Complete loan information and decision tools
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="danger" size="md" onClick={handleReject}>
            Reject
          </Button>
          <Button variant="primary" size="md" onClick={handleApprove}>
            Approve
          </Button>
        </div>
      </div>

      <div className="loan-content">
        {/* Applicant Info Card */}
        <div className="info-card">
          <div className="card-header">
            <h2>Applicant Information</h2>
            <span className={`status-badge ${statusDisplay.toLowerCase()}`}>
              {statusDisplay}
            </span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Full Name</span>
              <span className="value">
                {loanData.userFirstName} {loanData.userLastName}
              </span>
            </div>
            {/* <div className="info-item">
              <span className="label">BVN</span>
              <span className="value">{loanData?.bvn}</span>
            </div> */}
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{loanData.userEmail}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">
                {loanData.userPhoneNumber || "08045647363"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Employment Status</span>
              <span className="value">
                {loanData.employmentStatus || "Employed"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Income</span>
              <span className="value">
                ₦{loanData.monthlyIncome?.toLocaleString() || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Loan Details Card */}
        <div className="info-card">
          <div className="card-header">
            <h2>Loan Details</h2>
          </div>
          <div className="info-grid">
            <div className="info-item highlight">
              <span className="label">Amount Requested</span>
              <span className="value large">
                ₦{loanData.amount?.toLocaleString()}
              </span>
            </div>
            {/* <div className="info-item highlight">
              <span className="label">Approved Amount</span>
              <span className="value large">{loanData.loanAmount}</span>
            </div> */}
            <div className="info-item">
              <span className="label">Purpose</span>
              <span className="value">{loanData.purpose}</span>
            </div>
            <div className="info-item">
              <span className="label">Tenor</span>
              <span className="value">{loanData.durationInMonths} Months</span>
            </div>
            <div className="info-item">
              <span className="label">Interest Rate</span>
              <span className="value">
                {loanData.productInterestRate || "4.5"}%
              </span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Repayment</span>
              <span className="value">{monthlyRepayment}</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment Card */}
        <div className="info-card">
          <div className="card-header">
            <h2>Risk Assessment</h2>
          </div>
          <div className="risk-content">
            <div className="credit-score-widget">
              <div className="score-circle">
                <span className="score-number">{loanData.creditScore}</span>
                <span className="score-label">Credit Score</span>
              </div>
              <div className="score-status excellent">Excellent</div>
            </div>
            <div className="risk-details">
              <div className="info-item">
                <span className="label">Risk Level</span>
                <span className="value risk-low">Low Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employment & Financial Data */}
        <div className="info-card">
          <div className="card-header">
            <h2>Employment & Financial Information</h2>
          </div>
          <div className="employment-content">
            <div className="employer-info">
              <div className="info-item">
                <span className="label">Employer</span>
                <span className="value">{employerName}</span>
              </div>
              <div className="info-item highlight-salary">
                <span className="label">Average Monthly Salary</span>
                <span className="value large">{averageMonthlySalary}</span>
              </div>
            </div>

            <div className="financial-tables">
              <div className="table-section">
                <h3>Salary/Payment History</h3>
                {salaryHistory ? (
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Employee Name</td>
                        <td>{salaryHistory.customerName || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Total Salary Payments</td>
                        <td>{salaryHistory.salaryCount || 0}</td>
                      </tr>
                      <tr>
                        <td>Average Monthly Salary</td>
                        <td>
                          ₦
                          {Number(
                            salaryHistory.averageMonthlySalary || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Latest Salary Amount</td>
                        <td>
                          ₦
                          {Number(
                            salaryHistory.latestSalaryAmount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Latest Payment Date</td>
                        <td>
                          {salaryHistory.latestPaymentDate
                            ? new Date(
                                salaryHistory.latestPaymentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td>First Payment Date</td>
                        <td>
                          {salaryHistory.firstPaymentDate
                            ? new Date(
                                salaryHistory.firstPaymentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td>Minimum Salary</td>
                        <td>
                          ₦
                          {Number(
                            salaryHistory.minSalaryAmount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Maximum Salary</td>
                        <td>
                          ₦
                          {Number(
                            salaryHistory.maxSalaryAmount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Consistent Months</td>
                        <td>{salaryHistory.consistentMonths || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No salary history available
                  </p>
                )}
              </div>

              <div className="table-section">
                <h3>Existing Loan(s)</h3>
                {salaryHistory?.hasOutstandingLoans ? (
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Total Outstanding Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Active</td>
                        <td>
                          ₦
                          {Number(
                            salaryHistory.totalOutstandingAmount || 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No outstanding loans
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        {/* <div className="info-card">
          <div className="card-header">
            <h2>Loan Timeline</h2>
          </div>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Application Submitted</h3>
                <p>{loanData.dateCreated}</p>
              </div>
            </div>
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Application Approved</h3>
                <p>{loanData.approvalDate}</p>
              </div>
            </div>
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Loan Disbursed</h3>
                <p>{loanData.disbursementDate}</p>
              </div>
            </div>
            <div className="timeline-item pending">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Next Payment Due</h3>
                <p>{loanData.nextPaymentDate}</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="loan-action-modal">
            <div className="modal-header">
              <h2 id="modal-title">
                {modalAction === "approve" ? "Approve" : "Reject"} Loan
                Application
              </h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                disabled={isProcessing}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="loan-summary">
                <h3>Loan Summary</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="label">Applicant:</span>
                    <span className="value">{loanData?.applicantName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Amount Requested:</span>
                    <span className="value">{loanData?.amountRequested}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Purpose:</span>
                    <span className="value">{loanData?.purpose}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Monthly Income:</span>
                    <span className="value">{loanData?.monthlyIncome}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Credit Score:</span>
                    <span className="value">{loanData?.creditScore}</span>
                  </div>
                </div>
              </div>
              <div className="action-section">
                <h3>
                  {modalAction === "approve" ? "Approval" : "Rejection"} Details
                </h3>
                {modalAction === "approve" && (
                  <div className="approval-info">
                    <p className="info-text">
                      By approving this loan, you confirm that the applicant
                      meets all lending criteria and risk assessment
                      requirements.
                    </p>
                    <div className="approved-amount-section">
                      <label htmlFor="approvedAmount">Approved Amount *</label>
                      <div className="amount-input-wrapper">
                        <span className="currency-symbol">₦</span>
                        <input
                          type="number"
                          id="approvedAmount"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(e.target.value)}
                          placeholder="Enter approved amount"
                          min="0"
                          step="1000"
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <small className="amount-help-text">
                        Maximum requested: {loanData?.amount}
                      </small>
                    </div>
                    <div className="approval-terms">
                      <div className="term-item">
                        <span className="label">Interest Rate:</span>
                        <span className="value">
                          {loanData?.productInterestRate}
                        </span>
                      </div>
                      <div className="term-item">
                        <span className="label">Tenor:</span>
                        <span className="value">
                          {loanData?.durationInMonths} Months
                        </span>
                      </div>
                      <div className="term-item">
                        <span className="label">Monthly Repayment:</span>
                        <span className="value">{monthlyRepayment}</span>
                      </div>
                    </div>
                  </div>
                )}
                {modalAction === "reject" && (
                  <div className="rejection-info">
                    <p className="info-text">
                      Please provide a reason for rejecting this loan
                      application. This will help the applicant understand the
                      decision.
                    </p>
                  </div>
                )}
                <div className="comment-section">
                  <label htmlFor="comment">
                    {modalAction === "approve"
                      ? "Additional Notes (Optional)"
                      : "Reason for Rejection *"}
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      modalAction === "approve"
                        ? "Add any additional notes or conditions..."
                        : "Please specify the reason for rejection..."
                    }
                    rows={4}
                    disabled={isProcessing}
                    required={modalAction === "reject"}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="outline"
                size="md"
                onClick={handleCloseModal}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={modalAction === "approve" ? "primary" : "danger"}
                size="md"
                onClick={
                  modalAction === "approve"
                    ? handleConfirmAction
                    : handleRejectAction
                }
                disabled={
                  isProcessing ||
                  (modalAction === "reject" && !comment.trim()) ||
                  (modalAction === "approve" && !approvedAmount)
                }
              >
                {isProcessing ? (
                  <>
                    <span className="loading-spinner"></span> Processing...
                  </>
                ) : (
                  getActionButtonText()
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        action={modalAction}
      />
    </div>
  );
};

export default LoanDetails;
