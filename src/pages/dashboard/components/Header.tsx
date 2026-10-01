import React from "react";
import "./Header.css";

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <header className="header">
      <div className="header-actions">
        <div className="notification">
          <span className="icon">🔔</span>
          <span className="badge">1</span>
        </div>

        <div className="messages">
          <span className="icon">💬</span>
          <span className="badge">3</span>
        </div>

        <div className="user-profile">
          <div className="avatar">{username.charAt(0)}</div>
          <span className="name">{username}</span>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
