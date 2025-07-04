import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UsersTable from "../components/UsersTable";
import "./styless.css";
import admin from "../../../assets/admin.svg";
import filter from "../../../assets/filter.svg";
import AdminTable from "./components/adminTable";

function AdminManagement() {
  const navigate = useNavigate();
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
          {/* <div className="search-container-admin">
            <div className="search-icon-admin">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5 14H14.71L14.43 13.73C15.63 12.33 16.25 10.42 15.91 8.39C15.44 5.61 13.12 3.39 10.32 3.05C6.09 2.53 2.53 6.09 3.05 10.32C3.39 13.12 5.61 15.44 8.39 15.91C10.42 16.25 12.33 15.63 13.73 14.43L14 14.71V15.5L19 20.5L20.5 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                  fill="#9CA3AF"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-admin"
            />
          </div> */}

          <div className="action-buttons">
            {/* <button className="filter-button">
              <img src={filter} alt="Filter" className="filter-icon" />
              Filter
            </button> */}

            <button
              className="create-admin-button"
              onClick={handleCreateAdminClick}
            >
              <img src={admin} alt="Create Admin" className="admin-icon" />
              Create Admin
            </button>

            <button
              className="create-roles-button"
              onClick={handleCreateAdminRolesClick}
            >
              <img src={admin} alt="Create Roles" className="admin-icon" />
              Create Roles
            </button>
          </div>
        </div>
        <AdminTable />
      </div>
    </>
  );
}

export default AdminManagement;
