import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompleteFundWalletMutation } from "../../store/apiSlice";
import { getErrorMessage } from "../../helpers/auth";

const WALLET_PATH = "/wallet";

const goToWallet = (delayMs: number) =>
  setTimeout(() => window.location.replace(WALLET_PATH), delayMs);

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [completeFundWallet] = useCompleteFundWalletMutation();
  const [status, setStatus] = useState<string>("processing");
  const [message, setMessage] = useState<string>("Processing your payment...");
  // Paystack couldn't be reached (502): checking again is safe
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("status");
      const reference = urlParams.get("reference") || urlParams.get("trxref");

      console.log("Payment success page loaded with:", {
        paymentStatus,
        reference,
      });

      // Cancelled or closed checkout (the backend sends Paystack's cancel_action here)
      if (paymentStatus === "cancelled" || paymentStatus === "failed") {
        setStatus("error");
        setMessage(
          "The payment was cancelled or declined. Your wallet wasn't charged. Redirecting to your wallet..."
        );
        goToWallet(4000);
        return;
      }

      if (!reference) {
        setStatus("error");
        setMessage("Payment reference not found. Redirecting to your wallet...");
        goToWallet(3000);
        return;
      }

      try {
        const response = await completeFundWallet({
          paystackReference: reference,
        }).unwrap();

        // A 200 is a credited wallet (including alreadyCompleted after a refresh),
        // unless the body says otherwise. Older backends return only { message }.
        // Trust the status fields, never the wording of the message.
        const transactionStatus = response?.data?.transactionStatus;
        const isSuccess =
          response?.success !== false &&
          (!transactionStatus || transactionStatus.toLowerCase() === "success");

        if (isSuccess) {
          setStatus("success");
          setMessage(
            "Payment successful! Your wallet has been updated. Redirecting..."
          );
          goToWallet(3000);
        } else {
          setStatus("error");
          setMessage(
            `${
              response?.message || "The payment was declined."
            } Your wallet wasn't credited. Redirecting to your wallet...`
          );
          goToWallet(4000);
        }
      } catch (error: any) {
        console.error("Error completing fund wallet:", error);
        setStatus("error");
        if (error?.status === 502) {
          // Payment provider unreachable: don't redirect, let the user check again
          setCanRetry(true);
          setMessage(
            "We couldn't reach the payment provider to confirm this payment. Please try again."
          );
          return;
        }
        // 400 with data.transactionStatus = failed/abandoned, 404 unknown, 409 expired
        const declined = !!error?.data?.data?.transactionStatus;
        setMessage(
          `${getErrorMessage(
            error,
            declined ? "The payment was declined." : "We couldn't verify this payment."
          )} Your wallet wasn't credited. Redirecting to your wallet...`
        );
        goToWallet(4000);
      }
    };

    processPayment();
  }, [navigate, completeFundWallet]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            background:
              status === "success"
                ? "linear-gradient(135deg, #3A7145, #4D774E)"
                : status === "error"
                ? "linear-gradient(135deg, #dc2626, #ef4444)"
                : "linear-gradient(135deg, #3A7145, #4D774E)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "24px",
            color: "white",
          }}
        >
          {status === "success" ? "✓" : status === "error" ? "✗" : "⏳"}
        </div>

        <h2
          style={{
            color: status === "error" ? "#dc2626" : "#3A7145",
            marginBottom: "15px",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          {status === "success"
            ? "Payment Successful!"
            : status === "error"
            ? "Payment Not Completed"
            : "Processing Payment"}
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>

        {status === "processing" && (
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #eee",
              borderTop: "4px solid #3A7145",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
        )}

        <p
          style={{
            color: "#999",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          {canRetry
            ? "Your payment details are safe; checking again won't charge you twice."
            : "This page will automatically redirect in a few seconds"}
        </p>

        {canRetry && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              marginRight: "8px",
              padding: "10px 20px",
              border: "1px solid #3A7145",
              borderRadius: "6px",
              background: "white",
              color: "#3A7145",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        )}
        {status !== "processing" && (
          <button
            type="button"
            onClick={() => window.location.replace(WALLET_PATH)}
            style={{
              marginTop: "8px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#3A7145",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Back to Wallet
          </button>
        )}

        <style>
          {`@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`}
        </style>
      </div>
    </div>
  );
};

export default PaymentSuccess;
