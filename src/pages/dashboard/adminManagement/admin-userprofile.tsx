import React, { useState } from "react";
import Button from "../../../ui/components/button/button";
import "./admin-userprofile.css";

interface AdminUserProfileProps {}

const AdminUserProfile: React.FC<AdminUserProfileProps> = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Adedamola, Agunbiade",
    email: "damola@gmail.com",
    role: "Admin Role",
    branch: "Head Office",
    phone: "070123456789",
    gender: "Male",
    status: "Active",
  });

  const handleDeactivate = () => {
    console.log("Deactivate admin");
  };

  const handleDisable = () => {
    console.log("Disable admin");
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdate = () => {
    console.log("Update admin data:", formData);
    setIsEditing(false);
    // Add API call to update admin data here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="page-header">
        <h1>Admin User Profile</h1>
        <p className="subtitle">Manage administrator details and permissions</p>
      </div>

      <div className="admin-profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">AA</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  className="detail-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                <span className="detail-value">{formData.name}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{formData.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Role</span>
              {isEditing ? (
                <select
                  className="detail-input"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <option value="Admin Role">Admin Role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              ) : (
                <span className="detail-value">{formData.role}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Branch</span>
              {isEditing ? (
                <input
                  type="text"
                  className="detail-input"
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                />
              ) : (
                <span className="detail-value">{formData.branch}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Phone No.</span>
              {isEditing ? (
                <input
                  type="text"
                  className="detail-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <span className="detail-value">{formData.phone}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Gender</span>
              {isEditing ? (
                <select
                  className="detail-input"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span className="detail-value">{formData.gender}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Status</span>
              {isEditing ? (
                <select
                  className="detail-input"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              ) : (
                <span
                  className={`detail-value ${
                    formData.status.toLowerCase() === "active"
                      ? "status-active"
                      : ""
                  }`}
                >
                  {formData.status}
                </span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <Button variant="outline" size="md" onClick={handleEdit}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleUpdate}>
                  Update
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={handleEdit}>
                  Edit
                </Button>
                <Button variant="danger" size="md" onClick={handleDisable}>
                  Disable
                </Button>
                <Button variant="danger" size="md" onClick={handleDeactivate}>
                  Deactivate
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUserProfile;
