import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
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

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("devpay_admin_token");
    const userData = localStorage.getItem("devpay_admin_user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          uid: parsedUser.id,
          email: parsedUser.email,
          displayName: `${parsedUser.firstName} ${parsedUser.lastName}`,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("devpay_admin_token");
        localStorage.removeItem("devpay_admin_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      // RTK Query returns { success, data: { accessToken, user } }
      if (response.data && response.data.accessToken && response.data.user) {
        localStorage.setItem("devpay_admin_token", response.data.accessToken);
        localStorage.setItem(
          "devpay_admin_user",
          JSON.stringify(response.data.user)
        );
        setUser({
          uid: response.data.user.id,
          email: response.data.user.email,
          displayName: `${response.data.user.firstName} ${response.data.user.lastName}`,
        });
        setIsAuthenticated(true);
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem("devpay_admin_token");
    localStorage.removeItem("devpay_admin_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        loading: loading || loginLoading,
        logout,
        user,
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
