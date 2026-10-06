import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config/environment";
import { AdminUser, AdminUserQueryParams, AdminUserResponse, CompanyDashboardResponse, CreateLoanData, RoleOption, WalletResponse, FundWalletRequestData, FundWalletResponse, CompleteFundWalletRequestData, CompleteFundWalletResponse, WalletTransactionsResponse, WalletTransactionsRequest } from "../types/types";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTH_TOKEN_CHANGED_EVENT,
  ErrorCodes,
  clearStoredAuth,
  getErrorCode,
  setLoginNotice,
} from "../helpers/auth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// A 401 from these means bad credentials or a dead session, not an expired token
const NO_REFRESH_URLS = [
  "admin/login",
  "admin/verify-login",
  "admin/refresh",
  "admin/logout",
  "admin/forgot-password",
  "admin/reset-password",
];

// Saves a token pair from refresh or change-password and tells AuthContext
export const storeTokens = (data: any): boolean => {
  if (!data?.accessToken || !data?.refreshToken) return false;
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  // Refresh tokens are single-use: always keep the new one
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
  return true;
};

interface RefreshResult {
  ok: boolean;
  message?: string;
  networkError?: boolean;
}

const requestRefresh = async (): Promise<RefreshResult> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return { ok: false };
  const accessTokenBefore = localStorage.getItem(ACCESS_TOKEN_KEY);

  try {
    const response = await fetch(
      `${API_BASE_URL.replace(/\/?$/, "/")}admin/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );
    const body = await response.json().catch(() => null);
    const data = body?.data;
    if (response.ok && storeTokens(data)) {
      return { ok: true };
    }
    // Another tab may have spent the same refresh token first and stored new tokens
    const accessTokenNow = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessTokenNow && accessTokenNow !== accessTokenBefore) {
      return { ok: true };
    }
    return { ok: false, message: body?.message };
  } catch {
    return { ok: false, networkError: true };
  }
};

let refreshPromise: Promise<RefreshResult> | null = null;

// Concurrent callers share one refresh call, since a second one would fail
export const refreshSession = (): Promise<RefreshResult> => {
  refreshPromise ??= requestRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

const signOut = (notice: string) => {
  clearStoredAuth();
  setLoginNotice(notice);
  if (!["/login", "/login-otp"].includes(window.location.pathname)) {
    window.location.href = "/login";
  }
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const tokenUsed = localStorage.getItem(ACCESS_TOKEN_KEY);
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !NO_REFRESH_URLS.some((path) => url.startsWith(path))
  ) {
    // Another request or tab may already have refreshed while this one was in flight
    const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh =
      currentToken && currentToken !== tokenUsed
        ? { ok: true }
        : await refreshSession();

    if (refresh.ok) {
      result = await rawBaseQuery(args, api, extraOptions); // retry once
    } else if (!refresh.networkError) {
      signOut(
        (refresh as RefreshResult).message ||
          "Your session has expired. Please sign in again."
      );
    }
  }

  if (
    result.error?.status === 403 &&
    getErrorCode(result.error) === ErrorCodes.PasswordChangeRequired &&
    window.location.pathname !== "/change-password"
  ) {
    window.location.href = "/change-password";
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminUsers"],
  endpoints: (builder) => ({
        // Returns a fresh token pair in `data`; every older token is revoked
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
    getLoanProduct: builder.query<any, { page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: `company/loan-products`,
        method: "GET",
        params: params
          ? { Page: params.page, PageSize: params.pageSize }
          : undefined,
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
    getRoles: builder.query<{ success: boolean; message: string; data: RoleOption[] }, void>({
      query: () => ({
        url: `admin/roles`,
        method: "GET",
      }),
    }),
    assignRole: builder.mutation<any, { userId: string; roleId: string }>({
      query: (body) => ({
        url: `admin/role/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    removeRole: builder.mutation<any, { userId: string; roleId: string }>({
      query: (body) => ({
        url: `admin/role/remove`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    activateUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: `admin/users/${userId}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deactivateUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: `admin/users/${userId}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: ["AdminUsers"],
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
      invalidatesTags: ["AdminUsers"],
    }),
    getLoans: builder.query<any, { status?: number | number[]; page?: number; pageSize?: number }>({
      query: ({ status, page, pageSize }) => {
        const params = new URLSearchParams();
        // Status 0 (pending) is a valid filter, so check for undefined rather than falsy
        if (Array.isArray(status)) {
          status.forEach((s) => params.append("Status", String(s)));
        } else if (status !== undefined) {
          params.append("Status", String(status));
        }
        if (page !== undefined) params.append("Page", String(page));
        if (pageSize !== undefined) params.append("PageSize", String(pageSize));
        const query = params.toString();
        return {
          url: `company/loans${query ? `?${query}` : ""}`,
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
    getAdminUser: builder.query<AdminUserResponse, AdminUserQueryParams | void>({
      query: (params) => ({
        url: `company/users`,
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["AdminUsers"],
    }),
    // One user, same shape as an entry of company/users. 404 for other companies.
    getAdminUserById: builder.query<{ success: boolean; message: string; data: AdminUser }, string>({
      query: (userId) => ({
        url: `company/users/${userId}`,
        method: "GET",
      }),
      providesTags: ["AdminUsers"],
    }),
    // First and last name only; can't be used on yourself
    updateAdminUser: builder.mutation<any, { userId: string; firstName: string; lastName: string }>({
      query: ({ userId, ...body }) => ({
        url: `admin/users/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminUsers"],
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
    // Paged: `data` is { disbursements, totalCount, page, pageSize, totalPages, hasNextPage }.
    // pageSize is capped at 100 by the API.
    getDisbursements: builder.query<any, { page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: `loan/disbursements`,
        method: "GET",
        params: params || undefined,
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
    // Anonymous. Always 200, whether or not the email exists.
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: `admin/forgot-password`,
        method: "POST",
        body,
      }),
    }),
    // Anonymous. Returns no tokens; the user signs in again afterwards.
    resetPassword: builder.mutation<any, {
      email: string;
      otp: string;
      newPassword: string;
      confirmNewPassword: string;
    }>({
      query: (body) => ({
        url: `admin/reset-password`,
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: `admin/logout`,
        method: "POST",
      }),
    }),
    // Filter values and display labels, in display order (needs audit.view)
    getAuditCategories: builder.query<{ success: boolean; data: { value: string; label: string }[] }, void>({
      query: () => ({
        url: `Audit/categories`,
        method: "GET",
      }),
    }),
    // Paged: `data` is { logs, totalCount, page, pageSize, totalPages, hasNextPage }.
    // pageSize is capped at 100 by the API.
    getAuditTrail: builder.query<any, { page?: number; pageSize?: number; category?: string }>({
      query: ({ page = 1, pageSize = 50, category }) => ({
        url: `Audit`,
        method: "GET",
        params: { page, pageSize, ...(category ? { category } : {}) },
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
  useLazyGetAdminUserQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useLazyGetCompayLoansQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useGetCompanyWalletQuery,
  useFundWalletMutation,
  useCompleteFundWalletMutation,
  useGetWalletTransactionsQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLazyGetLoansByIDQuery,
  useDisburseLoanMutation,
  useLazyGetDisbursementsQuery,
  useLazyGetAuditTrailQuery,
  useGetAuditCategoriesQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useChangePasswordMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} = apiSlice;
