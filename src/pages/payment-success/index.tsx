import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompleteFundWalletMutation } from "../../store/apiSlice";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [completeFundWallet] = useCompleteFundWalletMutation();
  const [status, setStatus] = useState<string>("processing");
  const [message, setMessage] = useState<string>("Processing your payment...");

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

      if (!reference) {
        setStatus("error");
        setMessage("Payment reference not found. Redirecting to wallet...");
        setTimeout(() => {
          window.location.replace("/wallet");
        }, 3000);
        return;
      }

      try {
        // Call the complete fund wallet endpoint
        console.log("Calling complete fund wallet with reference:", reference);
        const response = await completeFundWallet({
          paystackReference: reference,
        }).unwrap();

        console.log("Complete fund wallet response:", response);

        // Check for success in multiple ways
        const isSuccess =
          response.status === "success" ||
          response.status === "Success" ||
          response.message?.toLowerCase().includes("successfully") ||
          response.message?.toLowerCase().includes("completed successfully");

        if (isSuccess) {
          setStatus("success");
          setMessage(
            "Payment successful! Your wallet has been updated. Redirecting..."
          );

          // Redirect to wallet page after 3 seconds
          setTimeout(() => {
            window.location.replace("/wallet");
          }, 3000);
        } else {
          throw new Error(response.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Error completing fund wallet:", error);

        // Check if this is actually a success message disguised as an error
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Payment verification failed";
        const isActuallySuccess =
          errorMessage.toLowerCase().includes("successfully") ||
          errorMessage.toLowerCase().includes("completed successfully") ||
          errorMessage.toLowerCase().includes("success");

        if (isActuallySuccess) {
          // Treat as success
          setStatus("success");
          setMessage(
            "Payment successful! Your wallet has been updated. Redirecting..."
          );

          // Redirect to wallet page after 3 seconds
          setTimeout(() => {
            window.location.replace("/wallet");
          }, 3000);
        } else {
          // Actual error
          setStatus("error");
          setMessage(
            `Payment verification failed: ${errorMessage}. Redirecting to wallet...`
          );

          // Redirect to wallet page after 4 seconds (longer for error cases)
          setTimeout(() => {
            window.location.replace("/wallet");
          }, 4000);
        }
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
            ? "Payment Error"
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
          This page will automatically redirect in a few seconds
        </p>

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
