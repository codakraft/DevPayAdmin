import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/dashboard/components/Sidebar";
import Header from "../pages/dashboard/components/Header";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <Header username="Admin" />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
