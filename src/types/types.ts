export interface CreateLoanData {
  // companyId: string;
  // name: string;
  // shortName: string;
  // description: string;
  // interestRate: number;
  // minAmount: number;
  // maxAmount: number;
  // minTenor: number;
  // maxTenor: number;
  // moratorium: number;
  name: string;
  code: string;
  shortName: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenor: number;
  maxTenor: number;
  interestRate: number;
  penaltyOnDefaultPrincipal: number;
  moratorium: number;
  notifyApprovalsViaEmail: boolean;
  turnoverEligibilityPercent: number;
  interestComputationBasis: number;
  interestCostComputation: number;
  paymentScheduleBreakdown: number;
  paymentScheduleType: number;
}

export type DashboardMetric = {
  label: string;
  value: number;
  date: string;
};

export interface CompanyDashboardResponse {
  success: boolean;
  message: string;
  data: DashboardDataAnalytics;
}

export interface DashboardDataAnalytics {
  users: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    allTime: number;
  };
  loans: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    allTime: number;
  };
  analytics: {
    malePercentage: number;
    femalePercentage: number;
    totalUsers: number;
  };
  disbursements: {
    last7Days: DashboardMetric[];
    currentMonthDaily: DashboardMetric[];
    currentMonthWeekly: DashboardMetric[];
    currentYearMonthly: DashboardMetric[];
  };
  loanRequests: {
    last7Days: DashboardMetric[];
    currentMonthDaily: DashboardMetric[];
    currentMonthWeekly: DashboardMetric[];
    currentYearMonthly: DashboardMetric[];
  };
  financialMetrics: {
    totalDisbursed: number;
    totalRequested: number;
    averageRequestAmount: number;
    averageDisbursementAmount: number;
    outstandingBalance: number;
    totalRepaid: number;
    repaymentRate: number;
    defaultedLoans: number;
    defaultRate: number;
  };
  systemMetrics: {
    activeUsers: number;
    inactiveUsers: number;
    userActivityRate: number;
    pendingApprovals: number;
    approvedLoans: number;
    rejectedLoans: number;
    approvalRate: number;
    openSupportTickets: number;
    ticketResolutionRate: number;
  };
}

export interface AdminUserResponse {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  role: string;
}
