import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "../../../ui/components/button/button";
import "./loanDetails.css";
import {
  useApproveLoanMutation,
  useRejectLoanMutation,
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

  console.log("Loan ID from params:", row);

  const [approveLoan, { isLoading: approveLoading }] = useApproveLoanMutation();
  const [rejectLoan, { isLoading: rejectLoading }] = useRejectLoanMutation();

  // Use row from navigation state if available, else fallback to mock data
  const loanData = row;

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

  const handleApprove = () => {
    setModalAction("approve");
    setApprovedAmount(loanData.amount);
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
            <span
              className={`status-badge ${loanData?.statusDisplay?.toLowerCase()}`}
            >
              {loanData?.statusDisplay}
            </span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Full Name</span>
              <span className="value">{loanData?.userFullName}</span>
            </div>
            {/* <div className="info-item">
              <span className="label">BVN</span>
              <span className="value">{loanData?.bvn}</span>
            </div> */}
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{loanData?.userEmail}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">08045647363</span>
            </div>
            <div className="info-item">
              <span className="label">Employment Status</span>
              <span className="value">Employed</span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Income</span>
              <span className="value">{loanData.monthlyIncome}</span>
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
              <span className="value large">₦{loanData?.amount}</span>
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
              <span className="value">4.5%</span>
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
                <span className="value">N/A</span>
              </div>
              <div className="info-item highlight-salary">
                <span className="label">Average Monthly Salary</span>
                {/* <span className="value large">₦28,724.14</span> */}
                <span className="value large">N/A</span>
              </div>
            </div>

            <div className="financial-tables">
              <div className="table-section">
                <h3>Salary/Payment History</h3>
                <table className="financial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>29-May-2025</td>
                      <td>₦97,388.47</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>26-May-2025</td>
                      <td>₦91,253.45</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>17-Apr-2025</td>
                      <td>₦46,407.47</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>25-Mar-2025</td>
                      <td>₦43,507.47</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>3-Mar-2025</td>
                      <td>₦43,507.47</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>23-Jan-2025</td>
                      <td>₦13,007.47</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="table-section">
                <h3>Existing Loan(s)</h3>
                {/* <table className="financial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Disbursed On</th>
                      <th>Loan Amount</th>
                      <th>Outstanding</th>
                      <th>Monthly Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>17-Jun-2025</td>
                      <td>₦12,000.00</td>
                      <td>₦22,800.00</td>
                      <td>₦1,900.00</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>11-Jun-2025</td>
                      <td>₦50,000.00</td>
                      <td>₦86,000.00</td>
                      <td>₦14,333.33</td>
                    </tr>
                  </tbody>
                </table> */}
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
