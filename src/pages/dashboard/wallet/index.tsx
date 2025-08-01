import React, { useState, useEffect } from "react";
import Button from "../../../ui/components/button/button";
import {
  useGetCompanyWalletQuery,
  useFundWalletMutation,
  useGetWalletTransactionsQuery,
} from "../../../store/apiSlice";
import { useAuth } from "../../../context/AuthContext";
import "./wallet.css";

const Wallet: React.FC = () => {
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  // Get logged-in user information
  const { user, refreshAuth } = useAuth();

  // Fetch wallet data from API
  const {
    data: walletData,
    isLoading,
    error,
    refetch,
  } = useGetCompanyWalletQuery();

  // Fund wallet mutation
  const [fundWallet, { isLoading: isFunding }] = useFundWalletMutation();

  // Fetch wallet transactions
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery(
    { walletId: walletData?.data?.id || "", page: 1, pageSize: 20 },
    { skip: !walletData?.data?.id } // Skip the query if walletId is not available
  );

  // Extract wallet information from API response
  const currentBalance = walletData?.data?.balance || 0;
  const totalCredits = walletData?.data?.totalCredits || 0;
  const totalDebits = walletData?.data?.totalDebits || 0;
  const lastUpdated = walletData?.data?.updatedAt || new Date().toISOString();

  // Check for payment callback and refetch data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasPaymentCallback =
      urlParams.get("reference") ||
      urlParams.get("trxref") ||
      urlParams.get("payment_status");

    if (hasPaymentCallback) {
      // Payment callback detected
      console.log("Payment callback detected, refreshing auth and wallet data");

      // Show success message if payment was successful
      const paymentStatus = urlParams.get("payment_status");
      if (paymentStatus === "success") {
        setTimeout(() => {
          alert("Payment successful! Your wallet has been updated.");
        }, 1000);
      }

      // Refresh authentication state first
      refreshAuth();

      // Then refetch wallet data and transactions
      refetch();
      refetchTransactions();

      // Clean up URL parameters
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refetch, refreshAuth, refetchTransactions]);

  // Mock transaction history
  const recentTransactions = [
    {
      id: 1,
      type: "credit",
      amount: 50000,
      description: "Wallet Funding",
      date: "2025-07-30",
      time: "14:30",
      status: "completed",
    },
    {
      id: 2,
      type: "debit",
      amount: 25000,
      description: "Loan Disbursement - John Doe",
      date: "2025-07-29",
      time: "09:15",
      status: "completed",
    },
    {
      id: 3,
      type: "credit",
      amount: 100000,
      description: "Wallet Funding",
      date: "2025-07-28",
      time: "16:45",
      status: "completed",
    },
    {
      id: 4,
      type: "debit",
      amount: 15000,
      description: "Loan Disbursement - Sarah Johnson",
      date: "2025-07-27",
      time: "11:20",
      status: "completed",
    },
    {
      id: 5,
      type: "credit",
      amount: 75000,
      description: "Loan Repayment - Mike Wilson",
      date: "2025-07-26",
      time: "13:10",
      status: "completed",
    },
  ];

  // Get real transactions or fallback to mock data
  console.log("Raw transactionsData:", transactionsData);
  console.log("transactionsData.data:", transactionsData?.data);

  let displayTransactions = [];

  // Check if transactionsData has data
  if (transactionsData?.data && Array.isArray(transactionsData.data)) {
    displayTransactions = transactionsData.data.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType.toLowerCase().includes("funding")
        ? "credit"
        : "debit",
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.createdAt).toLocaleDateString(),
      time: new Date(transaction.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "completed", // Since all transactions in response appear to be completed
      reference: transaction.paystackReference,
      balanceAfter: transaction.balanceAfter,
    }));
  } else if (transactionsData && Array.isArray(transactionsData)) {
    // Handle case where response is directly an array
    displayTransactions = transactionsData.map((transaction) => ({
      id: transaction.id,
      type: transaction.transactionType.toLowerCase().includes("funding")
        ? "credit"
        : "debit",
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.createdAt).toLocaleDateString(),
      time: new Date(transaction.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "completed",
      reference: transaction.paystackReference,
      balanceAfter: transaction.balanceAfter,
    }));
  } else {
    // Fallback to mock data if no real data
    displayTransactions = recentTransactions;
  }

  console.log("Final displayTransactions:", displayTransactions);
  console.log("displayTransactions length:", displayTransactions?.length);

  const handleFundWallet = async () => {
    // Early validation
    const amount = parseFloat(fundAmount);
    if (!fundAmount || amount <= 0 || amount < 1000) {
      alert("Please enter a valid amount (minimum ₦1,000)");
      return;
    }

    if (!walletData?.data?.id) {
      alert(
        "Wallet information not available. Please refresh the page and try again."
      );
      return;
    }

    if (!user?.email) {
      alert("User information not available. Please log in again.");
      return;
    }

    try {
      const fundingData = {
        walletId: walletData.data.id,
        amount,
        email: user.email,
        callbackUrl: `${window.location.origin}/payment-success`,
      };

      const response = await fundWallet(fundingData).unwrap();

      // Extract authorization URL with fallback checks
      const authorizationUrl = response.data?.authorizationUrl;

      if (
        authorizationUrl &&
        typeof authorizationUrl === "string" &&
        authorizationUrl.startsWith("http")
      ) {
        // Close modal and redirect to payment
        setShowFundModal(false);
        setFundAmount("");
        window.location.href = authorizationUrl;
      } else {
        throw new Error("Invalid payment URL received from server");
      }
    } catch (error: any) {
      console.error("Wallet funding error:", error);

      // Extract user-friendly error message
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        (error?.status === 401
          ? "Authentication failed. Please log in again."
          : error?.status === 403
          ? "You don't have permission to perform this action."
          : error?.status >= 500
          ? "Server error. Please try again later."
          : "Failed to process payment. Please try again.");

      alert(`Payment Error: ${errorMessage}`);
    }
  };

  const handleCloseFundModal = () => {
    if (!isFunding) {
      setShowFundModal(false);
      setFundAmount("");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="wallet-container">
      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid #eee",
              borderTop: "4px solid #3A7145",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`@keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }`}
          </style>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#dc2626",
          }}
        >
          <h3>Error loading wallet data</h3>
          <p>
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <div className="wallet-header">
            <h1>My Wallet</h1>
            <p className="wallet-subtitle">
              Manage your funds and track transactions
            </p>
          </div>

          {/* Balance Card */}
          <div className="balance-card">
            <div className="balance-content">
              <div className="balance-info">
                <span className="balance-label">Current Balance</span>
                <div className="balance-amount">
                  {formatCurrency(currentBalance)}
                </div>
                <span className="balance-updated">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              </div>
              <div className="balance-actions">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowFundModal(true)}
                  className="fund-wallet-btn"
                >
                  <span className="btn-icon">💰</span>
                  Fund Wallet
                </Button>
              </div>
            </div>
            <div className="balance-visual">
              <div className="wallet-icon">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                  <rect
                    x="10"
                    y="20"
                    width="100"
                    height="50"
                    rx="8"
                    fill="url(#gradient1)"
                  />
                  <rect
                    x="15"
                    y="25"
                    width="90"
                    height="40"
                    rx="4"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <circle cx="85" cy="45" r="8" fill="rgba(255,255,255,0.3)" />
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3A7145" />
                      <stop offset="100%" stopColor="#4D774E" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon credit">📈</div>
              <div className="stat-content">
                <span className="stat-label">Total Credited</span>
                <span className="stat-value">
                  {formatCurrency(totalCredits)}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon debit">📉</div>
              <div className="stat-content">
                <span className="stat-label">Total Debited</span>
                <span className="stat-value">
                  {formatCurrency(totalDebits)}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon transactions">🔄</div>
              <div className="stat-content">
                <span className="stat-label">Transactions</span>
                <span className="stat-value">
                  {displayTransactions?.length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="transactions-section">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="transactions-list">
              {isLoadingTransactions ? (
                <div
                  className="loading-state"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  Loading transactions...
                </div>
              ) : transactionsError ? (
                <div
                  className="error-state"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#dc3545",
                  }}
                >
                  Error loading transactions
                </div>
              ) : displayTransactions?.length > 0 ? (
                displayTransactions?.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      <span className={`icon ${transaction.type}`}>
                        {transaction.type === "credit" ? "↗️" : "↙️"}
                      </span>
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-meta">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type}`}>
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span className="transaction-status">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="no-transactions"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No transactions found
                </div>
              )}
            </div>
          </div>

          {/* Fund Wallet Modal */}
          {showFundModal && (
            <div className="modal-overlay" aria-modal="true">
              <div className="fund-modal">
                <div className="modal-header">
                  <h2>Fund Wallet</h2>
                  <button
                    className="modal-close-btn"
                    onClick={handleCloseFundModal}
                    disabled={isFunding}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="current-balance-info">
                    <span className="label">Current Balance</span>
                    <span className="value">
                      {formatCurrency(currentBalance)}
                    </span>
                  </div>

                  <div className="fund-amount-section">
                    <label htmlFor="fundAmount">Amount to Fund</label>
                    <div className="amount-input-wrapper">
                      <span className="currency-symbol">₦</span>
                      <input
                        type="number"
                        id="fundAmount"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1000"
                        step="1000"
                        disabled={isFunding}
                        required
                      />
                    </div>
                    <small className="fund-help-text">
                      Minimum funding amount: ₦1,000
                    </small>
                  </div>

                  <div className="quick-amounts">
                    <span className="quick-label">Quick amounts:</span>
                    <div className="quick-buttons">
                      {[10000, 25000, 50000, 100000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className="quick-amount-btn"
                          onClick={() => setFundAmount(String(amount))}
                          disabled={isFunding}
                        >
                          ₦{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleCloseFundModal}
                    disabled={isFunding}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleFundWallet}
                    disabled={
                      isFunding ||
                      !fundAmount ||
                      parseFloat(fundAmount || "0") < 1000 ||
                      !walletData?.data?.id ||
                      !user?.email
                    }
                  >
                    {isFunding ? (
                      <>
                        <span className="loading-spinner"></span> Processing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">💳</span>
                        Fund Wallet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Wallet;
