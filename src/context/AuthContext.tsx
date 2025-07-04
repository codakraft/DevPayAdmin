import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: { email: string } | null;
}

const DUMMY_USER = {
  email: "dahmaular@gmail.com",
  password: "12345678",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  const login = async (email: string, password: string) => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setIsAuthenticated(true);
      setUser({ email });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = useMemo(
    () => ({ isAuthenticated, login, logout, user }),
    [isAuthenticated, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
