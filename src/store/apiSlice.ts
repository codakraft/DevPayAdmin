import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config/environment";
import { AdminUserResponse, CompanyDashboardResponse, CreateLoanData, WalletResponse, FundWalletRequestData, FundWalletResponse, CompleteFundWalletRequestData, CompleteFundWalletResponse, WalletTransactionsResponse, WalletTransactionsRequest } from "../types/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("devpay_admin_token");
      console.log("[apiSlice] devpay_admin_token:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log("[apiSlice] Authorization header set:", headers.get("Authorization"));
      } else {
        console.log("[apiSlice] No token found, Authorization header not set.");
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
        changePassword: builder.mutation<any, {
          currentPassword: string;
          newPassword: string;
          confirmNewPassword: string;
        }>({
          query: (body) => ({
            url: `admin/change-password`,
            method: "POST",
            body,
          }),
        }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: `admin/login`,
        method: "POST",
        body,
      }),
    }),
    verifyLogin: builder.mutation<any, { sessionId: string; otp: string }>({
      query: (body) => ({
        url: `admin/verify-login`,
        method: "POST",
        body,
      }),
    }),
    getDashboard: builder.query<any, void>({
      query: () => ({
        url: `support/dashboard`,
        method: "GET",
      }),
    }),
    getCompanyDashboard: builder.query<CompanyDashboardResponse, void>({
      query: () => ({
        // url: `support/companies/${id}/dashboard`,
        url: `company/dashboard`,
        method: "GET",
      }),
    }),
    getLoanProduct: builder.query<any, void>({
      query: () => ({
        url: `company/loan-products`,
        method: "GET",
      }),
    }),
    createLoanProduct: builder.mutation<any, CreateLoanData>({
      query: (body) => ({
        url: `company/product/create`,
        method: "POST",
        body,
      }),
    }),
    updateLoanProduct: builder.mutation<any, CreateLoanData & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `company/loan-product/${id}`,
        method: "PUT",
        body,
      }),
    }),
    getRoles: builder.query<string[], void>({
      query: () => ({
        url: `admin/roles`,
        method: "GET",
      }),
    }),
    createUser: builder.mutation<any, {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      phoneNumber?: string;
    }>({
      query: (body) => ({
        url: `company/users/create`,
        method: "POST",
        body,
      }),
    }),
    getLoans: builder.query<any, {status?: number | number[]}>({
      query: ({status}) => {
        const statusParam = Array.isArray(status) 
          ? status.map(s => `Status=${s}`).join('&')
          : status ? `Status=${status}` : '';
        return {
          url: `company/loans${statusParam ? `?${statusParam}` : ''}`,
          method: "GET",
        };
      },
    }),
    getLoansByID: builder.query<any, {id: string}>({
      query: ({id}) => ({
        url: `company/loans/${id}`,
        method: "GET",
      }),
    }),
    getCompayLoans: builder.query<any, {status: number}>({
      query: ({status}) => ({
        url: `support/loans/status/${status}`,
        method: "GET",
      }),
    }),
    getAdminUser: builder.query<AdminUserResponse, void>({
      query: () => ({
        url: `company/users`,
        method: "GET",
      }),
    }),
    approveLoan: builder.mutation<any, { reason: string; id: string; }>({
      query: ({ reason, id }) => ({
        url: `loan/${id}/approve`,
        method: "POST",
        body: {
          reason: reason,
        },
      }),
    }),
    rejectLoan: builder.mutation<any, { reason: string; id: string; }>({
      query: ({ reason, id }) => ({
        url: `loan/${id}/reject`,
        method: "POST",
        body: {
          reason: reason,
        },
      }),
    }),
    disburseLoan: builder.mutation<any, { id: string; }>({
      query: ({ id }) => ({
        url: `loan/${id}/disburse`,
        method: "POST",
      }),
    }),
    getDisbursements: builder.query<any, void>({
      query: () => ({
        url: `loan/disbursements`,
        method: "GET",
      }),
    }),
    getCompanyWallet: builder.query<WalletResponse, void>({
      query: () => ({
        url: `wallet/my-company`,
        method: "GET",
      }),
    }),
    fundWallet: builder.mutation<FundWalletResponse, FundWalletRequestData>({
      query: (body) => ({
        url: `wallet/fund`,
        method: "POST",
        body,
      }),
    }),
    completeFundWallet: builder.mutation<CompleteFundWalletResponse, CompleteFundWalletRequestData>({
      query: (body) => ({
        url: `wallet/fund/complete`,
        method: "POST",
        body,
      }),
    }),
    getWalletTransactions: builder.query<WalletTransactionsResponse, WalletTransactionsRequest>({
      query: ({ walletId, page = 1, pageSize = 20 }) => ({
        url: `wallet/${walletId}/transactions?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: `admin/logout`,
        method: "POST",
      }),
    }),
    getAuditTrail: builder.query<any, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 50 }) => ({
        url: `Audit?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyLoginMutation,
  useGetDashboardQuery,
  useLazyGetLoanProductQuery,
  useCreateLoanProductMutation,
  useUpdateLoanProductMutation,
  useLazyGetLoansQuery,
  useLazyGetCompanyDashboardQuery,
  useGetAdminUserQuery,
  useLazyGetCompayLoansQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useGetCompanyWalletQuery,
  useFundWalletMutation,
  useCompleteFundWalletMutation,
  useGetWalletTransactionsQuery,
  useLogoutMutation,
  useLazyGetLoansByIDQuery,
  useDisburseLoanMutation,
  useLazyGetDisbursementsQuery,
  useLazyGetAuditTrailQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useChangePasswordMutation,
} = apiSlice;
