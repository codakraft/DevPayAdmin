import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../pages/dashboard/components/Sidebar";
import Header from "../pages/dashboard/components/Header";
import { useAuth } from "../context/AuthContext";
import useIdleTimeout from "../hooks/useIdleTimeout";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  // Sidebar drawer on small screens; always visible on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showWarning, secondsLeft, staySignedIn } = useIdleTimeout();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <main className="main-content">
        <Header
          username={user?.displayName || user?.email || "Admin"}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {showWarning && (
        <div className="session-timeout-backdrop" role="alertdialog">
          <div className="session-timeout-dialog">
            <h3>Are you still there?</h3>
            <p>
              For your security, you'll be signed out in{" "}
              <strong>{secondsLeft}s</strong> due to inactivity.
            </p>
            <button type="button" onClick={staySignedIn}>
              Stay signed in
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
