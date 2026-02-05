import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useLoginMutation } from "../store/apiSlice";

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("devpay_admin_token");
    localStorage.removeItem("devpay_admin_user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshAuth = useCallback(() => {
    console.log("[AuthContext] Refreshing authentication state");
    const token = localStorage.getItem("devpay_admin_token");
    const userData = localStorage.getItem("devpay_admin_user");

    console.log("[AuthContext] Refresh - Token exists:", !!token);
    console.log("[AuthContext] Refresh - User data exists:", !!userData);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser({
            uid: parsedUser.id,
            email: parsedUser.email,
            displayName: `${parsedUser.firstName || ""} ${
              parsedUser.lastName || ""
            }`.trim(),
          });
          setIsAuthenticated(true);
          console.log("[AuthContext] Auth refreshed successfully");
        } else {
          console.warn("[AuthContext] Invalid user data during refresh");
          clearAuthData();
        }
      } catch (error) {
        console.error("[AuthContext] Error refreshing auth:", error);
        clearAuthData();
      }
    } else {
      console.log("[AuthContext] No auth data found during refresh - keeping current state");
      // Don't clear auth data here - just log it
      // The storage event might fire before data is written
    }
  }, [clearAuthData]);

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
          console.log("[AuthContext] Parsed user data:", parsedUser);

          // Validate that the parsed user has required fields
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser({
              uid: parsedUser.id,
              email: parsedUser.email,
              displayName: `${parsedUser.firstName || ""} ${
                parsedUser.lastName || ""
              }`.trim(),
            });
            setIsAuthenticated(true);
            console.log("[AuthContext] User authenticated successfully");
          } else {
            console.warn("[AuthContext] Invalid user data structure");
            clearAuthData();
          }
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
      } else if ((e.key === "devpay_admin_token" || e.key === "devpay_admin_user") && e.newValue) {
        console.log("[AuthContext] Auth data updated in another tab, refreshing");
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

      // RTK Query returns { success, data: { accessToken, user } }
      if (response.data && response.data.accessToken && response.data.user) {
        const { accessToken, user: userData } = response.data;

        console.log("[AuthContext] Saving token to localStorage:", accessToken);
        console.log("[AuthContext] Saving user data to localStorage:", userData);

        // Store token and user data
        localStorage.setItem("devpay_admin_token", accessToken);
        localStorage.setItem("devpay_admin_user", JSON.stringify(userData));

        // Verify storage
        const savedToken = localStorage.getItem("devpay_admin_token");
        const savedUser = localStorage.getItem("devpay_admin_user");
        console.log("[AuthContext] Verification - Token saved:", !!savedToken);
        console.log("[AuthContext] Verification - User saved:", !!savedUser);

        // Update state
        const userProfile = {
          uid: userData.id,
          email: userData.email,
          displayName: `${userData.firstName || ""} ${
            userData.lastName || ""
          }`.trim(),
        };

        setUser(userProfile);
        setIsAuthenticated(true);

        console.log("[AuthContext] Login successful, user authenticated");
      } else {
        console.error("[AuthContext] Invalid response structure:", response);
        throw new Error(
          "Invalid response structure - no token or user data received"
        );
      }
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
        loading: loading || loginLoading,
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
