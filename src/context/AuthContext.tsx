import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

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
      const response = await fetch(
        `${
          process.env.REACT_APP_API_BASE_URL ||
          "https://staginlending-fvexbmfhawe7e6ad.southafricanorth-01.azurewebsites.net/api/"
        }admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("devpay_admin_token", data.token);
        localStorage.setItem("devpay_admin_user", JSON.stringify(data.admin));

        setUser({
          uid: data.admin.id,
          email: data.admin.email,
          displayName: `${data.admin.firstName} ${data.admin.lastName}`,
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
      value={{ isAuthenticated, login, loading, logout, user }}
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
