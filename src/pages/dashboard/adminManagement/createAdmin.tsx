import React, { useState } from "react";
import "./styless.css";
import { useCreateUserMutation } from "../../../store/apiSlice";
import { useNavigate } from "react-router-dom";
import { formatRoleName, getPasswordError } from "../../../helpers";
import { getErrorMessage } from "../../../helpers/auth";
import useRoleOptions from "./useRoleOptions";

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="2" y1="2" x2="22" y2="22" />}
  </svg>
);

function CreateAdmin() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Validation state
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Fetch roles from API
  const {
    roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useRoleOptions({ assignableOnly: true });
  const [createUser, { isLoading: creatingUser }] = useCreateUserMutation();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...errors };

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
      valid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
      valid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (getPasswordError(formData.password)) {
      newErrors.password = getPasswordError(formData.password);
      valid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm the password";
      valid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    // Validate role
    if (!formData.role) {
      newErrors.role = "Role is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitting(true);
      try {
        const { confirmPassword, ...payload } = formData;
        await createUser(payload).unwrap();
        setSubmitSuccess(true);
        setSubmitting(false);
        navigate("/admin-management");
        // Optionally reset form
        // setFormData({ firstName: "", lastName: "", email: "", password: "", role: "" });
      } catch (error: any) {
        setSubmitting(false);
        setSubmitSuccess(false);
        // Optionally handle error
        alert(getErrorMessage(error, "Failed to create admin"));
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/admin-management")}
        >
          ← Back to Admin Management
        </button>
        <h1>Create Admin</h1>
        <p className="subtitle">Manage admins and set their access level.</p>
      </div>

      <div className="users-section">
        <div className="admin-form-container">
          <form
            onSubmit={handleSubmit}
            className="admin-creation-form"
            autoComplete="off"
          >
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="James"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "input-error" : ""}
              />
              {errors.firstName && (
                <div className="error-message">{errors.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="James"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "input-error" : ""}
              />
              {errors.lastName && (
                <div className="error-message">{errors.lastName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required-mark">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                placeholder="James@japaflex.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required-mark">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {errors.password ? (
                <div className="error-message">{errors.password}</div>
              ) : (
                <div className="field-hint">
                  At least 8 characters, with an uppercase letter, a lowercase
                  letter, a number and a special character.
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required-mark">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  <EyeIcon off={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required-mark">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={errors.role ? "input-error" : ""}
                disabled={rolesLoading || rolesError}
              >
                <option value="">
                  {rolesLoading ? "Loading roles..." : "Select a role"}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
              </select>
              {errors.role && (
                <div className="error-message">{errors.role}</div>
              )}
              {rolesError && (
                <div className="error-message">Failed to load roles</div>
              )}
            </div>

            <p className="info-text">
              Invites will be sent automatically to the mail of the recipient
            </p>

            <button
              type="submit"
              className="save-button"
              disabled={submitting || creatingUser}
            >
              {submitting || creatingUser ? "Saving..." : "Save"}
            </button>

            {submitSuccess && (
              <div className="success-message">Admin created successfully!</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateAdmin;
