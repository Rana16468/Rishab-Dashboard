"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: { role: "", fullName: "", email: "" },
  isAuthenticated: false,
  login: (userData: {
    role: string;
    fullName: string;
    email: string;
    token: string;
  }) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({ role: "", fullName: "", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize user state from cookies on mount
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userRole="))
      ?.split("=")[1];

    const fullName = document.cookie
      .split("; ")
      .find((row) => row.startsWith("fullName="))
      ?.split("=")[1];

    const email = localStorage.getItem("email") || "";

    if (token && userRole) {
      setUser({ role: userRole, fullName: fullName || "", email });
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: {
    role: string;
    fullName: string;
    email: string;
    token: string;
  }) => {
    // Set cookies
    document.cookie = `token=${userData.token}; path=/; max-age=86400`; // 24 hours
    document.cookie = `userRole=${userData.role.toLowerCase()}; path=/; max-age=86400`;
    document.cookie = `fullName=${userData.fullName}; path=/; max-age=86400`;

    // Store email in localStorage (persisted across logout)
    localStorage.setItem("email", userData.email);

    // Update state
    setUser({
      role: userData.role.toLowerCase(),
      fullName: userData.fullName,
      email: userData.email,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Preserve email from localStorage
    const email = localStorage.getItem("email");

    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Clear cookie for all paths and domains
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      if (window.location.hostname !== "localhost") {
        document.cookie =
          name +
          "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." +
          window.location.hostname;
      }
    });

    // Clear localStorage except email
    const keysToPreserve = ["email"];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear sessionStorage completely
    sessionStorage.clear();

    // Clear user state but preserve email
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
