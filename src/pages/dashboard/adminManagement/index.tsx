import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UsersTable from "../components/UsersTable";
import "./styless.css";
import admin from "../../../assets/admin.svg";
import filter from "../../../assets/filter.svg";
import AdminTable from "./components/adminTable";
import { AdminUser, AdminUserResponse } from "../../../types/types";
import { useAuth } from "../../../context/AuthContext";
import { Permissions } from "../../../helpers/auth";

function AdminManagement() {
  const navigate = useNavigate();
  const { can, isSuperAdmin } = useAuth();
  const [activeTimeFilter, setActiveTimeFilter] = useState<"week" | "year">(
    "week"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  //   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  //   const [selectAll, setSelectAll] = useState<boolean>(false);

  const handleCreateAdminClick = () => {
    navigate("/admin-management/create");
  };
  const handleCreateAdminRolesClick = () => {
    navigate("/admin-management/roles-permissions");
  };

  return (
    <>
      <div className="page-header">
        <h1>Admin Management</h1>
        <p className="subtitle">Manage admins and set their access level.</p>
      </div>

      <div className="users-section">
        <div className="admin-management-actions">
          <div className="action-buttons">
            {can(Permissions.UsersManage) && (
              <button
                className="create-admin-button"
                onClick={handleCreateAdminClick}
              >
                <img src={admin} alt="Create Admin" className="admin-icon" />
                Create Admin
              </button>
            )}

            {isSuperAdmin && (
              <button
                className="create-roles-button"
                onClick={handleCreateAdminRolesClick}
              >
                <img
                  src={admin}
                  alt="Roles and Permissions"
                  className="admin-icon"
                />
                Roles & Permissions
              </button>
            )}
          </div>
        </div>
        <AdminTable />
      </div>
    </>
  );
}

export default AdminManagement;
