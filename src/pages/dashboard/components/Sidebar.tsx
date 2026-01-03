import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logoImage from "../../../assets/logoIcon.png";
import dashboard from "../../../assets/dashboard.svg";
// import feature from "../../../assets/feature.svg";
// import userManagement from "../../../assets/userManagement.svg";
import adminManagement from "../../../assets/adminManagement.svg";
import adsManagement from "../../../assets/adsManagement.svg";
import analytics from "../../../assets/analytics.svg";
import communication from "../../../assets/communication.svg";
// import systemsSetting from "../../../assets/systemSetting.svg";
import { useLogoutMutation } from "../../../store/apiSlice";
import { useAuth } from "../../../context/AuthContext";

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
  disbursements: [
    { id: "disburse", label: "Disburse", path: "/disbursements/disburse" },
    {
      id: "all-disbursements",
      label: "All Disbursements",
      path: "/disbursements/all",
    },
  ],
};

const Sidebar: React.FC = () => {
  // Get current location for active link styling
  const location = useLocation();
  const navigate = useNavigate();

  // Get auth context and logout mutation
  const { logout: authLogout } = useAuth();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

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

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await logoutMutation().unwrap();
      console.log("Logout API call successful");
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage and redirect
      authLogout();
      navigate("/login");
    }
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

          <li className={`nav-item ${isPathActive("/wallet") ? "active" : ""}`}>
            <Link to="/wallet" className="nav-item-main">
              <div className="icon-container">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon"
                >
                  <path
                    d="M19 7H5C3.9 7 3 7.9 3 9V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.9 20.1 7 19 7ZM19 18H5V9H19V18ZM16 12C16 13.1 15.1 14 14 14C12.9 14 12 13.1 12 12C12 10.9 12.9 10 14 10C15.1 10 16 10.9 16 12Z"
                    fill="white"
                  />
                  <path
                    d="M7 6V4C7 2.9 7.9 2 9 2H15C16.1 2 17 2.9 17 4V6H19V4C19 1.8 17.2 0 15 0H9C6.8 0 5 1.8 5 4V6H7Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span>Wallet</span>
            </Link>
          </li>

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

          {/* Disbursements Menu */}
          <li
            className={`nav-item ${
              openDropdowns.disbursements ? "expanded" : ""
            } ${isPathActive("/disbursements") ? "active" : ""}`}
          >
            <div
              className="nav-item-main"
              onClick={() => toggleDropdown("disbursements")}
            >
              <div className="icon-container">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span>Disbursements</span>
              <span
                className={`chevron ${
                  openDropdowns.disbursements ? "open" : ""
                }`}
              >
                ›
              </span>
            </div>
            {openDropdowns.disbursements && (
              <ul className="dropdown-menu">
                {dropdownMenus.disbursements.map((item) => (
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

          {/* <li
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
          </li> */}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="logout-section">
        <button
          className="logout-btn"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <div className="icon-container">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
            >
              <path
                d="M16 17L21 12L16 7M21 12H9M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
