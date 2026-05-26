"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as authApi from "@/lib/services/authApi";
import * as tokenManager from "@/lib/token-manager";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  settingsId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<{ user: User; password?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from token storage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = tokenManager.getAuthToken();

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (tokenManager.isTokenExpired(token)) {
          tokenManager.clearAuthData();
          setIsLoading(false);
          return;
        }

        // Try to fetch current user
        try {
          const response = await authApi.getCurrentUser(token);
          setUser(response.data.user);
        } catch (err) {
          // Token invalid or expired, clear it
          tokenManager.clearAuthData();
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await authApi.login({ email, password });

        // Store token and user
        tokenManager.setAuthToken(response.data.token, response.data.user);
        setUser(response.data.user);

        return response.data.user;
      } catch (err: any) {
        const errorMessage = err.message || "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      phone?: string,
    ) => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await authApi.register({
          firstName,
          lastName,
          email,
          password,
          phone,
        });

        // Store token and user
        tokenManager.setAuthToken(response.data.token, response.data.user);
        setUser(response.data.user);

        return { user: response.data.user, password: undefined };
      } catch (err: any) {
        const errorMessage = err.message || "Registration failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      tokenManager.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      setError(null);
      const token = tokenManager.getAuthToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await authApi.updateProfile(token, data);
      setUser(response.data.user);
      tokenManager.updateStoredUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setError(null);
        const token = tokenManager.getAuthToken();

        if (!token) {
          throw new Error("Not authenticated");
        }

        await authApi.changePassword(token, currentPassword, newPassword);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to change password";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await authApi.forgotPassword(email);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to request password reset";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        setError(null);
        const response = await authApi.resetPassword(token, newPassword);

        // Store token and user
        tokenManager.setAuthToken(response.data.token, response.data.user);
        setUser(response.data.user);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to reset password";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        setUser,
        clearError,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        token: tokenManager.getAuthToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
