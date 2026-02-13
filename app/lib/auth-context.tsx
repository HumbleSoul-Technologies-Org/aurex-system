'use client'

import React, { createContext, useContext, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  company?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Default/demo credentials
  const defaultUsers: Array<{ email: string; password: string; role: string; name: string }> = [
    { email: 'admin@example.com', password: 'adminpass', role: 'admin', name: 'Admin User' },
    { email: 'tenant@example.com', password: 'tenantpass', role: 'tenant', name: 'Tenant User' },
  ]

  const login = async (email: string, password: string) => {
    // In a real app, replace this with API authentication
    const match = defaultUsers.find((u) => u.email === email && u.password === password)
    if (!match) {
      throw new Error('Invalid credentials')
    }
    setUser({
      id: match.email,
      email: match.email,
      name: match.name,
      role: match.role,
    })
    return {
      id: match.email,
      email: match.email,
      name: match.name,
      role: match.role,
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    // Placeholder: In a real app, this would call an API
    setUser({
      id: '1',
      email,
      name,
    })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
