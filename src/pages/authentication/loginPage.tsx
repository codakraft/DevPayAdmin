import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import logoImage from "../../assets/logoIcon.png"; // Adjust the path as necessary
import { useLoginMutation } from "../../store/apiSlice";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [login, { isLoading: loginLoading }] = useLoginMutation();

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  const from = location.state?.from?.pathname ?? "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log("Login request:", email, password);

    try {
      const response = await login({ email, password }).unwrap();
      console.log("Full login response:", response);
      if (!response.success) {
        throw new Error("Login failed");
      }
      if (response.data && response.data.accessToken) {
        localStorage.setItem("devpay_admin_token", response.data.accessToken);
        localStorage.setItem(
          "devpay_admin_user",
          JSON.stringify(response.data.user)
        );
        console.log("Login successful - data saved");
        console.log("Navigating to /dashboard...");
        navigate("/dashboard", { replace: true });
        console.log("Navigation to /dashboard triggered");
      } else {
        throw new Error("No token received");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials and try again.");
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
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginLoading}
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
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="visibility-toggle"
                    aria-label="Toggle password visibility"
                    disabled={loginLoading}
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
                  disabled={loginLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          <div className="footer">
            <p>deVpay © 2025. All right reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
