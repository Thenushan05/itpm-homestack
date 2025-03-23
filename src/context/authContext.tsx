"use client";

import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (storedUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push("/");
    }
  }, []);

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
