// Storage keys for the admin session
export const ACCESS_TOKEN_KEY = "devpay_admin_token";
export const REFRESH_TOKEN_KEY = "devpay_admin_refresh_token";
export const USER_KEY = "devpay_admin_user";
// User returned by verify-login while a password change is still pending
export const PENDING_USER_KEY = "devpay_admin_pending_user";
const LOGIN_NOTICE_KEY = "devpay_admin_login_notice";

// Fired in this tab whenever the access token is replaced (e.g. after a refresh)
export const AUTH_TOKEN_CHANGED_EVENT = "devpay-auth-token-changed";

// Machine-readable `code` on API error bodies. Branch on these, not on `message`.
export const ErrorCodes = {
  PasswordChangeRequired: "PASSWORD_CHANGE_REQUIRED",
  AccountDeactivated: "ACCOUNT_DEACTIVATED",
  PermissionDenied: "PERMISSION_DENIED",
} as const;

export const getErrorCode = (error: any): string | undefined =>
  error?.data?.code;

export const Permissions = {
  LoansView: "loans.view",
  LoansManage: "loans.manage", // send offer letter, request document re-upload
  LoansApprove: "loans.approve", // approve / reject / process
  LoansDisburse: "loans.disburse",
  CollectionsManage: "collections.manage", // stop collection, reconcile
  ProductsView: "products.view",
  ProductsManage: "products.manage",
  CompanyView: "company.view",
  CompanyManage: "company.manage",
  UsersView: "users.view",
  UsersManage: "users.manage",
  FinanceView: "finance.view",
  FinanceManage: "finance.manage",
  AuditView: "audit.view",
  SupportView: "support.view",
  SupportManage: "support.manage",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Roles a company Admin is allowed to give to users
export const STAFF_ROLES = new Set([
  "LoanOfficer",
  "Underwriter",
  "CollectionsOfficer",
  "FinanceOfficer",
  "SupportAgent",
  "Auditor",
  "Viewer",
]);

export interface TokenClaims {
  userId?: string;
  roles: string[];
  permissions: string[];
  companyId?: string;
  passwordChangeRequired: boolean;
}

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v : typeof v === "string" ? [v] : [];

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  // Decode as UTF-8 so non-ASCII names survive
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const decodeToken = (token: string | null): TokenClaims | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1]));
    return {
      userId: payload.sub,
      roles: toArray(payload.role),
      permissions: toArray(payload.permission),
      companyId: payload.CompanyId,
      passwordChangeRequired: payload.pwd_change_required === "true",
    };
  } catch {
    return null;
  }
};

export const hasPermission = (claims: TokenClaims | null, permission: string) =>
  !!claims?.permissions.includes(permission);

export const isSuperAdmin = (claims: TokenClaims | null) =>
  !!claims?.roles.includes("SuperAdmin");

export const clearStoredAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PENDING_USER_KEY);
};

// One-off message shown on the login page after we sign the user out
export const setLoginNotice = (message: string) => {
  sessionStorage.setItem(LOGIN_NOTICE_KEY, message);
};

export const takeLoginNotice = (): string | null => {
  const message = sessionStorage.getItem(LOGIN_NOTICE_KEY);
  sessionStorage.removeItem(LOGIN_NOTICE_KEY);
  return message;
};

/**
 * Turns an RTK Query error into a message for the user.
 */
export const getErrorMessage = (error: any, fallback: string): string => {
  if (getErrorCode(error) === ErrorCodes.PermissionDenied) {
    return "You don't have permission to perform this action.";
  }
  const message = error?.data?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (error?.status === 403) {
    return "You don't have permission to perform this action.";
  }
  if (error?.status === 404) return "The requested record was not found.";
  return fallback;
};
