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

const Dashboard: React.FC = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<"month" | "year">(
    "month"
  );

  const [dashboardData, setDashboardData] = useState<DashboardDataAnalytics>();

  const [getCompanyDashboard, { isLoading }] =
    useLazyGetCompanyDashboardQuery();

  // console.log("Dashboard loaded", dashboardData);

  const getDashboard = React.useCallback(async () => {
    try {
      const response = await getCompanyDashboard({
        id: "6f2e993b-26c9-4175-9021-cdf1106d8466",
      }).unwrap();
      setDashboardData(response.data);
      console.log("Dashboard data:", response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [getCompanyDashboard]);

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

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
    };
  }, []);

  // Get current stats based on time filter
  const currentStats = statsData[activeTimeFilter];

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
              ? `₦${dashboardData?.financialMetrics?.averageRequestAmount.toString()}` ||
                "₦0.00"
              : `₦${dashboardData?.financialMetrics?.totalRequested.toString()}` ||
                "₦0.00"
          }
          change={currentStats.loanRequestsChange}
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
        <StatCard
          title="Loan Requests"
          value={
            `₦${dashboardData?.financialMetrics?.totalRequested.toString()}` ||
            "₦0.00"
          }
          change=""
          period="All time"
        />
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Disbursed Loans"
          value={
            activeTimeFilter === "month"
              ? `₦${dashboardData?.financialMetrics?.averageDisbursementAmount.toString()}` ||
                "₦0.00"
              : `₦${dashboardData?.financialMetrics?.totalDisbursed.toString()}` ||
                "₦0.00"
          }
          change={currentStats.disbursedLoansChange}
          period={activeTimeFilter === "month" ? "This month" : "This year"}
        />
        <StatCard
          title="Total Disbursed Loans"
          value={
            `₦${dashboardData?.financialMetrics?.totalDisbursed.toString()}` ||
            "₦0.00"
          }
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
          <AnalyticsChart timeFilter={activeTimeFilter} data={dashboardData} />
        </div>

        <div className="user-analysis-section">
          <h2>User Analysis</h2>
          <UserAnalysisChart
            timeFilter={activeTimeFilter}
            data={dashboardData?.analytics}
          />
        </div>
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
