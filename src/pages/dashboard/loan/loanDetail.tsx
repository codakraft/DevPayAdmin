import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "../../../ui/components/button/button";
import "./loanDetail.css";

const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const row = location.state?.row;

  console.log("LoanDetail - ID:", row);

  // Use row from navigation state if available, else fallback to mock data
  const loanData = row || {
    id: id,
    borrowerName: "Fayemi Kayode",
    loanType: "Personal Loan",
    principalAmount: "₦500,000",
    currentBalance: "₦387,500",
    monthlyPayment: "₦45,833",
    nextPaymentDate: "2025-07-15",
    loanTerm: "12 months",
    interestRate: "4.5%",
    status: "Active",
    disbursementDate: "2025-03-10",
    maturityDate: "2026-03-10",
    totalPaid: "₦112,500",
    remainingPayments: 9,
    bvn: "32345678901",
    phone: "+234 123 4567 890",
    email: "fayemi.kayode@example.com",
    employmentStatus: "Employed",
    monthlyIncome: "₦350,000",
    accountNumber: "1234567890",
    bankName: "Access Bank",
  };

  const transactionHistory = [
    {
      id: 1,
      date: "2025-06-15",
      type: "Payment",
      amount: "₦45,833",
      description: "Monthly Payment",
      status: "Completed",
      balance: "₦387,500",
    },
    {
      id: 2,
      date: "2025-05-15",
      type: "Payment",
      amount: "₦45,833",
      description: "Monthly Payment",
      status: "Completed",
      balance: "₦433,333",
    },
    {
      id: 3,
      date: "2025-04-15",
      type: "Payment",
      amount: "₦20,834",
      description: "Partial Payment",
      status: "Completed",
      balance: "₦479,166",
    },
    {
      id: 4,
      date: "2025-03-10",
      type: "Disbursement",
      amount: "₦500,000",
      description: "Loan Disbursement",
      status: "Completed",
      balance: "₦500,000",
    },
  ];

  const upcomingSchedule = [
    {
      id: 1,
      dueDate: "2025-07-15",
      amount: "₦45,833",
      principal: "₦42,083",
      interest: "₦3,750",
      status: "Due",
    },
    {
      id: 2,
      dueDate: "2025-08-15",
      amount: "₦45,833",
      principal: "₦42,242",
      interest: "₦3,591",
      status: "Scheduled",
    },
    {
      id: 3,
      dueDate: "2025-09-15",
      amount: "₦45,833",
      principal: "₦42,401",
      interest: "₦3,432",
      status: "Scheduled",
    },
    {
      id: 4,
      dueDate: "2025-10-15",
      amount: "₦45,833",
      principal: "₦42,561",
      interest: "₦3,272",
      status: "Scheduled",
    },
    {
      id: 5,
      dueDate: "2025-11-15",
      amount: "₦45,833",
      principal: "₦42,722",
      interest: "₦3,111",
      status: "Scheduled",
    },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleMakePayment = () => {
    console.log("Navigate to payment page for loan", id);
  };

  const handleSendReminder = () => {
    console.log("Send payment reminder for loan", id);
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
          <div>
            <h1>Loan Details</h1>
            <p className="subtitle">
              Comprehensive loan information and payment tracking
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="md" onClick={handleSendReminder}>
            Send Reminder
          </Button>
          <Button variant="primary" size="md" onClick={handleMakePayment}>
            Make Payment
          </Button>
        </div>
      </div>

      <div className="loan-content">
        {/* Loan Overview Cards */}
        <div className="overview-cards">
          <div className="overview-card primary">
            <div className="card-icon">₦</div>
            <div className="card-content">
              <h3>Current Balance</h3>
              <p className="amount">{loanData?.amount}</p>
            </div>
          </div>
          <div className="overview-card success">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Total Paid</h3>
              <p className="amount">{loanData.totalPaid}</p>
            </div>
          </div>
          <div className="overview-card warning">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>Next Payment</h3>
              <p className="amount">{loanData.monthlyPayment}</p>
              <small>{loanData.nextPaymentDate}</small>
            </div>
          </div>
          <div className="overview-card info">
            <div className="card-icon">🏦</div>
            <div className="card-content">
              <h3>Remaining Payments</h3>
              <p className="amount">{loanData.remainingPayments}</p>
              <small>out of 12 months</small>
            </div>
          </div>
        </div>

        {/* Basic Loan Information */}
        <div className="info-section">
          <div className="section-header">
            <h2>Basic Information</h2>
            <span
              className={`status-badge ${loanData.statusDisplay.toLowerCase()}`}
            >
              {loanData.statusDisplay}
            </span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Borrower Name</span>
              <span className="value">{loanData.userFullName}</span>
            </div>
            <div className="info-item">
              <span className="label">Loan Type</span>
              <span className="value">{loanData.loanType}</span>
            </div>
            <div className="info-item">
              <span className="label">Principal Amount</span>
              <span className="value">{loanData.principalAmount}</span>
            </div>
            <div className="info-item">
              <span className="label">Interest Rate</span>
              <span className="value">{loanData.interestRate}</span>
            </div>
            <div className="info-item">
              <span className="label">Loan Term</span>
              <span className="value">{loanData.loanTerm}</span>
            </div>
            <div className="info-item">
              <span className="label">Disbursement Date</span>
              <span className="value">{loanData.disbursementDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Maturity Date</span>
              <span className="value">{loanData.maturityDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Payment</span>
              <span className="value">{loanData.monthlyPayment}</span>
            </div>
          </div>
        </div>

        {/* Borrower Information */}
        <div className="info-section">
          <div className="section-header">
            <h2>Borrower Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">BVN</span>
              <span className="value">{loanData.bvn}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">{loanData.phone}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{loanData.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Employment Status</span>
              <span className="value">{loanData.employmentStatus}</span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Income</span>
              <span className="value">{loanData.monthlyIncome}</span>
            </div>
            <div className="info-item">
              <span className="label">Account Number</span>
              <span className="value">{loanData.accountNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Bank</span>
              <span className="value">{loanData.bankName}</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="table-section">
          <div className="section-header">
            <h2>Transaction History</h2>
          </div>
          <div className="table-container">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>
                      <span
                        className={`type-badge ${transaction.type.toLowerCase()}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.description}</td>
                    <td className="amount-cell">{transaction.amount}</td>
                    <td className="balance-cell">{transaction.balance}</td>
                    <td>
                      <span
                        className={`status-badge ${transaction.status.toLowerCase()}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Payment Schedule */}
        <div className="table-section">
          <div className="section-header">
            <h2>Upcoming Payment Schedule</h2>
          </div>
          <div className="table-container">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSchedule.map((payment) => (
                  <tr
                    key={payment.id}
                    className={payment.status === "Due" ? "due-payment" : ""}
                  >
                    <td>{payment.dueDate}</td>
                    <td className="amount-cell">{payment.amount}</td>
                    <td className="principal-cell">{payment.principal}</td>
                    <td className="interest-cell">{payment.interest}</td>
                    <td>
                      <span
                        className={`status-badge ${payment.status.toLowerCase()}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;
