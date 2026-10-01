import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import logoImage from "../../assets/logoIcon.png";
import { useChangePasswordMutation } from "../../store/apiSlice";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage, setLoginNotice } from "../../helpers/auth";
import { getPasswordError } from "../../helpers";

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { completePasswordChange } = useAuth();
  const [changePassword, { isLoading: changingPassword }] =
    useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Same rule the backend enforces
    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setIsLoading(true);
    try {
      const payload = { currentPassword, newPassword, confirmNewPassword };
      const response = await changePassword(payload).unwrap();
      // Continue with the new tokens it returns. If they're missing, fall back
      // to signing in again.
      if (completePasswordChange(response)) {
        navigate("/dashboard", { replace: true });
      } else {
        setLoginNotice("Password changed. Please sign in.");
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to change password. Please try again."),
      );
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
            <h1 className="welcome-text">Change Password</h1>
            <p className="instruction-text">
              Please set a new password for your account.
            </p>
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading || changingPassword}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading || changingPassword}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={isLoading || changingPassword}
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading || changingPassword}
              >
                {isLoading || changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
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

export default ChangePasswordPage;
