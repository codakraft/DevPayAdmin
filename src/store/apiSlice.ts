import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AdminUserResponse, CompanyDashboardResponse, CreateLoanData, WalletResponse, FundWalletRequestData, FundWalletResponse, CompleteFundWalletRequestData, CompleteFundWalletResponse, WalletTransactionsResponse, WalletTransactionsRequest } from "../types/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/",
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
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: `admin/login`,
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
    getCompanyDashboard: builder.query<CompanyDashboardResponse, { id: string }>({
      query: ({ id }) => ({
        url: `support/companies/${id}/dashboard`,
        method: "GET",
      }),
    }),
    getLoanProduct: builder.query<any, { id: string }>({
      query: ({ id }) => ({
        url: `company/loan-products/${id}`,
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
    getLoans: builder.query<any, {status: number}>({
      query: ({status}) => ({
        url: `company/loans?Status=${status}`,
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
  }),
});

export const {
  useLoginMutation,
  useGetDashboardQuery,
  useLazyGetLoanProductQuery,
  useCreateLoanProductMutation,
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
} = apiSlice;
