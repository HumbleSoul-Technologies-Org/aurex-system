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
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    // Placeholder: In a real app, this would call an API
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
    })
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
