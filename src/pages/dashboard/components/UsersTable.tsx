import React from "react";
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

const UsersTable: React.FC = () => {
  const navigate = useNavigate();

  const users: User[] = [
    {
      id: 1,
      avatarBg: "#FF5252",
      initial: "J",
      fullName: "Jane Smith",
      email: "jane@japaflex.com",
      username: "jane20",
      dateOfBirth: "06-03-1990",
      gender: "Male",
      dateCreated: "12-03-2024",
    },
    {
      id: 2,
      avatarBg: "#4CAF50",
      initial: "C",
      fullName: "Cody Fisher",
      email: "cody@japaflex.com",
      username: "Codyfishpie",
      dateOfBirth: "24-05-1973",
      gender: "Male",
      dateCreated: "12-03-2024",
    },
    {
      id: 3,
      avatarBg: "#00BCD4",
      initial: "J",
      fullName: "Jane Cooper",
      email: "cooper@japaflex.com",
      username: "Coops12",
      dateOfBirth: "12-10-1994",
      gender: "Female",
      dateCreated: "12-03-2024",
    },
    {
      id: 4,
      avatarBg: "#9C27B0",
      initial: "K",
      fullName: "Kristin Watson",
      email: "kristinw@japaflex.com",
      username: "Krist3ne",
      dateOfBirth: "14-08-1996",
      gender: "Male",
      dateCreated: "12-03-2024",
    },
    {
      id: 5,
      avatarBg: "#673AB7",
      initial: "D",
      fullName: "Dianne Russell",
      email: "dianne@japaflex.com",
      username: "Theavenger",
      dateOfBirth: "08-01-1989",
      gender: "Female",
      dateCreated: "12-03-2024",
    },
    {
      id: 6,
      avatarBg: "#FFC107",
      initial: "D",
      fullName: "Darrell Steward",
      email: "darrellsteward@gmail.com",
      username: "Steward12",
      dateOfBirth: "20-04-1992",
      gender: "Male",
      dateCreated: "12-03-2024",
    },
  ];

  const handleRowClick = (userId: number) => {
    navigate(`/user-management/user-profile/${userId}`);
  };

  return (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input type="checkbox" />
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
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user.id)}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
