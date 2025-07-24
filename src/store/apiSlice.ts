import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { parseQueryParams } from "../helpers";
import { AdminUserResponse, CompanyDashboardResponse, CreateLoanData } from "../types/types";

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
    // updateUserStatus: builder.mutation<any, { id: string; status: string }>({
    //   query: (params: { id: string; status: string }) => ({
    //     url: `users/${params.id}/status`,
    //     method: "PATCH",
    //     body: {
    //       status: params.status,
    //     },
    //   }),
    // }),
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
} = apiSlice;
