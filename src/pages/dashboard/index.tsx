import React, { useState, useMemo, useEffect } from "react";
import "./styles.css";
import StatCard from "./components/StatCard";
import AnalyticsChart from "./components/AnalyticsChart";
import UserAnalysisChart from "./components/UserAnalysisChart";
import {
  useGetDashboardQuery,
  useLazyGetCompanyDashboardQuery,
} from "../../store/apiSlice";
import { DashboardDataAnalytics } from "../../types/types";
import { useAuth } from "../../context/AuthContext";
import { Permissions } from "../../helpers/auth";

const formatCurrency = (value: number | string | undefined): string => {
  if (!value) return "₦0.00";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const Dashboard: React.FC = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<
    "month" | "year" | "custom"
  >("month");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const [dashboardData, setDashboardData] = useState<DashboardDataAnalytics>();

  const [getCompanyDashboard, { isLoading }] =
    useLazyGetCompanyDashboardQuery();
  const { can } = useAuth();
  const canViewDashboard = can(Permissions.CompanyView);

  // console.log("Dashboard loaded", dashboardData);

  const getDashboard = React.useCallback(async () => {
    try {
      let params: any = { id: "6f2e993b-26c9-4175-9021-cdf1106d8466" };
      if (activeTimeFilter === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }
      const response = await getCompanyDashboard().unwrap();
      setDashboardData(response.data);
      console.log("Dashboard data:", response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [getCompanyDashboard, activeTimeFilter, customStartDate, customEndDate]);

  useEffect(() => {
    // company/dashboard needs company.view; calling it without would just 403
    if (!canViewDashboard) return;
    if (activeTimeFilter === "custom" && (!customStartDate || !customEndDate))
      return;
    getDashboard();
  }, [
    canViewDashboard,
    getDashboard,
    activeTimeFilter,
    customStartDate,
    customEndDate,
  ]);

  // Define different stat values based on time filter
  const statsData = useMemo(() => {
    return {
      month: {
        activeUsers: dashboardData?.users?.thisMonth,
        totalLoanRequests: "₦8,902,000.98",
        loanRequestsChange: "-22%",
        totalDisbursedLoans: "₦12,000,984.98",
        disbursedLoansChange: "-22%",
        totalActiveLoans: "312",
      },
      year: {
        activeUsers: dashboardData?.users?.thisYear,
        totalLoanRequests: "₦112,500,000.00",
        loanRequestsChange: "+15%",
        totalDisbursedLoans: "₦300,000,000.00",
        disbursedLoansChange: "+8%",
        totalActiveLoans: "1,254",
      },
      custom: {
        activeUsers: "-",
        totalLoanRequests: "-",
        loanRequestsChange: "-",
        totalDisbursedLoans: "-",
        disbursedLoansChange: "-",
        totalActiveLoans: "-",
      },
    };
  }, [dashboardData, activeTimeFilter]);

  // Get current stats based on time filter
  const currentStats = statsData[activeTimeFilter];

  if (!canViewDashboard) {
    return (
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">
          Welcome. Use the menu to get to the areas you have access to.
        </p>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <div
          className="spinner"
          style={{
            width: 48,
            height: 48,
            border: "5px solid #eee",
            borderTop: "5px solid #3A7145",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Here is an overview of your dashboard</p>
        <div className="time-filter-header">
          <span>Viewing data for: </span>
          <button
            className={`filter-btn ${
              activeTimeFilter === "month" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("month")}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${
              activeTimeFilter === "year" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("year")}
          >
            This Year
          </button>
          <button
            className={`filter-btn ${
              activeTimeFilter === "custom" ? "active" : ""
            }`}
            onClick={() => setActiveTimeFilter("custom")}
          >
            Custom Range
          </button>
          {activeTimeFilter === "custom" && (
            <span style={{ marginLeft: 16 }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ marginRight: 8 }}
              />
              to
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </span>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Active Users"
          value={
            activeTimeFilter === "month"
              ? dashboardData?.users?.thisMonth.toString() || "0"
              : dashboardData?.users?.thisYear.toString() || "0"
          }
          change=""
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
        <StatCard
          title="Total Loan Requests"
          value={
            activeTimeFilter === "month"
              ? formatCurrency(
                  dashboardData?.financialMetrics?.averageRequestAmount,
                )
              : formatCurrency(dashboardData?.financialMetrics?.totalRequested)
          }
          change={currentStats.loanRequestsChange}
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
        <StatCard
          title="Loan Requests"
          value={formatCurrency(
            dashboardData?.financialMetrics?.totalRequested,
          )}
          change=""
          period="All time"
        />
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Disbursed Loans"
          value={
            activeTimeFilter === "month"
              ? formatCurrency(
                  dashboardData?.financialMetrics?.averageDisbursementAmount,
                )
              : formatCurrency(dashboardData?.financialMetrics?.totalDisbursed)
          }
          change={currentStats.disbursedLoansChange}
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
        <StatCard
          title="Total Disbursed Loans"
          value={formatCurrency(
            dashboardData?.financialMetrics?.totalDisbursed,
          )}
          change=""
          period="All time"
        />
        <StatCard
          title="Total Active Users"
          value={dashboardData?.systemMetrics?.activeUsers.toString() || "0"}
          change=""
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
      </div>

      <div className="charts-container">
        {activeTimeFilter !== "custom" && (
          <>
            <div className="analytics-section">
              <div className="section-header">
                <h2>Analytics</h2>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="color-indicator active"></div>
                    <span>Loan Disbursed</span>
                  </div>
                  <div className="legend-item">
                    <div className="color-indicator inactive"></div>
                    <span>Loan request</span>
                  </div>
                </div>
                <div className="time-filter">
                  <button
                    className={`filter-btn ${
                      activeTimeFilter === "month" ? "active" : ""
                    }`}
                    onClick={() => setActiveTimeFilter("month")}
                  >
                    Month
                  </button>
                  <button
                    className={`filter-btn ${
                      activeTimeFilter === "year" ? "active" : ""
                    }`}
                    onClick={() => setActiveTimeFilter("year")}
                  >
                    Year
                  </button>
                </div>
              </div>
              <AnalyticsChart
                timeFilter={activeTimeFilter as "month" | "year"}
                data={dashboardData}
              />
            </div>

            <div className="user-analysis-section">
              <h2>User Analysis</h2>
              <UserAnalysisChart
                timeFilter={activeTimeFilter as "month" | "year"}
                data={dashboardData?.analytics}
              />
            </div>
          </>
        )}
      </div>

      {/* <div className="users-section">
        <div className="section-header">
          <h2>Users</h2>
          <div className="actions">
            <button className="filter-action">
              <span>Filter</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H2L6.8 7.6V12.4L9.2 13.6V7.6L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <div className="time-filter">
              <button
                className={`filter-btn ${
                  activeTimeFilter === "week" ? "active" : ""
                }`}
                onClick={() => setActiveTimeFilter("week")}
              >
                Week
              </button>
              <button
                className={`filter-btn ${
                  activeTimeFilter === "year" ? "active" : ""
                }`}
                onClick={() => setActiveTimeFilter("year")}
              >
                Year
              </button>
            </div>
          </div>
        </div>
        <UsersTable />
      </div> */}
    </>
  );
};

export default Dashboard;
