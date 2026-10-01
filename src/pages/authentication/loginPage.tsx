import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import logoImage from "../../assets/logoIcon.png"; // Adjust the path as necessary
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage, takeLoginNotice } from "../../helpers/auth";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // e.g. "Your session has expired" or "Account is deactivated", set when we signed the user out
  const [notice] = useState<string | null>(() => takeLoginNotice());
  const [isLoading, setIsLoading] = useState(false);

  const { login, loading: authLoading } = useAuth();

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  const from = location.state?.from || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { sessionId, otpSentTo } = await login(email, password);
      localStorage.setItem("devpay_admin_session_id", sessionId);
      localStorage.setItem("devpay_admin_post_login_path", from);
      if (otpSentTo) {
        localStorage.setItem("devpay_admin_otp_sent_to", otpSentTo);
      }
      navigate("/login-otp", {
        replace: true,
        state: { from, otpSentTo },
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(
        getErrorMessage(
          error,
          "Login failed. Please check your credentials and try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log("Forgot password clicked");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src={logoImage} alt="Japaflex" className="logo" />
        </div>
        <div className="login-card-inner">
          <div className="login-content">
            <h1 className="welcome-text">
              <span aria-hidden="true">👋</span> Welcome, Admin
            </h1>
            <p className="instruction-text">
              Kindly provide the following details
            </p>

            <form onSubmit={handleLogin} className="login-form">
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                notice && <div className="error-message">{notice}</div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={authLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="visibility-toggle"
                    aria-label="Toggle password visibility"
                    disabled={authLoading}
                  >
                    {passwordVisible ? (
                      <span aria-hidden="true">🙈</span>
                    ) : (
                      <span aria-hidden="true">👁️</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="forgot-password-container">
                <button
                  onClick={handleForgotPassword}
                  className="forgot-password"
                  type="button"
                  disabled={authLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={authLoading}
              >
                {authLoading ? "Logging in..." : "Login"}
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

export default LoginPage;
