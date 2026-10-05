import React from "react";
import "./Header.css";

interface HeaderProps {
  username: string;
  // Opens the sidebar on small screens
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onMenuClick }) => {
  return (
    <header className="header">
      <button
        type="button"
        className="menu-toggle"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="header-actions">
        <div className="user-profile">
          <div className="avatar">{username.charAt(0).toUpperCase()}</div>
          <span className="name">{username}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
