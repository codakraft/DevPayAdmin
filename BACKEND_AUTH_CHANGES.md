# Backend auth changes: what DevPayAdmin needs to do

The API (DevPayAPI) has changed how roles, permissions and sessions work. This
document lists everything the admin frontend must change, in priority order.
Items marked **Breaking** stop the app from working correctly until they are done.

---

## TL;DR checklist

> **Frontend status (2026-10-01):** all items implemented on branch `feat/old_link`,
> including the backend's follow-up changes (error codes, change-password tokens,
> role permissions, multiple roles, wallet permissions, password rule). Not yet tested
> against a deployed backend. See [Frontend status](#frontend-status) at the end.

- [x] **Breaking:** Store the `refreshToken` from `verify-login` and refresh on 401 (§1)
- [x] **Breaking:** Everyone must log in again after the backend deploy (§1.4)
- [x] **Breaking:** After change-password, refresh the token or log in again (§2)
- [x] Read roles and permissions from the JWT and gate menus, pages and buttons (§3)
- [x] Handle the new `403` / `404` / `409` responses (§4)
- [x] Role dropdown on Create User: show staff roles only (§5)
- [x] Add remove-role and activate/deactivate user actions (§6)
- [x] Replace the fake "Create Role" page (`rolePer.tsx`) (§7)
- [x] Clean-ups: fix `getRoles` typing, stop logging tokens (§8)

---

## 1. Refresh tokens are now required (Breaking)

### Why
Access tokens can now be **invalidated before they expire**. That happens when:

- a role is assigned to or removed from the user
- the user is deactivated
- the user changes their password

The next request with the old token gets **`401 Unauthorized`**. The client is
expected to call `refresh`, which returns a new token with the user's current roles
and permissions. If refresh also fails, the user must log in again.

Today `AuthContext.tsx` keeps only `accessToken`, and `apiSlice.ts` has no 401
handling. So any role change would log people out with no explanation.

### 1.1 Store the refresh token at login
`POST admin/verify-login` already returns it:

```json
{
  "success": true,
  "data": {
    "accessToken": "…",
    "refreshToken": "…",
    "tokenType": "Bearer",
    "accessTokenExpiry": "2026-10-01T12:00:00Z",
    "refreshTokenExpiry": "2026-10-08T12:00:00Z",
    "requiresPasswordChange": false,
    "user": { "id": "…", "firstName": "…", "lastName": "…", "email": "…", "phoneNumber": "…", "companyId": "…" }
  }
}
```

Save `refreshToken`, for example as `devpay_admin_refresh_token` next to
`devpay_admin_token`. Clear it everywhere the access token is cleared (logout,
login failure, the `storage` listener in `AuthContext.tsx`).

### 1.2 Refresh endpoint
```
POST admin/refresh            (no Authorization header needed)
{ "refreshToken": "…" }

200 → { "success": true, "data": { "accessToken", "refreshToken", "tokenType", "accessTokenExpiry", "refreshTokenExpiry" } }
400/403 → refresh token invalid, revoked, or user deactivated → log out
```

**Refresh tokens are single-use.** Each refresh returns a new `refreshToken` and
revokes the old one, so always store the new one.

### 1.3 Wrap `fetchBaseQuery` with re-auth
In `src/store/apiSlice.ts`, replace `baseQuery: fetchBaseQuery({...})` with a
wrapper that refreshes once on 401 and retries the request. Make concurrent 401s
share a single refresh call. Because tokens are single-use, two parallel
refreshes would make one of them fail.

```ts
import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const ACCESS_KEY = "devpay_admin_token";
const REFRESH_KEY = "devpay_admin_refresh_token";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

let refreshPromise: Promise<boolean> | null = null;

const refreshTokens = async (api: any, extraOptions: any): Promise<boolean> => {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  const result: any = await rawBaseQuery(
    { url: "admin/refresh", method: "POST", body: { refreshToken } },
    api,
    extraOptions
  );
  const data = result.data?.data;
  if (data?.accessToken && data?.refreshToken) {
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return true;
  }
  return false;
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    const tokenUsed = localStorage.getItem(ACCESS_KEY);
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      // Another tab may already have refreshed (tokens live in shared localStorage).
      // If so, just retry with the new token instead of spending the rotated refresh token.
      const alreadyRefreshed = localStorage.getItem(ACCESS_KEY) !== tokenUsed;

      refreshPromise ??= (alreadyRefreshed ? Promise.resolve(true) : refreshTokens(api, extraOptions))
        .finally(() => { refreshPromise = null; });
      const refreshed = await refreshPromise;

      if (refreshed) {
        result = await rawBaseQuery(args, api, extraOptions); // retry once with the new token
      } else {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem("devpay_admin_user");
        window.location.href = "/login"; // or dispatch your logout action
      }
    }
    return result;
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({ /* unchanged */ }),
});
```

After a successful refresh, also update whatever `AuthContext` derives from the
token (roles and permissions, §3). Two ways to do it: dispatch an event and
re-decode the token, or decode the token on demand rather than caching it in state.

### 1.4 Everyone is logged out once, at deploy
Tokens issued before the backend deploy lack the new claims and are rejected with
`401`. Users have no stored refresh token yet, so they will be sent to the
login page. This happens once. Make sure the login page handles it cleanly
instead of showing an error loop.

---

## 2. Forced password change (Breaking)

Users created with `company/users/create` have `requiresPasswordChange: true`.

- `verify-login` still returns tokens plus `requiresPasswordChange: true`. The current
  redirect in `loginOtpPage.tsx` is correct; keep it.
- **While the flag is set, every endpoint except `admin/change-password`,
  `admin/logout` and `admin/refresh` returns `403`** with
  `"You must change your password before continuing"` and `"code": "PASSWORD_CHANGE_REQUIRED"`.
  Don't load dashboard data before the password is changed. **Detect this by `code`,
  not by message text**, and send the user to the change-password page.
- **`admin/change-password` now returns a fresh token pair** and signs out every other
  session (all existing access and refresh tokens are revoked):

  ```json
  { "success": true, "message": "Password changed successfully",
    "data": { "accessToken": "…", "refreshToken": "…", "tokenType": "Bearer",
              "accessTokenExpiry": "…", "refreshTokenExpiry": "…" } }
  ```

  Store both tokens from this response and continue into the app. The new token no
  longer carries the password-change restriction. **Do not call `admin/refresh` with
  the old refresh token: it has been revoked.** (Logging the user out and asking them
  to sign in again also works.)

---

## 3. Use roles and permissions from the JWT

The API now authorizes by **permission**, not by role name. The access token
(JWT) carries both. Neither is returned in the `user` object, so decode the token.

### 3.1 Token claims

| Claim | Example | Notes |
|---|---|---|
| `sub` | user id | |
| `email`, `FirstName`, `LastName` | | |
| `CompanyId` | `"3f2a…"` | absent for SuperAdmin |
| `role` | `"Admin"` **or** `["Admin","Auditor"]` | string if one, array if several |
| `permission` | `"loans.view"` **or** `["loans.view","loans.approve"]` | string if one, array if several |
| `pwd_change_required` | `"true"` | only present while a password change is pending |
| `sstamp` | | internal; ignore |

### 3.2 Decode helper (no dependency needed)
```ts
// src/helpers/auth.ts
export interface TokenClaims {
  roles: string[];
  permissions: string[];
  companyId?: string;
  passwordChangeRequired: boolean;
}

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v : typeof v === "string" ? [v] : [];

export const decodeToken = (token: string | null): TokenClaims | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return {
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
```

Expose `roles`, `permissions` and a `can(permission)` function from `AuthContext`,
and re-derive them whenever the token changes (login or refresh).

This is for **UI only**: hiding menu items and buttons. The API enforces every rule
regardless, so a hidden button is a convenience, not security.

### 3.3 Permission list
```ts
export const Permissions = {
  LoansView: "loans.view",
  LoansManage: "loans.manage",       // send offer letter, request document re-upload
  LoansApprove: "loans.approve",     // approve / reject / process
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
```

### 3.4 What each role gets

| Role | Permissions |
|---|---|
| SuperAdmin, Admin | all of the above |
| LoanOfficer | loans.view, loans.manage, products.view, company.view |
| Underwriter | loans.view, loans.manage, loans.approve, products.view, company.view |
| CollectionsOfficer | loans.view, collections.manage, finance.view, company.view |
| FinanceOfficer | loans.view, loans.disburse, finance.view, finance.manage, company.view |
| SupportAgent | support.view, support.manage, loans.view |
| Auditor | loans.view, products.view, company.view, users.view, finance.view, audit.view |
| Viewer | loans.view, products.view, company.view |

This mapping can change on the backend. Always check **permissions**, never role
names, so the frontend doesn't need updating when it does.

### 3.5 Endpoints this app calls → permission required

| Endpoint (apiSlice) | Permission | Hide / disable |
|---|---|---|
| `support/dashboard`, `support/loans/status/{s}`, `support/companies/{id}/dashboard` | `support.view` | support dashboard widgets. **Now limited to the user's own company** (previously platform-wide) |
| `company/dashboard` | `company.view` | dashboard |
| `company/loan-products` | `products.view` | loan products page |
| `company/product/create`, `PUT company/loan-product/{id}` | `products.manage` | create/edit product buttons |
| `company/loans`, `company/loans/{id}` | `loans.view` | loan request pages |
| `POST loan/{id}/approve`, `POST loan/{id}/reject` | `loans.approve` | approve / reject buttons |
| `POST loan/{id}/disburse` | `loans.disburse` | disburse button |
| `loan/disbursements` | `loans.view` | disbursements list |
| `company/users` | `users.view` | admin management list |
| `admin/roles` | `users.view` | role dropdown |
| `company/users/create` | `users.manage` | create user page/button |
| `Audit` | `audit.view` | audit log page |
| `wallet/my-company`, `wallet/{id}/transactions` | `finance.view` | wallet page |
| `wallet/fund`, `wallet/fund/complete` | `finance.manage` | fund wallet button |
| `admin/logout`, `admin/change-password` | any signed-in user | |

Suggested behaviour:
- **Sidebar/menu:** hide sections the user has no permission for.
- **Routes:** add a `RequirePermission` wrapper in `App.tsx` so a typed URL shows a
  "You don't have access" page instead of a broken screen.
- **Dashboard:** `company/dashboard` and `support/dashboard` need different
  permissions. Only call the ones the user has, otherwise a Viewer gets a 403 on load.
- **Actions:** hide or disable approve, reject, disburse, create and edit buttons
  based on the permission.

---

## 4. New and changed error responses

All errors use the usual shape: `{ "success": false, "message": "…", "code": "…" }`.
`code` is machine-readable and stable; **branch on `code`, not on `message`**. It is
omitted on errors that don't have one.

| Status | `code` | When | What to do |
|---|---|---|---|
| `401` | (no body) | token expired **or invalidated** (role change, deactivation, password change) | refresh and retry once (§1) |
| `403` | `PASSWORD_CHANGE_REQUIRED` | password change pending | redirect to change-password |
| `403` | `ACCOUNT_DEACTIVATED` | login, verify-login or refresh by a deactivated user | show the message on the login page; clear tokens |
| `403` | `PERMISSION_DENIED` | missing permission or role | show "You don't have permission"; don't retry |
| `403` | (none) | another company's data, or a rule like "cannot change your own roles" | show the message |
| `404` `"Loan not found"` | loan belongs to another company | treat like not found |
| `409` | user already has the role / email already exists / user already active or deactivated | show the message |

403s for a missing permission now have a JSON body with `code: "PERMISSION_DENIED"`
(they used to be empty). 401s still have no body.

---

## 5. Create User: role dropdown

`createAdmin.tsx` fills its dropdown from `admin/roles`, which returns **every**
role including `SuperAdmin` and `Admin`. A company Admin can only create users with
these roles; anything else returns `400`:

```
LoanOfficer, Underwriter, CollectionsOfficer, FinanceOfficer, SupportAgent, Auditor, Viewer
```

Filter the list in `useRoleOptions.ts`:

```ts
const STAFF_ROLES = new Set([
  "LoanOfficer", "Underwriter", "CollectionsOfficer", "FinanceOfficer",
  "SupportAgent", "Auditor", "Viewer",
]);
// SuperAdmin may see everything; everyone else gets staff roles only
return roles.filter((r) => isSuperAdmin(claims) || STAFF_ROLES.has(r.name));
```

`FinanceOfficer` is a new role and will appear in the list automatically.

`admin/roles` now also returns each role's permissions:
`[{ "id": "…", "name": "Underwriter", "permissions": ["company.view", "loans.approve", …] }]`.

---

## 6. New user-management endpoints

All of these require `users.manage` and use the role **id** from `admin/roles`:

```
POST admin/role/assign             { "userId": "…", "roleId": "…" }   → { userId, role }
POST admin/role/remove             { "userId": "…", "roleId": "…" }   → { userId, role }
POST admin/users/{userId}/deactivate                                 → { userId, isActive: false }
POST admin/users/{userId}/activate                                   → { userId, isActive: true }
```

- `role/assign` used to return Identity's raw result object. It now returns `{ userId, role }`.
- `company/users` now returns `roles: [{ id, name }]` on each user (all of their roles).
  `role` (first role name) is still there for compatibility; prefer `roles`. Use the
  ids from `roles` directly for `role/remove` instead of looking them up by name.
  A user can hold several roles: "Change role" = `role/assign` the new one, then
  `role/remove` the old one(s).
- A company Admin can only manage **non-admin users in their own company**, only
  with staff roles, and **never themselves**. Other cases return `403` with a message.
  Hide these actions on the current user's own row and on Admin rows.
- Deactivating signs the user out everywhere almost immediately (within about 30 seconds).

Suggested UI on the admin management table (`adminTable.tsx`): a row menu with
"Change role", "Deactivate" / "Activate", and a status badge from `isActive`.

---

## 7. Replace the "Create Role" page (`rolePer.tsx`)

The backend has **no API to create roles or edit permissions**: roles and their
permissions are fixed in backend code. The current form (`businessOperation`,
`auditAccess`, `createAdmin`, …) doesn't map to anything and never saves.

Recommended: turn `/admin-management/roles-permissions` into a **read-only matrix**
built from `GET admin/roles` (which now includes each role's `permissions`), or remove the page. If editable roles are needed later, that
needs a new backend API first; raise it with the backend team.

---

## 8. Small clean-ups

- `getRoles` in `apiSlice.ts` is typed `builder.query<string[], void>`, but the endpoint
  returns `{ success, message, data: { id: string; name: string; permissions: string[] }[] }`. Fix the type.
  `useRoleOptions.ts` already copes with it at runtime.
- `apiSlice.ts` `prepareHeaders` logs the access token to the console on every
  request. Remove those `console.log` calls, especially now that tokens carry
  permissions.

---

## Testing checklist

1. Log in as **Admin**: everything works as before.
2. Create a **Viewer** with `company/users/create`, then log in as them:
   - forced to change password; other pages blocked until done
   - after changing it, lands in the app without an error, using the tokens returned by change-password
   - can see loans but not approve, disburse, users, audit or wallet
3. As Admin, assign **Underwriter** to that user while they are logged in. Their next
   request refreshes silently and the approve button appears.
4. As Admin, **deactivate** the user. Within about 30 seconds they are sent to login and see
   the "Account is deactivated" message on the next attempt.
5. Leave the app open past the access token expiry. Requests keep working via refresh.
6. Trigger several parallel requests that all get 401 (e.g. a dashboard load after a
   role change). Only one `admin/refresh` call is made and all requests recover.
7. With two tabs open, trigger a 401 in both. Both recover without being logged out.

---

## Frontend status

**Updated 2026-10-01 by the DevPayAdmin frontend.** Everything above is implemented
but not yet released. It has **not** been tested end to end, because the new
endpoints aren't deployed to staging yet (see challenge 1).

### What was done

| § | Status | Where | Notes |
|---|---|---|---|
| 1.1 | Done | `context/AuthContext.tsx` | `refreshToken` saved as `devpay_admin_refresh_token`. Cleared on logout, login failure and by the cross-tab `storage` listener. |
| 1.2–1.3 | Done | `store/apiSlice.ts` | `baseQueryWithReauth`: on 401, refresh once and retry. Concurrent 401s share one refresh call. If another tab already rotated the token, we reuse it instead of spending the refresh token. If refresh fails, we sign out and redirect to login. A network error during refresh does **not** sign the user out. 401s from `login`, `verify-login`, `refresh` and `logout` never trigger a refresh. |
| 1.3 (after refresh) | Done | `AuthContext.tsx` | After a refresh, the API layer fires a `devpay-auth-token-changed` event. `AuthContext` re-decodes the token, so menus and buttons update without a reload. |
| 1.4 | Done | `apiSlice.ts`, `loginPage.tsx` | A pre-deploy token with no refresh token causes a sign-out and the login page shows "Your session has expired. Please sign in again." The app doesn't redirect while it's already on `/login`, so there's no redirect loop. |
| 2 | Done (updated after backend response 3) | `changePasswordPage.tsx`, `AuthContext.tsx`, `ProtectedRoute.tsx`, `apiSlice.ts` | When `requiresPasswordChange` is set, we keep the tokens but don't let the user into the app. After `change-password` succeeds, we store the token pair it returns and send the user to the dashboard. We don't call `admin/refresh`. If the response has no token pair, we fall back to login with "Password changed. Please sign in." A 403 with `code: PASSWORD_CHANGE_REQUIRED` redirects to `/change-password`, and so does a token with `pwd_change_required`. |
| 3 | Done | `helpers/auth.ts`, `AuthContext.tsx` | `decodeToken`, `Permissions`, `hasPermission` and `isSuperAdmin` as specified. `useAuth()` now exposes `roles`, `permissions`, `can()`, `hasRole()` and `isSuperAdmin`. |
| 3.5 | Done | `App.tsx`, `components/RequirePermission.tsx`, `Sidebar.tsx`, pages | Routes are wrapped in `RequirePermission`, so a typed URL shows a "You don't have access to this page" screen. Sidebar entries are hidden by permission. Wallet needs `finance.view`, and Fund Wallet needs `finance.manage`. `company/dashboard` is called only with `company.view`; otherwise the dashboard shows a welcome message. These are hidden without the permission: Approve/Reject (`loans.approve`), Disburse (`loans.disburse`), Create/Edit/Disable product (`products.manage`), Create Admin (`users.manage`). |
| 4 | Done | `helpers/auth.ts` (`getErrorMessage`, `getErrorCode`) | Branches on `code`. `PERMISSION_DENIED` shows "You don't have permission to perform this action." Other errors show the backend `message`. 403s are never retried. |
| 5 | Done | `adminManagement/useRoleOptions.ts` | Create Admin and Change role show only staff roles, unless the user is a SuperAdmin. The Role *filter* on the admin table still lists every role. |
| 6 | Done | `adminTable.tsx`, `apiSlice.ts` | New Status column (`isActive`). New row menu with **Change role** (assigns the new role, then removes every old role using ids from `roles`) and **Deactivate** / **Activate**. The menu is hidden on the current user's own row, and on users holding any non-staff role unless the current user is a SuperAdmin. The table refetches after each action. All of a user's roles are shown. |
| 7 | Done | `adminManagement/rolePer.tsx` | Now a read-only "Roles & Permissions" page rendered from `GET admin/roles` (each role's `permissions`). The "Create Roles" button is renamed "Roles & Permissions". Visible to **SuperAdmin only** (button and route). |
| 8 | Done | `apiSlice.ts`, `types/types.ts`, `AuthContext.tsx` | `getRoles` is typed `{ success, message, data: { id, name, permissions }[] }`. Removed the token `console.log`s from `prepareHeaders` and the verify-login response log. |

### How it was tested

- TypeScript (`tsc --noEmit`) and the production build pass.
- The real `apiSlice` was run against a mocked backend in 16 scenarios, all passing:
  - silent refresh and retry (test 5)
  - 4 parallel 401s → exactly 1 `admin/refresh` call, and all 4 requests recover (test 6)
  - two tabs racing for the same refresh token → the losing tab recovers instead of signing out (test 7)
  - pre-deploy token without a refresh token → clean sign-out with a notice (§1.4)
  - deactivated user → sign-out showing the backend's message
  - no redirect loop while on `/login`
  - a login 401 doesn't trigger a refresh
  - the password-change 403 is detected by `code` (even when the message is reworded) and redirects
  - a `PERMISSION_DENIED` 403 shows a friendly message and isn't retried
  - the token pair from change-password is stored, and an incomplete pair is rejected
- The JWT decoder was checked with string and array `role`/`permission` claims.
- **Not yet done:** the manual testing checklist above (tests 1–4) against a real backend.

### Challenges and questions for the backend

1. **Staging doesn't have the new endpoints yet.** As of 2026-10-01, the staging Swagger
   (`/swagger/v1/swagger.json`) has `admin/refresh` and `admin/role/assign`, but **not**
   `admin/role/remove`, `admin/users/{userId}/activate` or `admin/users/{userId}/deactivate`.
   Also, `RoleAssignDto` is shown with no properties. Please deploy the new endpoints and
   document the request bodies so we can run the testing checklist.
2. **Matching the password-change 403 on its message text is fragile.** We detect the forced
   password change by comparing the message to `"You must change your password before continuing"`,
   and we show the deactivated message as-is. Could errors include a machine-readable
   code, e.g. `{ "code": "PASSWORD_CHANGE_REQUIRED" }` / `"ACCOUNT_DEACTIVATED"`? If that
   message text changes, users would get stuck on 403s instead of being redirected.
3. **Does the refresh token survive a password change?** Option A in §2 assumes the refresh token
   from `verify-login` still works right after `change-password` changes the security
   stamp. If it's revoked, users still get in, but they have to sign in again. Please confirm.
4. **The Roles & Permissions page is a hard-coded copy of §3.4.** As §3.4 says, the mapping can
   change on the backend, and this page would then be wrong. Could `GET admin/roles` return
   each role's permissions (e.g. `{ id, name, permissions: [] }`)? We'd then render the page from it.
5. **`company/users` returns a single `role` string and no role ids.** "Change role" looks up the
   old role's id by name from `admin/roles`, and assumes each user has one role. If users
   can have several roles, please return `roles: [{ id, name }]` on each user.
6. **Wallet is still role-based** (`Admin`/`SuperAdmin`). Tell us the permission name when
   `wallet/*` is migrated, and we'll switch the check.
7. **Password rules differ.** The frontend now requires at least 8 characters, including a letter,
   a number and a special character, for new admins. Swagger only shows `minLength: 8` for
   `company/users/create`. Please enforce the same rule on the backend, or tell us the exact rule.

### Backend responses (2026-10-01)

1. **Staging is missing the new endpoints.** Correct: all of this work is still local
   on the backend and hasn't been merged or deployed yet. We'll deploy it to staging
   and post here when it's live. `RoleAssignDto` showing no properties was a real
   bug: it used fields, which the API's JSON serializer ignores. It's fixed, and Swagger
   will show the body once deployed:
   `{ "userId": "string", "roleId": "string" }`. The same body is used by `role/remove`.
   `users/{userId}/activate` and `users/{userId}/deactivate` take no body.

2. **Machine-readable codes: done.** Errors now include `code` (§4):
   `PASSWORD_CHANGE_REQUIRED`, `ACCOUNT_DEACTIVATED`, `PERMISSION_DENIED`. Codes are
   stable, while message text may change. Missing-permission 403s now have a JSON body
   too.

3. **Refresh token after a password change: changed. Please update §2.**
   `change-password` now revokes **all** of the user's refresh tokens (signing out other
   devices) and **returns a new token pair** in `data`. Store those and carry on. The
   old refresh token will **not** work, so Option A as written (calling refresh with the
   old token) would fail. Also, a token issued right after a role or password change is
   accepted straight away; there's no 30-second wait for new tokens.

4. **Roles with permissions: done.** `GET admin/roles` returns
   `[{ id, name, permissions: string[] }]`, read from the same table the backend
   authorizes against. Render the Roles & Permissions page from it.

5. **Multiple roles: done.** Users can hold several roles. `company/users` now returns
   `roles: [{ id, name }]` per user. `role` is kept for compatibility (first role only).

6. **Wallet: already migrated.** `wallet/my-company`, `wallet/{id}/transactions` and the other
   reads need `finance.view`; `wallet/fund` and `wallet/fund/complete` need `finance.manage`
   (see §3.5). Company scoping is unchanged.

7. **Password rule: aligned.** The backend now requires **at least 8 characters with an
   uppercase letter, a lowercase letter, a digit and a special character** (any
   non-alphanumeric). This applies to `company/users/create`, admin creation and
   `change-password`. The frontend currently checks "letter + number + special", so
   please also require **upper and lower case**. Otherwise the API rejects with
   `400` "Passwords must have at least one uppercase ('A'-'Z')" or similar.
   Existing passwords are unaffected until changed.

**Known gaps:** `/user-management/*` pages make no API calls today (static UI), so
there's nothing to map yet. When they're wired up, their endpoints will be the
`support/users/*` and `admin/users/*` ones. Guard them with `users.view` (list/profile)
and `users.manage` (actions).

### Frontend follow-up to the backend responses (2026-10-01)

All seven responses are handled on `feat/old_link`. The type check, production build and
re-auth simulation pass. The simulation now has 16 scenarios, using mocks shaped like the new contract.

| # | Frontend change |
|---|---|
| 1 | Nothing to change: `role/assign` and `role/remove` already send `{ userId, roleId }`, and activate/deactivate send no body. **Waiting for the staging deploy** to run the testing checklist. |
| 2 | The forced-password-change redirect now checks `code === "PASSWORD_CHANGE_REQUIRED"`, not the message text. Tested with a reworded message. `PERMISSION_DENIED` always shows "You don't have permission to perform this action." Other 403s show the backend `message`. `ACCOUNT_DEACTIVATED` on login or verify-login shows the message and clears tokens. On refresh, it signs the user out and shows the message on the login page. |
| 3 | **§2 now follows the new contract.** `changePasswordPage.tsx` stores the `accessToken` and `refreshToken` from the `change-password` response (`storeTokens` in `apiSlice.ts`) and goes straight into the app. It no longer calls `admin/refresh`. If the response has no token pair, the user is sent to login with "Password changed. Please sign in." Other open tabs pick up the new tokens through `localStorage`. |
| 4 | The Roles & Permissions page now renders from `GET admin/roles` (`permissions` per role). The hard-coded copy of §3.4 has been removed. |
| 5 | The admin table, CSV export and admin profile show **all** of a user's roles from `roles` (falling back to `role`). "Change role" assigns the new role, then removes **each** old role using its id from `roles`. The row menu appears only if every role the user holds is a staff role (or the current user is a SuperAdmin). |
| 6 | The Wallet page and sidebar entry now need `finance.view`. The Fund Wallet button needs `finance.manage`. The role check is gone. |
| 7 | Passwords now need 8+ characters, with an uppercase letter, a lowercase letter, a digit and a non-alphanumeric character. This applies on Create Admin **and** on the change-password page, which previously only checked length. |
| Gaps | `/user-management/*` routes are now guarded with `users.view`. Guard individual actions with `users.manage` once those pages are wired to `support/users/*` / `admin/users/*`. |

### Bug: `User does not belong to your company` on user-management actions (2026-10-01)

**Blocking: role changes and activate/deactivate don't work on staging.**

Signed in as a company **Admin** (token `role: Admin`, all 16 permissions,
`CompanyId: 6F2E993B-26C9-4175-9021-CDF1106D8466`):

1. `GET company/users` → 200. It lists the FinanceOfficer user `f34b1ccf-adc2-4db8-8571-e2433d00890a`
   (`isActive: true`), so the backend itself treats this user as part of the caller's company.
2. `POST admin/users/f34b1ccf-adc2-4db8-8571-e2433d00890a/activate` → **403**
   `{"success":false,"message":"User does not belong to your company"}`.
   That user is already active, so we expected 409 "already active". `role/assign` and `role/remove`
   fail the same way from the profile page and the table.

The frontend sends the `id` from `company/users`, which is the Identity user id. The caller's own
row has `id = c6785553-…`, which matches the token's `sub`.

**Likely cause (please check):** the `CompanyId` claim is **upper-case**
(`6F2E993B-…`), while ids the API serialises are lower-case (e.g. role ids `3070f1f7-…`).
If the company check compares the claim to the user's company id as **strings**
(`claim == user.CompanyId.ToString()`), it fails for every user even though the GUIDs are the same.
`company/users` still works, presumably because it filters in SQL, where the comparison ignores case.
Comparing parsed `Guid`s (or using `StringComparison.OrdinalIgnoreCase`) would fix it. If that's
not the cause, check how the target user's company is resolved for users created with
`company/users/create`.

Also, this 403 has no `code`. §4 lists it as "(none)" for company-scope errors, so that's expected,
and the frontend shows the message as-is.

**Backend response (2026-10-01): confirmed and fixed (not yet deployed).** Your diagnosis
was right. `ApplicationUser.CompanyId` is stored as a string, and existing rows differ in
letter case: that admin has `6F2E…`, while users created with `company/users/create` are
stored lower-case. The manage-user check compared the strings directly, so it failed
for every user. It now compares the ids as GUIDs (`ApplicationUser.BelongsToCompany`).
The same bug was fixed in two other places: the support desk's user lookups
(`support/users/{id}`, `/loans`) and the SuperAdmin admin list's company filter.
`company/users` was unaffected because it filters in SQL, as you guessed. After the
deploy, your step 2 should return `409 "User is already active"`.

**Remaining questions for the backend**

- **Deploy to staging.** This is the only blocker. Please post here when it's live, and we'll run the testing checklist and report back.
- **Users with no roles:** if a user's last role is removed, does `company/users` return `roles: []`?
  The frontend shows an empty Role cell in that case. Please confirm that's expected.
  - **Backend:** yes. You get `roles: []`, and `role` is omitted (null fields aren't serialised).
    That's expected. The user can still sign in but has no permissions, so every staff
    endpoint returns `403 PERMISSION_DENIED`. An empty Role cell is right; consider a
    "No role" badge so admins notice.
- **Staging is deployed (confirmed 2026-10-01).** Tokens carry `role`/`permission`/`CompanyId`,
  `company/users` returns `roles: [{ id, name }]`, and the user-management endpoints exist.
  We'll run the testing checklist once the company-check bug above is fixed.
- **Request: an endpoint to edit an admin's details.** The admin profile page can now change
  role (`role/assign` + `role/remove`) and status (`activate` / `deactivate`). There's no
  endpoint to update first name, last name, phone number or gender, so those fields are
  read-only for now. Something like `PUT admin/users/{userId}` with
  `{ firstName, lastName, phoneNumber, gender }` (needs `users.manage`, same rules as §6)
  would let us make them editable.
  - **Backend: added (deploying with the company-id fix).** The scope is **first and last
    name only**; phone number and gender stay read-only.
    ```
    PUT admin/users/{userId}          (users.manage)
    { "firstName": "Jane", "lastName": "Doe" }      // both required, 1–100 chars
    200 → { "userId", "firstName", "lastName" }
    ```
    Same rules as §6: non-SuperAdmins can only edit non-admin users in their own company,
    and nobody can edit themselves here (403). The JWT `FirstName`/`LastName` claims of
    the edited user update on their next refresh.
- **Request: get one user by id.** The profile page has no way to load a user by id, so
  opening `/admin-management/admin-userProfile/{id}` directly (refresh, shared link) shows
  "Admin not found". `GET company/users/{userId}` would fix that.
  - **Backend: added.** `GET company/users/{userId}` (`users.view`) returns the same object
    as one entry of `company/users` (including `roles: [{ id, name }]` and `isActive`).
    Users from another company return `404 "User not found"`; SuperAdmin can read any user.
  - Also fixed: the `role` filter on `company/users` now matches users who hold that role
    among several, not only as their first role.

### Known frontend gaps (not blocking)

- ~~`admin-userprofile.tsx` had placeholder buttons.~~ Now wired: **Edit** changes role and status,
  and **Deactivate** / **Activate** work. The role list comes from `admin/roles` (staff roles only, unless SuperAdmin).
  Name, phone and gender are read-only until an update endpoint exists (see the request above).
  The placeholder Branch field and the "Disable" button were removed: there's no branch on the user and no separate disable action.
- ~~The `/user-management/*` pages had no permission guard.~~ They're now guarded with `users.view` (see the follow-up above).

