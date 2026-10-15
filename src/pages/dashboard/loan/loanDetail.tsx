import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "../../../ui/components/button/button";
import { useLazyGetLoansByIDQuery } from "../../../store/apiSlice";
import "./loanDetail.css";

interface Transaction {
  id: number;
  date: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  balance: string;
}

const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const row = location.state?.row;

  const [getLoanById, { isLoading }] = useLazyGetLoansByIDQuery();
  const [loanData, setLoanData] = useState<any>(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
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
      }
    };

    fetchLoanDetails();
  }, [id, getLoanById]);

  console.log("LoanDetail - ID:", id, "Loan Data:", loanData);

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

  // Format date to dd/mm/yyyy
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format status for display
  const getStatusDisplay = (status: number) => {
    const statusMap: Record<number, string> = {
      0: "Pending",
      1: "Not Booked",
      2: "Approved",
      3: "Rejected",
      4: "Disbursed",
      5: "Repaid",
      6: "Overdue",
      7: "Cancelled",
      8: "Offer Letter Sent",
      9: "Offer Letter Signed",
    };
    return statusMap[status] || "Unknown";
  };

  const statusDisplay = getStatusDisplay(loanData.status);

  // Calculate payment schedule
  const calculatePaymentSchedule = () => {
    if (
      !loanData.amount ||
      !loanData.productInterestRate ||
      !loanData.durationInMonths
    ) {
      return [];
    }

    const principal = loanData.amount;
    const monthlyRate = loanData.productInterestRate / 100 / 12;
    const numberOfPayments = loanData.durationInMonths;

    // Calculate monthly payment using amortization formula
    const monthlyPayment =
      loanData.monthlyRepayment ||
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let remainingBalance = principal;
    const schedule = [];
    const startDate = loanData.approvedAt
      ? new Date(loanData.approvedAt)
      : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      // Calculate due date for this payment (i+1 months after disbursement)
      const paymentDueDate = new Date(startDate);
      paymentDueDate.setMonth(paymentDueDate.getMonth() + i + 1);
      paymentDueDate.setHours(0, 0, 0, 0);

      // Determine payment status based on due date
      let status = "Scheduled";
      if (paymentDueDate <= today) {
        status = "Due"; // Payment is due now or overdue
      }

      schedule.push({
        id: i + 1,
        dueDate: formatDate(paymentDueDate.toISOString()),
        amount: `₦${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        principal: `₦${principalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        interest: `₦${interestPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: status,
      });
    }

    return schedule;
  };

  const upcomingSchedule = calculatePaymentSchedule();

  console.log("Payment Schedule:", upcomingSchedule);
  console.log("Loan Data for calculation:", {
    amount: loanData.amount,
    interestRate: loanData.productInterestRate,
    durationInMonths: loanData.durationInMonths,
    approvedAt: loanData.approvedAt,
  });

  // Format loan data for display
  const displayData = {
    ...loanData,
    userFullName:
      loanData.userFullName ||
      `${loanData.userFirstName || ""} ${loanData.userLastName || ""}`.trim(),
    statusDisplay: statusDisplay,
    amount: loanData.amount ? `₦${loanData.amount.toLocaleString()}` : "N/A",
    principalAmount: loanData.amount
      ? `₦${loanData.amount.toLocaleString()}`
      : "N/A",
    interestRate: loanData.productInterestRate
      ? `${loanData.productInterestRate}%`
      : "N/A",
    loanTerm: loanData.durationInMonths
      ? `${loanData.durationInMonths} months`
      : "N/A",
    monthlyPayment: loanData.monthlyRepayment
      ? `₦${loanData.monthlyRepayment.toLocaleString()}`
      : "N/A",
    totalPaid: loanData.totalPaid
      ? `₦${loanData.totalPaid.toLocaleString()}`
      : "₦0",
    remainingPayments:
      loanData.remainingPayments || loanData.durationInMonths || 0,
    currentBalance: loanData.outstandingBalance
      ? `₦${loanData.outstandingBalance.toLocaleString()}`
      : loanData.amount
        ? `₦${loanData.amount.toLocaleString()}`
        : "N/A",
    disbursementDate: formatDate(loanData.approvedAt) || "Not approved",
    maturityDate: formatDate(loanData.dueDate) || "N/A",
    nextPaymentDate:
      upcomingSchedule.length > 0 ? upcomingSchedule[0].dueDate : "N/A",
    bvn: loanData.userBVN || loanData.bvn || "N/A",
    phone: loanData.userPhoneNumber || loanData.phoneNumber || "N/A",
    email: loanData.userEmail || loanData.email || "N/A",
    employmentStatus:
      loanData.employmentStatus ||
      loanData.salaryHistory?.companyName ||
      loanData.employerName ||
      "N/A",
    monthlyIncome:
      loanData.salaryHistory?.averageMonthlySalary ||
      loanData.monthlyIncome ||
      loanData.netMonthlySalary
        ? `₦${(loanData.salaryHistory?.averageMonthlySalary || loanData.monthlyIncome || loanData.netMonthlySalary).toLocaleString()}`
        : "N/A",
    accountNumber:
      loanData.accountNumber || loanData.userAccountNumber || "N/A",
    bankName: loanData.bankName || loanData.userBankName || "N/A",
    loanType: loanData.productName || loanData.purpose || "Personal Loan",
  };

  // Map transaction history from API response
  const transactionHistory = loanData.transactions?.map(
    (txn: any, index: number) => ({
      id: index + 1,
      date: formatDate(txn.transactionDate || txn.createdAt),
      type: txn.transactionType || "Payment",
      amount: txn.amount ? `₦${txn.amount.toLocaleString()}` : "N/A",
      description: txn.description || txn.narration || "Transaction",
      status: txn.status || "Completed",
      balance: txn.balance ? `₦${txn.balance.toLocaleString()}` : "N/A",
    }),
  ) || [
    {
      id: 1,
      date: formatDate(loanData.approvedAt),
      type: "Loan Approved",
      amount: loanData.amount ? `₦${loanData.amount.toLocaleString()}` : "N/A",
      description: `${loanData.productName || "Loan"} Approved`,
      status: "Completed",
      balance: loanData.amount ? `₦${loanData.amount.toLocaleString()}` : "N/A",
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
              <p className="amount">{displayData.currentBalance}</p>
            </div>
          </div>
          <div className="overview-card success">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Total Paid</h3>
              <p className="amount">{displayData.totalPaid}</p>
            </div>
          </div>
          <div className="overview-card warning">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>Next Payment</h3>
              <p className="amount">{displayData.monthlyPayment}</p>
              <small>{displayData.nextPaymentDate}</small>
            </div>
          </div>
          <div className="overview-card info">
            <div className="card-icon">🏦</div>
            <div className="card-content">
              <h3>Remaining Payments</h3>
              <p className="amount">{displayData.remainingPayments}</p>
              <small>out of {displayData.durationInMonths || 12} months</small>
            </div>
          </div>
        </div>

        {/* Basic Loan Information */}
        <div className="info-section">
          <div className="section-header">
            <h2>Basic Information</h2>
            <span
              className={`status-badge ${displayData.statusDisplay.toLowerCase()}`}
            >
              {displayData.statusDisplay}
            </span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Borrower Name</span>
              <span className="value">{displayData.userFullName}</span>
            </div>
            <div className="info-item">
              <span className="label">Loan Type</span>
              <span className="value">{displayData.loanType}</span>
            </div>
            <div className="info-item">
              <span className="label">Principal Amount</span>
              <span className="value">{displayData.principalAmount}</span>
            </div>
            <div className="info-item">
              <span className="label">Interest Rate</span>
              <span className="value">{displayData.interestRate}</span>
            </div>
            <div className="info-item">
              <span className="label">Loan Term</span>
              <span className="value">{displayData.loanTerm}</span>
            </div>
            <div className="info-item">
              <span className="label">Disbursement Date</span>
              <span className="value">{displayData.disbursementDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Maturity Date</span>
              <span className="value">{formatDate(displayData.dueDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Payment</span>
              <span className="value">
                {loanData.amount && loanData.durationInMonths
                  ? `₦${(loanData.amount / loanData.durationInMonths).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : displayData.monthlyPayment}
              </span>
            </div>
          </div>
        </div>

        {/* Borrower Information */}
        <div className="info-section">
          <div className="section-header">
            <h2>Borrower Information</h2>
          </div>
          <div className="info-grid">
            {/* <div className="info-item">
              <span className="label">BVN</span>
              <span className="value">{displayData.bvn}</span>
            </div> */}
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">09066662020</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{displayData.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Employment Status</span>
              <span className="value">{displayData.employmentStatus}</span>
            </div>
            <div className="info-item">
              <span className="label">Monthly Income</span>
              <span className="value">{displayData.monthlyIncome}</span>
            </div>
            {/* <div className="info-item">
              <span className="label">Account Number</span>
              <span className="value">{displayData.accountNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Bank</span>
              <span className="value">{displayData.bankName}</span>
            </div> */}
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
              {/* <tbody>
                {transactionHistory.map((transaction: Transaction) => (
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
              </tbody> */}
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
