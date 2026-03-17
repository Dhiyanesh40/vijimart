import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "@/services/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  interests?: string[];
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  token: string | null;
  signUp: (email: string, password: string, fullName: string, address?: string, interests?: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin' || parsedUser.email === 'dhiyaneshb439@gmail.com');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      setUser(userData);
      setIsAdmin(userData.role === 'admin' || userData.email === 'dhiyaneshb439@gmail.com');
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string, interests?: string) => {
    try {
      const response = await authAPI.register({
        fullName,
        email,
        password,
        phone,
        address,
        interests
      });
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and user
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin' || newUser.email === 'dhiyaneshb439@gmail.com');

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and user
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setIsAdmin(newUser.role === 'admin' || newUser.email === 'dhiyaneshb439@gmail.com');

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signOut = async () => {
    // Clear token and user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: new Error('No user logged in') };
    
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, token, signUp, signIn, signOut, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
