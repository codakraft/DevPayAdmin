import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logoImage from "../../../assets/logoIcon.png";
import dashboard from "../../../assets/dashboard.svg";
import feature from "../../../assets/feature.svg";
import userManagement from "../../../assets/userManagement.svg";
import adminManagement from "../../../assets/adminManagement.svg";
import adsManagement from "../../../assets/adsManagement.svg";
import analytics from "../../../assets/analytics.svg";
import communication from "../../../assets/communication.svg";
import systemsSetting from "../../../assets/systemSetting.svg";

// Define interface for dropdown menu items
interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

// Define dropdown content for each menu that has sub-items
const dropdownMenus: Record<string, SubMenuItem[]> = {
  features: [
    {
      id: "1",
      label: "Group & Communities",
      path: "/features/group-communities",
    },
    { id: "2", label: "Hub", path: "/features/hub" },
    { id: "3", label: "Forum", path: "/features/forum" },
  ],
  userManagement: [
    { id: "users", label: "All Users", path: "/user-management/all-users" },
    // {
    //   id: "flagged",
    //   label: "Flagged Users",
    //   path: "/user-management/flagged-users",
    // },
    // {
    //   id: "admin",
    //   label: "Admin Users",
    //   path: "/user-management/suspended-users",
    // },
  ],
  communication: [
    { id: "all-loan", label: "All Loans", path: "/loan" },
    {
      id: "unpaid-loan",
      label: "Unpaid Loans",
      // path: "/loan/unpaid-loan",
      path: "/loan/unpaid-loans",
    },
    {
      id: "ongoing",
      label: "Ongoing Collections Report",
      path: "/loan/ongoing-collections",
    },
  ],
};

const Sidebar: React.FC = () => {
  // Get current location for active link styling
  const location = useLocation();

  // State to track which dropdowns are open
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  // Function to toggle dropdown
  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownId]: !prev[dropdownId],
    }));
  };

  // Check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={logoImage} alt="Japaflex" className="logo" />
        {/* <h2 className="logo-text">deVpay</h2> */}
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          <li
            className={`nav-item ${isPathActive("/dashboard") ? "active" : ""}`}
          >
            <Link to="/dashboard" className="nav-item-main">
              <div className="icon-container">
                <img src={dashboard} alt="Dashboard" className="icon" />
              </div>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* <li
            className={`nav-item ${openDropdowns.features ? "expanded" : ""} ${
              isPathActive("/features") ? "active" : ""
            }`}
          >
            <div
              className="nav-item-main"
              onClick={() => toggleDropdown("features")}
            >
              <div className="icon-container">
                <img src={feature} alt="Features" className="icon" />
              </div>
              <span>Features</span>
              <span
                className={`chevron ${openDropdowns.features ? "open" : ""}`}
              >
                ›
              </span>
            </div>
            {openDropdowns.features && (
              <ul className="dropdown-menu">
                {dropdownMenus.features.map((item) => (
                  <li
                    key={item.id}
                    className={`dropdown-item ${
                      isPathActive(item.path) ? "active" : ""
                    }`}
                  >
                    <Link to={item.path}>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li> */}

          {/* <li
            className={`nav-item ${
              openDropdowns.userManagement ? "expanded" : ""
            } ${isPathActive("/user-management") ? "active" : ""}`}
          >
            <div
              className="nav-item-main"
              onClick={() => toggleDropdown("userManagement")}
            >
              <div className="icon-container">
                <img
                  src={userManagement}
                  alt="User Management"
                  className="icon"
                />
              </div>
              <span>User Management</span>
              <span
                className={`chevron ${
                  openDropdowns.userManagement ? "open" : ""
                }`}
              >
                ›
              </span>
            </div>
            {openDropdowns.userManagement && (
              <ul className="dropdown-menu">
                {dropdownMenus.userManagement.map((item) => (
                  <li
                    key={item.id}
                    className={`dropdown-item ${
                      isPathActive(item.path) ? "active" : ""
                    }`}
                  >
                    <Link to={item.path}>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li> */}

          <li
            className={`nav-item ${
              isPathActive("/admin-management") ? "active" : ""
            }`}
          >
            <Link to="/admin-management" className="nav-item-main">
              <div className="icon-container">
                <img
                  src={adminManagement}
                  alt="Admin Management"
                  className="icon"
                />
              </div>
              <span>Admin Management</span>
            </Link>
          </li>

          <li
            className={`nav-item ${
              isPathActive("/loan-management") ? "active" : ""
            }`}
          >
            <Link to="/loan-management" className="nav-item-main">
              <div className="icon-container">
                <img
                  src={adsManagement}
                  alt="ADS Management"
                  className="icon"
                />
              </div>
              <span>Loan Requests</span>
            </Link>
          </li>

          <li
            className={`nav-item ${
              isPathActive("/content-management") ? "active" : ""
            }`}
          >
            <Link to="/content-management" className="nav-item-main">
              <div className="icon-container">
                <img
                  src={dashboard}
                  alt="Content Management"
                  className="icon"
                />
              </div>
              <span>Loan Product Content</span>
            </Link>
          </li>

          <li
            className={`nav-item ${
              isPathActive("/audit-trail/index") ? "active" : ""
            }`}
          >
            <Link to="/audit-trail/index" className="nav-item-main">
              <div className="icon-container">
                <img src={analytics} alt="Analytics" className="icon" />
              </div>
              <span>Audit Trail</span>
            </Link>
          </li>

          <li
            className={`nav-item ${
              openDropdowns.communication ? "expanded" : ""
            } ${isPathActive("/loan") ? "active" : ""}`}
          >
            <div
              className="nav-item-main"
              onClick={() => toggleDropdown("communication")}
            >
              <div className="icon-container">
                <img src={communication} alt="Communication" className="icon" />
              </div>
              <span>Loans</span>
              <span
                className={`chevron ${
                  openDropdowns.communication ? "open" : ""
                }`}
              >
                ›
              </span>
            </div>
            {openDropdowns.communication && (
              <ul className="dropdown-menu">
                {dropdownMenus.communication.map((item) => (
                  <li
                    key={item.id}
                    className={`dropdown-item ${
                      isPathActive(item.path) ? "active" : ""
                    }`}
                  >
                    <Link to={item.path}>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li
            className={`nav-item ${
              isPathActive("/system-settings") ? "active" : ""
            }`}
          >
            <Link to="/system-settings" className="nav-item-main">
              <div className="icon-container">
                <img
                  src={systemsSetting}
                  alt="Systems Setting"
                  className="icon"
                />
              </div>
              <span>Systems Setting</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
