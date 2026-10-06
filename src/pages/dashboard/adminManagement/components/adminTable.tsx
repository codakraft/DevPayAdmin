import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import TablePagination from "../../../../components/TablePagination";
import { AdminUser, AdminUserQueryParams } from "../../../../types/types";
import {
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
} from "../../../../store/apiSlice";
import {
  formatDate,
  formatRoleName,
  formatUserRoles,
} from "../../../../helpers";
import useRoleOptions from "../useRoleOptions";
import useAdminUserActions, { userRoleNames } from "../useAdminUserActions";

const EXPORT_PAGE_SIZE = 100;

const AdminTable: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);

  const { roles } = useRoleOptions();
  const { assignableRoles, busyUserId, canManageUser, changeRole, setActive } =
    useAdminUserActions();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUser | null>(null);
  const [newRoleId, setNewRoleId] = useState("");

  // Close the row menu on any outside click
  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpenId]);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Go back to the first page whenever the filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, createdFrom, createdTo, pageSize]);

  const filters: AdminUserQueryParams = {
    Search: debouncedSearch || undefined,
    Role: roleFilter || undefined,
    CreatedFrom: createdFrom || undefined,
    // Include the whole "to" day
    CreatedTo: createdTo ? `${createdTo}T23:59:59` : undefined,
  };

  const { data, isFetching } = useGetAdminUserQuery({
    ...filters,
    Page: currentPage,
    PageSize: pageSize,
  });
  const [fetchAdminUsers] = useLazyGetAdminUserQuery();

  const users = data?.data?.users ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const hasFilters = Boolean(roleFilter || createdFrom || createdTo);

  const handleRowClick = (user: AdminUser) => {
    navigate(`/admin-management/admin-userProfile/${user.id}`, {
      state: { user },
    });
  };

  const openRoleDialog = (user: AdminUser) => {
    setMenuOpenId(null);
    setNewRoleId("");
    setRoleDialogUser(user);
  };

  const handleChangeRole = async () => {
    if (!roleDialogUser || !newRoleId) return;
    if (await changeRole(roleDialogUser, newRoleId)) setRoleDialogUser(null);
  };

  const handleToggleActive = (user: AdminUser) => {
    setMenuOpenId(null);
    setActive(user, !user.isActive);
  };

  const clearFilters = () => {
    setRoleFilter("");
    setCreatedFrom("");
    setCreatedTo("");
  };

  const escapeCsv = (value: string | null | undefined) =>
    `"${(value ?? "").replace(/"/g, '""')}"`;

  // Export every record matching the current filters, not just the visible page
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const allUsers: AdminUser[] = [];
      let page = 1;
      let hasNextPage = true;
      while (hasNextPage) {
        const response = await fetchAdminUsers({
          ...filters,
          Page: page,
          PageSize: EXPORT_PAGE_SIZE,
        }).unwrap();
        allUsers.push(...(response?.data?.users ?? []));
        hasNextPage = Boolean(response?.data?.hasNextPage);
        page += 1;
      }

      const headers = ["Full Name", "Email", "Role", "Date Created"];
      const csvData = [
        headers.join(","),
        ...allUsers.map((user) =>
          [
            escapeCsv(user.fullName),
            escapeCsv(user.email),
            escapeCsv(formatUserRoles(user)),
            escapeCsv(formatDate(user.createdAt)),
          ].join(",")
        ),
      ].join("\n");

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
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error?.data?.message || "Failed to export admin users");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="users-table-wrapper">
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="export-container">
          <button
            onClick={exportToCSV}
            className="export-btn"
            disabled={exporting || totalCount === 0}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="table-filters">
        <label className="filter-field">
          <span>Role</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {formatRoleName(role.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Created from</span>
          <input
            type="date"
            value={createdFrom}
            max={createdTo || undefined}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />
        </label>
        <label className="filter-field">
          <span>Created to</span>
          <input
            type="date"
            value={createdTo}
            min={createdFrom || undefined}
            onChange={(e) => setCreatedTo(e.target.value)}
          />
        </label>
        {hasFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Date Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {isFetching ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                No users found matching your search criteria.
              </td>
            </tr>
          ) : (
            users.map((user: AdminUser) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="user-info">
                    <span>{user.fullName}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  {formatUserRoles(user) || (
                    <span className="status-badge inactive">No role</span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td
                  className="row-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canManageUser(user) && (
                    <>
                      <button
                        type="button"
                        className="more-options"
                        aria-label="More options"
                        disabled={busyUserId === user.id}
                        onClick={(e) => {
                          e.nativeEvent.stopImmediatePropagation();
                          setMenuOpenId(
                            menuOpenId === user.id ? null : user.id
                          );
                        }}
                      >
                        {busyUserId === user.id ? "…" : "⋮"}
                      </button>
                      {menuOpenId === user.id && (
                        <div className="row-menu">
                          <button
                            type="button"
                            onClick={() => openRoleDialog(user)}
                          >
                            Change role
                          </button>
                          <button
                            type="button"
                            className={user.isActive ? "danger" : ""}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {roleDialogUser && (
        <div
          className="role-dialog-backdrop"
          onClick={() => !busyUserId && setRoleDialogUser(null)}
        >
          <div className="role-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Change role</h3>
            <p>
              {roleDialogUser.fullName} is currently{" "}
              <strong>{formatUserRoles(roleDialogUser)}</strong>.
            </p>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
            >
              <option value="">Select a new role</option>
              {assignableRoles
                .filter(
                  (role) => !userRoleNames(roleDialogUser).includes(role.name)
                )
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
            </select>
            <div className="role-dialog-actions">
              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => setRoleDialogUser(null)}
                disabled={!!busyUserId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={handleChangeRole}
                disabled={!newRoleId || !!busyUserId}
              >
                {busyUserId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TablePagination
        page={currentPage}
        pageSize={pageSize}
        total={totalCount}
        disabled={isFetching}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default AdminTable;
