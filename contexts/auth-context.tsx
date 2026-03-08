"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: { role: "admin", fullName: "Admin User" }, // Mock user
  isAuthenticated: true, // Mock authenticated
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({ role: "admin", fullName: "Admin User" });

  const login = () => setUser({ role: "admin", fullName: "Admin User" });
  const logout = () => setUser({ role: "", fullName: "" });

  // Mock checking auth
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
