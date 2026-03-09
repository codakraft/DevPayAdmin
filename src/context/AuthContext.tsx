import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useLoginMutation, useVerifyLoginMutation } from "../store/apiSlice";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [verifyLoginMutation, { isLoading: verifyLoginLoading }] =
    useVerifyLoginMutation();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("devpay_admin_token");
    localStorage.removeItem("devpay_admin_user");
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
    const token = localStorage.getItem("devpay_admin_token");
    const userData = localStorage.getItem("devpay_admin_user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userProfile = buildUserProfile(parsedUser);
        if (!userProfile) {
          console.warn("[AuthContext] Invalid user data during refresh");
          clearAuthData();
          return;
        }

        setUser(userProfile);
        setIsAuthenticated(true);
        console.log("[AuthContext] Auth refreshed successfully");
      } catch (error) {
        console.error("[AuthContext] Error refreshing auth:", error);
        clearAuthData();
      }
    } else {
      console.log(
        "[AuthContext] No auth data found during refresh - keeping current state",
      );
      // Don't clear auth data here - just log it
      // The storage event might fire before data is written
    }
  }, [buildUserProfile, clearAuthData]);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = () => {
      const token = localStorage.getItem("devpay_admin_token");
      const userData = localStorage.getItem("devpay_admin_user");

      console.log("[AuthContext] Initializing auth...", {
        token: !!token,
        userData: !!userData,
      });

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

          setUser(userProfile);
          setIsAuthenticated(true);
          console.log("[AuthContext] User authenticated successfully");
        } catch (error) {
          console.error("[AuthContext] Error parsing user data:", error);
          clearAuthData();
        }
      } else {
        console.log("[AuthContext] No token or user data found");
      }
      setLoading(false);
    };

    const clearAuthData = () => {
      localStorage.removeItem("devpay_admin_token");
      localStorage.removeItem("devpay_admin_user");
      setUser(null);
      setIsAuthenticated(false);
    };

    // Add a small delay to ensure localStorage is accessible
    setTimeout(initializeAuth, 100);

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle storage events from OTHER tabs/windows
      // Ignore storage events triggered by this window
      if (e.key === "devpay_admin_token" && e.newValue === null) {
        console.log("[AuthContext] Token removed in another tab, logging out");
        clearAuthData();
      } else if (
        (e.key === "devpay_admin_token" || e.key === "devpay_admin_user") &&
        e.newValue
      ) {
        console.log(
          "[AuthContext] Auth data updated in another tab, refreshing",
        );
        setTimeout(() => {
          refreshAuth();
        }, 100);
      }
    };

    // Listen for window focus (helps with Paystack redirect)
    const handleWindowFocus = () => {
      console.log("[AuthContext] Window focused, checking auth state");
      const token = localStorage.getItem("devpay_admin_token");
      if (token && !isAuthenticated) {
        // Only refresh if we have a token but aren't authenticated
        setTimeout(() => {
          refreshAuth();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshAuth, isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      console.log("[AuthContext] Login response:", response);

      // New login response returns sessionId for OTP verification
      if (response.data && response.data.sessionId) {
        const { sessionId, otpSentTo, expiresAt } = response.data;
        localStorage.removeItem("devpay_admin_token");
        localStorage.removeItem("devpay_admin_user");
        setUser(null);
        setIsAuthenticated(false);
        return { sessionId, otpSentTo, expiresAt };
      }

      throw new Error("Invalid response structure - no sessionId received");
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      // Clear any existing auth data on login failure
      localStorage.removeItem("devpay_admin_token");
      localStorage.removeItem("devpay_admin_user");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const verifyLogin = async (sessionId: string, otp: string) => {
    try {
      const response = await verifyLoginMutation({ sessionId, otp }).unwrap();
      console.log("[AuthContext] Verify login response:", response);

      // Check if password change is required
      if (
        response?.data?.requiresPasswordChange ||
        response?.requiresPasswordChange
      ) {
        return response;
      }

      const accessToken =
        response?.data?.accessToken ||
        response?.data?.data?.accessToken ||
        response?.accessToken;
      const userData =
        response?.data?.user || response?.data?.data?.user || response?.user;

      if (accessToken && userData) {
        localStorage.setItem("devpay_admin_token", accessToken);
        localStorage.setItem("devpay_admin_user", JSON.stringify(userData));

        const userProfile = buildUserProfile(userData);
        if (!userProfile) {
          throw new Error("Invalid user data from verify-login");
        }

        setUser(userProfile);
        setIsAuthenticated(true);
        console.log("[AuthContext] OTP verified, user authenticated");
        return response;
      }

      throw new Error("Invalid response structure - no token or user data");
    } catch (error) {
      console.error("[AuthContext] Verify login error:", error);
      localStorage.removeItem("devpay_admin_token");
      localStorage.removeItem("devpay_admin_user");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log("[AuthContext] Logging out user");
    clearAuthData();

    // Optional: redirect to login page
    window.location.href = "/login";
  };

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
