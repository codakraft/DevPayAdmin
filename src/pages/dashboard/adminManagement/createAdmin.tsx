import React, { useState } from "react";
import "./styless.css";
import { useCreateUserMutation } from "../../../store/apiSlice";
import { useNavigate } from "react-router-dom";
import { formatRoleName, getPasswordError } from "../../../helpers";
import { getErrorMessage } from "../../../helpers/auth";
import useRoleOptions from "./useRoleOptions";

function CreateAdmin() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  // Validation state
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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
        await createUser(formData).unwrap();
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
          <form onSubmit={handleSubmit} className="admin-creation-form">
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
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "input-error" : ""}
              />
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
