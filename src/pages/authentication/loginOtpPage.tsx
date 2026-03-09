import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import logoImage from "../../assets/logoIcon.png";
import { useAuth } from "../../context/AuthContext";

const LoginOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    verifyLogin,
    refreshAuth,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from ||
    localStorage.getItem("devpay_admin_post_login_path") ||
    "/dashboard";

  const otpSentTo =
    location.state?.otpSentTo ||
    localStorage.getItem("devpay_admin_otp_sent_to") ||
    "";

  const sessionId = localStorage.getItem("devpay_admin_session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate("/login", { replace: true });
    }
  }, [navigate, sessionId]);

  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      localStorage.removeItem("devpay_admin_session_id");
      localStorage.removeItem("devpay_admin_otp_sent_to");
      localStorage.removeItem("devpay_admin_post_login_path");
      console.log("OTP verified successfully, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate, shouldRedirect]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 4) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (!sessionId) {
      setError("Session expired. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyLogin(sessionId, otp);

      // Check if password change is required
      if (response?.data?.requiresPasswordChange === true) {
        navigate("/change-password", { replace: true });
        return;
      }

      // Authenticate and redirect to dashboard
      refreshAuth();
      setShouldRedirect(true);
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src={logoImage} alt="Japaflex" className="logo" />
        </div>
        <div className="login-card-inner">
          <div className="login-content">
            <h1 className="welcome-text">Enter OTP</h1>
            <p className="instruction-text">
              {otpSentTo
                ? `We sent a code to ${otpSentTo}`
                : "Enter the code sent to your admin email."}
            </p>

            <form onSubmit={handleVerify} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="otp">OTP Code</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={authLoading || isLoading}
                  inputMode="numeric"
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={authLoading || isLoading}
              >
                {authLoading || isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>

          <div className="footer">
            <p>deVpay © 2026. All right reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOtpPage;
