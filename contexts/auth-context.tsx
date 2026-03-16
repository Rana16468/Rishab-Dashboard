"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  role: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  login: (data: {
    role: string;
    fullName: string;
    email: string;
    token: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: { role: "", fullName: "", email: "" },
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ role: "", fullName: "", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role") || "";
    const fullName = localStorage.getItem("fullName") || "";

    if (token && email) {
      setUser({ role, fullName, email });
      setIsAuthenticated(true);
    }
  }, []);

  const login = ({
    role,
    fullName,
    email,
    token,
  }: {
    role: string;
    fullName: string;
    email: string;
    token: string;
  }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    localStorage.setItem("fullName", fullName);

    // Set cookies for middleware
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `userRole=${role}; path=/; max-age=86400; SameSite=Lax`;

    setUser({ role, fullName, email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    const email = localStorage.getItem("email");
    localStorage.clear();

    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setUser({ role: "", fullName: "", email: email || "" });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
