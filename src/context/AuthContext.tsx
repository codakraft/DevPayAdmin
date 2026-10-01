import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  storeTokens,
  useLoginMutation,
  useVerifyLoginMutation,
} from "../store/apiSlice";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  PENDING_USER_KEY,
  AUTH_TOKEN_CHANGED_EVENT,
  clearStoredAuth,
  decodeToken,
  hasPermission,
  isSuperAdmin as claimsAreSuperAdmin,
} from "../helpers/auth";

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ sessionId: string; otpSentTo?: string; expiresAt?: string }>;
  verifyLogin: (sessionId: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  user: User | null;
  loading: boolean;
  refreshAuth: () => void;
  // Stores the tokens returned by change-password and signs the user in
  completePasswordChange: (changePasswordResponse: any) => boolean;
  roles: string[];
  permissions: string[];
  passwordChangeRequired: boolean;
  isSuperAdmin: boolean;
  can: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getAuthData = (response: any) =>
  response?.data?.data || response?.data || response;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [verifyLoginMutation, { isLoading: verifyLoginLoading }] =
    useVerifyLoginMutation();

  // Roles and permissions come from the JWT and are re-derived whenever it changes
  const claims = useMemo(() => decodeToken(accessToken), [accessToken]);

  const clearAuthData = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const buildUserProfile = useCallback((userData: any): User | null => {
    const id = userData?.id || userData?.userId || userData?._id;
    const email =
      userData?.email || userData?.adminEmail || userData?.userEmail;

    if (!id || !email) {
      return null;
    }

    return {
      uid: id,
      email,
      displayName: `${userData?.firstName || ""} ${
        userData?.lastName || ""
      }`.trim(),
    };
  }, []);

  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userProfile = buildUserProfile(parsedUser);
        if (!userProfile) {
          console.warn("[AuthContext] Invalid user data during refresh");
          clearAuthData();
          return;
        }

        setAccessToken(token);
        setUser(userProfile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("[AuthContext] Error refreshing auth:", error);
        clearAuthData();
      }
    }
    // No auth data: keep the current state. The storage event might fire
    // before the data is written.
  }, [buildUserProfile, clearAuthData]);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const userData = localStorage.getItem(USER_KEY);

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);

          // Validate that the parsed user has required fields
          const userProfile = buildUserProfile(parsedUser);
          if (!userProfile) {
            console.warn("[AuthContext] Invalid user data structure");
            clearAuthData();
            return;
          }

          setAccessToken(token);
          setUser(userProfile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("[AuthContext] Error parsing user data:", error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    // Add a small delay to ensure localStorage is accessible
    setTimeout(initializeAuth, 100);

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY && e.newValue === null) {
        clearAuthData();
      } else if (e.key === ACCESS_TOKEN_KEY && e.newValue) {
        // Another tab logged in or refreshed the token
        setAccessToken(e.newValue);
        setTimeout(() => {
          refreshAuth();
        }, 100);
      } else if (e.key === USER_KEY && e.newValue) {
        setTimeout(() => {
          refreshAuth();
        }, 100);
      }
    };

    // The API layer refreshed the token in this tab
    const handleTokenChanged = () => {
      setAccessToken(localStorage.getItem(ACCESS_TOKEN_KEY));
    };

    // Listen for window focus (helps with Paystack redirect)
    const handleWindowFocus = () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && !isAuthenticated) {
        // Only refresh if we have a token but aren't authenticated
        setTimeout(() => {
          refreshAuth();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleTokenChanged);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleTokenChanged);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshAuth, clearAuthData, buildUserProfile, isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();

      // New login response returns sessionId for OTP verification
      if (response.data && response.data.sessionId) {
        const { sessionId, otpSentTo, expiresAt } = response.data;
        clearAuthData();
        return { sessionId, otpSentTo, expiresAt };
      }

      throw new Error("Invalid response structure - no sessionId received");
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      // Clear any existing auth data on login failure
      clearAuthData();
      throw error;
    }
  };

  const verifyLogin = async (sessionId: string, otp: string) => {
    try {
      const response = await verifyLoginMutation({ sessionId, otp }).unwrap();
      const authData = getAuthData(response);
      const { accessToken: newAccessToken, refreshToken, user: userData } =
        authData || {};

      // Check if password change is required
      if (authData?.requiresPasswordChange) {
        // Keep the tokens so the change-password call is authorized, but don't
        // mark the user authenticated until the password has been changed
        if (newAccessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        }
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        if (userData) {
          localStorage.setItem(PENDING_USER_KEY, JSON.stringify(userData));
        }
        return response;
      }

      if (newAccessToken && userData) {
        const userProfile = buildUserProfile(userData);
        if (!userProfile) {
          throw new Error("Invalid user data from verify-login");
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        setAccessToken(newAccessToken);
        setUser(userProfile);
        setIsAuthenticated(true);
        return response;
      }

      throw new Error("Invalid response structure - no token or user data");
    } catch (error) {
      console.error("[AuthContext] Verify login error:", error);
      clearAuthData();
      throw error;
    }
  };

  const completePasswordChange = (changePasswordResponse: any) => {
    // change-password revokes every older token (including our refresh token)
    // and returns a new pair, so use that rather than calling refresh
    const userData =
      localStorage.getItem(PENDING_USER_KEY) || localStorage.getItem(USER_KEY);
    const userProfile = userData ? buildUserProfile(JSON.parse(userData)) : null;

    if (!userProfile || !storeTokens(getAuthData(changePasswordResponse))) {
      clearAuthData();
      return false;
    }

    localStorage.setItem(USER_KEY, userData as string);
    localStorage.removeItem(PENDING_USER_KEY);
    setAccessToken(localStorage.getItem(ACCESS_TOKEN_KEY));
    setUser(userProfile);
    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    clearAuthData();

    // Optional: redirect to login page
    window.location.href = "/login";
  };

  const permissions = useMemo(() => claims?.permissions ?? [], [claims]);
  const roles = useMemo(() => claims?.roles ?? [], [claims]);
  const can = useCallback(
    (permission: string) => hasPermission(claims, permission),
    [claims],
  );
  const hasRole = useCallback(
    (...wanted: string[]) => wanted.some((role) => roles.includes(role)),
    [roles],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        verifyLogin,
        loading: loading || loginLoading || verifyLoginLoading,
        logout,
        user,
        refreshAuth,
        completePasswordChange,
        roles,
        permissions,
        passwordChangeRequired: !!claims?.passwordChangeRequired,
        isSuperAdmin: claimsAreSuperAdmin(claims),
        can,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
