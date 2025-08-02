import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { AdminUser } from "../../../../types/types";
import { useGetAdminUserQuery } from "../../../../store/apiSlice";

interface User {
  id: number;
  avatarBg: string;
  initial: string;
  fullName: string;
  email: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  dateCreated: string;
}

const AdminTable: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetAdminUserQuery();

  // Removed manual fetch logic for efficiency. Use RTK Query hook instead.

  console.log("AdminData:", data?.data.users);

  // Remove unused users variable

  const handleRowClick = (user: AdminUser) => {
    navigate(`/admin-management/admin-userProfile/${user.id}`, {
      state: { user },
    });
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const admins = data?.data?.users ?? [];
    return admins.filter(
      (user: AdminUser) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Full Name", "Email", "Role", "Gender", "Date Created"];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredUsers.map((user: AdminUser) =>
        [
          `"${user.fullName}"`, // Wrap in quotes to handle names with commas
          `"${user.email}"`,
          `"${user.role}"`,
          `"${user.gender}"`,
          `"${user.createdAt}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admin-users-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="users-table-wrapper">
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <div
            className="spinner"
            style={{
              width: 40,
              height: 40,
              border: "4px solid #eee",
              borderTop: "4px solid #3A7145",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>
            {`@keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }`}
          </style>
        </div>
      )}
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="export-container">
          <button onClick={exportToCSV} className="export-btn">
            Export CSV
          </button>
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input type="checkbox" />
            </th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            {/* <th>Gender</th> */}
            <th>Date Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers?.map((user: AdminUser) => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user)}
              style={{ cursor: "pointer" }}
            >
              <td
                className="checkbox-column"
                onClick={(e) => e.stopPropagation()}
              >
                <input type="checkbox" />
              </td>
              <td>
                <div className="user-info">
                  {/* <div
                    className="user-avatar"
                    style={{ backgroundColor: user.role }}
                  >
                    {user.firstName.charAt(0).toUpperCase()}
                  </div> */}
                  <span>{user.fullName}</span>
                </div>
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              {/* <td>{user.phoneNumber}</td> */}
              {/* <td>{user.gender}</td> */}
              <td>{user.createdAt}</td>
              {/* <td onClick={(e) => e.stopPropagation()}>
                <button className="more-options">⋮</button>
              </td> */}
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                No users found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
