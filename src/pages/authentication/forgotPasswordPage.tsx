import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import logoImage from "../../assets/logoIcon.png";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../store/apiSlice";
import { getPasswordError } from "../../helpers";
import {
  getErrorMessage,
  isOtpDeadEnd,
  setLoginNotice,
} from "../../helpers/auth";

const OTP_LENGTH = 6;
const SENT_MESSAGE =
  "If an account exists for this email, a 6-digit reset code has been sent. It expires in 10 minutes.";

// Two steps: request a code by email, then reset the password with it
const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState<string>(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();
  const busy = sending || resetting;

  const requestCode = async () => {
    setError(null);
    setNotice(null);
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setOtp("");
      setNotice(SENT_MESSAGE);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't send a reset code. Please try again."));
    }
  };

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    requestCode();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }
    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({
        email: email.trim(),
        otp,
        newPassword,
        confirmNewPassword,
      }).unwrap();
      setLoginNotice(
        response?.message ||
          "Password reset successfully. Please log in with your new password."
      );
      navigate("/login", { replace: true });
    } catch (err) {
      // Locked or expired: this code can't be used again, so ask for a new one
      if (isOtpDeadEnd(err)) setOtp("");
      setError(getErrorMessage(err, "Couldn't reset your password. Please try again."));
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
            <h1 className="welcome-text">Reset Password</h1>

            {step === "email" ? (
              <>
                <p className="instruction-text">
                  Enter your email and we'll send you a code to reset your
                  password.
                </p>
                <form onSubmit={handleRequestCode} className="login-form">
                  {error && <div className="error-message">{error}</div>}
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={busy}
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="login-button" disabled={busy}>
                    {sending ? "Sending..." : "Send reset code"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="instruction-text">
                  Enter the code sent to <strong>{email.trim()}</strong> and
                  choose a new password.
                </p>
                <form onSubmit={handleReset} className="login-form">
                  {error ? (
                    <div className="error-message">{error}</div>
                  ) : (
                    notice && <div className="info-message">{notice}</div>
                  )}
                  <div className="form-group">
                    <label htmlFor="otp">Reset code</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH)
                        )
                      }
                      required
                      disabled={busy}
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={OTP_LENGTH}
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={busy}
                      autoComplete="new-password"
                    />
                    <span className="field-hint">
                      At least 8 characters, with an uppercase letter, a
                      lowercase letter, a number and a special character.
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm new password</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={busy}
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="login-button" disabled={busy}>
                    {resetting ? "Resetting..." : "Reset password"}
                  </button>
                  <div className="forgot-password-container">
                    <button
                      type="button"
                      className="forgot-password"
                      onClick={requestCode}
                      disabled={busy}
                    >
                      {sending ? "Sending..." : "Send a new code"}
                    </button>
                  </div>
                </form>
              </>
            )}

            <p className="back-to-login">
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
