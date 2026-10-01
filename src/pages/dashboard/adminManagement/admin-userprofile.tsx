import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../../ui/components/button/button";
import "./admin-userprofile.css";
import "./styless.css";
import { formatDate, formatRoleName, formatUserRoles } from "../../../helpers";
import { useGetAdminUserQuery } from "../../../store/apiSlice";
import { AdminUser } from "../../../types/types";
import useAdminUserActions from "./useAdminUserActions";

const AdminUserProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser: AdminUser | undefined = location.state?.user;

  // There's no get-by-id endpoint, so re-read the user from the list by email.
  // This keeps the page current after a role or status change.
  const { data } = useGetAdminUserQuery(
    { Search: stateUser?.email, PageSize: 50 },
    { skip: !stateUser }
  );
  const user =
    data?.data?.users?.find((u) => u.id === stateUser?.id) ?? stateUser;

  const { assignableRoles, busyUserId, canManageUser, changeRole, setActive } =
    useAdminUserActions();

  const [isEditing, setIsEditing] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const backLink = (
    <button
      type="button"
      className="back-link"
      onClick={() => navigate("/admin-management")}
    >
      ← Back to Admin Management
    </button>
  );

  // Opened directly by URL: the user isn't passed in and can't be fetched by id
  if (!user) {
    return (
      <div className="page-header">
        {backLink}
        <h1>Admin User Profile</h1>
        <p className="subtitle">
          Admin not found. Open them from the{" "}
          <Link to="/admin-management">Admin Management</Link> table.
        </p>
      </div>
    );
  }

  const isBusy = busyUserId === user.id;
  const canEdit = canManageUser(user);
  const currentRoleIds = (user.roles ?? []).map((r) => r.id);
  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const startEditing = () => {
    // Preselect the current role when the user has exactly one we can assign
    const current = assignableRoles.filter(
      (r) => currentRoleIds.includes(r.id) || r.name === user.role
    );
    setRoleId(current.length === 1 ? current[0].id : "");
    setIsActive(user.isActive);
    setIsEditing(true);
  };

  const roleChanged =
    !!roleId &&
    !(
      currentRoleIds.length <= 1 &&
      (currentRoleIds.includes(roleId) ||
        assignableRoles.find((r) => r.id === roleId)?.name === user.role)
    );
  const statusChanged = isActive !== user.isActive;

  const handleUpdate = async () => {
    if (roleChanged && !(await changeRole(user, roleId))) return;
    if (statusChanged && !(await setActive(user, isActive))) return;
    setIsEditing(false);
  };

  const handleToggleActive = () => setActive(user, !user.isActive);

  return (
    <>
      <div className="page-header">
        {backLink}
        <h1>Admin User Profile</h1>
        <p className="subtitle">Manage administrator details and permissions</p>
      </div>

      <div className="admin-profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">{initials}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user.fullName}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Role</span>
              {isEditing ? (
                <select
                  className="detail-input"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  disabled={isBusy}
                >
                  <option value="">
                    {currentRoleIds.length > 1
                      ? `Keep current (${formatUserRoles(user)})`
                      : "Select a role"}
                  </option>
                  {assignableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {formatRoleName(role.name)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="detail-value">{formatUserRoles(user)}</span>
              )}
            </div>

            <div className="detail-row">
              <span className="detail-label">Date Created</span>
              <span className="detail-value">{formatDate(user.createdAt)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Status</span>
              {isEditing ? (
                <select
                  className="detail-input"
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  disabled={isBusy}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Deactivated</option>
                </select>
              ) : (
                <span className="detail-value">
                  <span
                    className={user.isActive ? "status-active" : "status-inactive"}
                  >
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditing(false)}
                    disabled={isBusy}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUpdate}
                    disabled={isBusy || (!roleChanged && !statusChanged)}
                  >
                    {isBusy ? "Saving..." : "Update"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="md" onClick={startEditing}>
                    Edit
                  </Button>
                  <Button
                    variant={user.isActive ? "danger" : "primary"}
                    size="md"
                    onClick={handleToggleActive}
                    disabled={isBusy}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUserProfile;
