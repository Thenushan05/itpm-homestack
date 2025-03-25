"use client";

import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ Read token from localStorage or sessionStorage
    if (localStorage.getItem("token") || sessionStorage.getItem("token")) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // ✅ Login function: Saves token and redirects
  const login = (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  // ✅ Logout function: Clears token and redirects
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/signin");
  };

  // ✅ Prevent flashing UI before auth state is checked
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
