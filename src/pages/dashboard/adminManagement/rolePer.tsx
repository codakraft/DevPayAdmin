import React from "react";
import { useNavigate } from "react-router-dom";
import "./styless.css";
import { Permissions } from "../../../helpers/auth";
import { formatRoleName } from "../../../helpers";
import useRoleOptions from "./useRoleOptions";

const ALL_PERMISSIONS: string[] = Object.values(Permissions);

// "loans.approve" -> "Loans: Approve"
const formatPermission = (permission: string) =>
  permission
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(": ");

// Roles and permissions are read from admin/roles, the same table the backend
// authorizes against. They can't be edited from here.
function RolesPermissions() {
  const navigate = useNavigate();
  const { allRoles, isLoading, isError } = useRoleOptions();

  const renderPermissions = (permissions: string[]) => {
    if (ALL_PERMISSIONS.every((p) => permissions.includes(p))) {
      return <span className="permission-chip all">All permissions</span>;
    }
    if (permissions.length === 0) {
      return <span className="permission-chip">No permissions</span>;
    }
    return permissions.map((permission) => (
      <span className="permission-chip" key={permission}>
        {formatPermission(permission)}
      </span>
    ));
  };

  const renderRoles = () => {
    if (isLoading) return <p className="page-subtitle">Loading roles...</p>;
    if (isError) {
      return <div className="error-message">Failed to load roles.</div>;
    }
    return (
      <div className="roles-matrix">
        {allRoles.map(({ id, name, permissions = [] }) => (
          <div className="roles-matrix-row" key={id}>
            <div className="roles-matrix-role">{formatRoleName(name)}</div>
            <div className="roles-matrix-permissions">
              {renderPermissions(permissions)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="role-management-page">
      <div className="page-header">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/admin-management")}
        >
          ← Back to Admin Management
        </button>
        <h1>Roles & Permissions</h1>
        <p className="page-subtitle">
          What each role can do. Roles are managed by the platform and can't be
          edited here. Assign a role to an admin from the Admin Management
          table.
        </p>
      </div>

      {renderRoles()}
    </div>
  );
}

export default RolesPermissions;
