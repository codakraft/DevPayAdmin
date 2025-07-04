import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./UsersTable.css";

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

const users: User[] = [
  {
    id: 1,
    avatarBg: "#FF5252",
    initial: "J",
    fullName: "Jane Smith",
    email: "jane@japaflex.com",
    username: "jane20",
    dateOfBirth: "1990-03-06",
    gender: "Female",
    dateCreated: "2024-03-12",
  },
  {
    id: 2,
    avatarBg: "#4CAF50",
    initial: "C",
    fullName: "Cody Fisher",
    email: "cody@japaflex.com",
    username: "Codyfishpie",
    dateOfBirth: "1973-05-24",
    gender: "Male",
    dateCreated: "2024-03-12",
  },
  {
    id: 3,
    avatarBg: "#00BCD4",
    initial: "J",
    fullName: "Jane Cooper",
    email: "cooper@japaflex.com",
    username: "Coops12",
    dateOfBirth: "1994-10-12",
    gender: "Female",
    dateCreated: "2024-03-12",
  },
  {
    id: 4,
    avatarBg: "#9C27B0",
    initial: "K",
    fullName: "Kristin Watson",
    email: "kristinw@japaflex.com",
    username: "Krist3ne",
    dateOfBirth: "1996-08-14",
    gender: "Female",
    dateCreated: "2024-03-12",
  },
  {
    id: 5,
    avatarBg: "#673AB7",
    initial: "D",
    fullName: "Dianne Russell",
    email: "dianne@japaflex.com",
    username: "Theavenger",
    dateOfBirth: "1989-01-08",
    gender: "Female",
    dateCreated: "2024-03-12",
  },
  {
    id: 6,
    avatarBg: "#FFC107",
    initial: "D",
    fullName: "Darrell Steward",
    email: "darrellsteward@gmail.com",
    username: "Steward12",
    dateOfBirth: "1992-04-20",
    gender: "Male",
    dateCreated: "2024-03-12",
  },
  {
    id: 7,
    avatarBg: "#FF9800",
    initial: "M",
    fullName: "Michael Brown",
    email: "michael.brown@japaflex.com",
    username: "MikeBrown",
    dateOfBirth: "1988-07-15",
    gender: "Male",
    dateCreated: "2024-04-01",
  },
  {
    id: 8,
    avatarBg: "#795548",
    initial: "S",
    fullName: "Sarah Williams",
    email: "sarah.williams@japaflex.com",
    username: "SarahW",
    dateOfBirth: "1995-11-22",
    gender: "Female",
    dateCreated: "2024-04-05",
  },
];

const UsersTable: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Filter data based on search query, gender filter, and date filter
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      // Search filter - searches in name, email, username
      const searchMatch =
        searchQuery === "" ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());

      // Gender filter
      const genderMatch =
        genderFilter === "All" || user.gender === genderFilter;

      // Date filter
      const dateMatch = dateFilter === "" || user.dateCreated === dateFilter;

      return searchMatch && genderMatch && dateMatch;
    });
  }, [searchQuery, genderFilter, dateFilter]);

  const isAllSelected =
    selected.length === filteredData.length && filteredData.length > 0;

  const toggleAll = () => {
    setSelected(isAllSelected ? [] : filteredData.map((user) => user.id));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (userId: number) => {
    navigate(`/user-management/user-profile/${userId}`);
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Full Name",
      "Email",
      "Username",
      "Date of Birth",
      "Gender",
      "Date Created",
    ];

    // Convert data to CSV format
    const csvData = [
      headers.join(","), // Header row
      ...filteredData.map((row) =>
        [
          `"${row.fullName}"`,
          row.email,
          row.username,
          row.dateOfBirth,
          row.gender,
          row.dateCreated,
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
      `users-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="users-table-wrapper">
      {/* Search and Filter Controls */}
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          />

          <button
            onClick={exportToCSV}
            className="export-btn"
            title="Export to CSV"
          >
            Export CSV
          </button>

          {(searchQuery || genderFilter !== "All" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setGenderFilter("All");
                setDateFilter("");
              }}
              className="clear-filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
              />
            </th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Date Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} className="no-results">
                No users found matching your filters.
              </td>
            </tr>
          ) : (
            filteredData.map((user) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user.id)}
                style={{ cursor: "pointer" }}
              >
                <td
                  className="checkbox-column"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => toggleOne(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div
                      className="user-avatar"
                      style={{ backgroundColor: user.avatarBg }}
                    >
                      {user.initial}
                    </div>
                    <span>{user.fullName}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.gender}</td>
                <td>{user.dateCreated}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="more-options">⋮</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
