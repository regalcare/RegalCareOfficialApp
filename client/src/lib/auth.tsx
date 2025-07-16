import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  role: "admin" | "customer";
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const stored = localStorage.getItem("user");

  if (stored) {
    setUser(JSON.parse(stored));
  } else {
    // TEMP: Create a manual admin user
    const adminUser = {
      id: 999,
      name: "Admin",
      phone: "555-0000",
      email: "admin@regalcare.com",
      role: "admin",
    };
    localStorage.setItem("user", JSON.stringify(adminUser));
    setUser(adminUser);
  }
    setIsLoading(false);
  }, []);
  

  const login = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
