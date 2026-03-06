
import React, { createContext, useEffect, useState } from "react";
import api from "@/lib/axios";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  membership_status: string;
  theme: string;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    return !(token && storedUser); // Only load if we DON'T have data
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token with /me endpoint
          const response = await api.get("/v1/auth/auth/me");
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      } else {
          // If no token/user, ensure loading is definitely false
          setLoading(false);
      }
      
      // Verification finished (success or handled failure)
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    // Clear local state IMMEDIATELY for responsiveness
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    
    try {
      // Background request to server, don't wait for it
      api.post("/v1/auth/logout").catch(err => console.error("Server logout failed", err));
    } finally {
      window.location.href = "/login";
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

