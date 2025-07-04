import React, { useState, ChangeEvent, FormEvent } from "react";
import "./styless.css";

interface Permissions {
  allPermission: boolean;
  businessOperation: boolean;
  auditAccess: boolean;
  createAdmin: boolean;
  deleteUser: boolean;
  sendBroadcast: boolean;
}

interface FormData {
  roleName: string;
  permissions: Permissions;
}

interface FormErrors {
  roleName: string;
}

function CreateRoles() {
  const [formData, setFormData] = useState<FormData>({
    roleName: "",
    permissions: {
      allPermission: false,
      businessOperation: false,
      auditAccess: false,
      createAdmin: false,
      deleteUser: false,
      sendBroadcast: false,
    },
  });

  const [errors, setErrors] = useState<FormErrors>({
    roleName: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: "",
      } as FormErrors);
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // If "All Permission" is checked, check all other permissions
    if (name === "allPermission") {
      setFormData({
        ...formData,
        permissions: {
          allPermission: checked,
          businessOperation: checked,
          auditAccess: checked,
          createAdmin: checked,
          deleteUser: checked,
          sendBroadcast: checked,
        },
      });
    } else {
      // Update only the specific permission
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [name]: checked,
          // If any permission is unchecked, "All Permission" should be unchecked too
          allPermission:
            name !== "allPermission" && checked
              ? formData.permissions.businessOperation &&
                formData.permissions.auditAccess &&
                formData.permissions.createAdmin &&
                formData.permissions.deleteUser &&
                formData.permissions.sendBroadcast
              : false,
        },
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormErrors> = {};
    let isValid = true;

    if (!formData.roleName.trim()) {
      newErrors.roleName = "Role name is required";
      isValid = false;
    }

    setErrors(newErrors as FormErrors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically send the data to an API
      console.log("Form data submitted:", formData);
      // Reset form or show success message
    }
  };

  return (
    <div className="role-management-page">
      <div className="page-header">
        <h1>Create Role</h1>
        <p className="page-subtitle">
          Create permission settings for each role
        </p>
      </div>

      <div className="form-container">
        <form className="role-form" onSubmit={handleSubmit}>
          {/* Role Name Field */}
          <div className="form-group">
            <label htmlFor="roleName">
              Role Name <span className="required-field">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              name="roleName"
              value={formData.roleName}
              onChange={handleInputChange}
              placeholder="e.g. Super Admin"
              className={errors.roleName ? "error-input" : ""}
            />
            {errors.roleName && (
              <div className="error-message">{errors.roleName}</div>
            )}
          </div>

          {/* Permissions Section */}
          <div className="permissions-section">
            <h3 className="section-heading">Permissions</h3>

            <div className="permission-list">
              {/* All Permission */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="allPermission"
                    name="allPermission"
                    checked={formData.permissions.allPermission}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="allPermission">All Permission</label>
                </div>
              </div>

              {/* General Access */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="generalAccess"
                    name="generalAccess"
                    checked={formData.permissions.businessOperation}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="generalAccess">Business Operation</label>
                </div>
              </div>

              {/* Edit Access */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="editAccess"
                    name="editAccess"
                    checked={formData.permissions.auditAccess}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="editAccess">Audit Access</label>
                </div>
              </div>

              {/* Create Admin */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="createAdmin"
                    name="createAdmin"
                    checked={formData.permissions.createAdmin}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="createAdmin">Create Admin</label>
                </div>
              </div>

              {/* Delete User */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="deleteUser"
                    name="deleteUser"
                    checked={formData.permissions.deleteUser}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="deleteUser">Delete User</label>
                </div>
              </div>

              {/* Send Broadcast */}
              <div className="permission-item">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="sendBroadcast"
                    name="sendBroadcast"
                    checked={formData.permissions.sendBroadcast}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="sendBroadcast">Send Broadcast</label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button type="submit" className="save-button">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoles;
