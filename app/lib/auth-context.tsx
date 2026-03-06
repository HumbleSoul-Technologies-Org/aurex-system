'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authenticate, getCurrentUser, signOut, createUser, listUsers } from '@/lib/services/auth'
import { ensureSeed } from '@/lib/seed'

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
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (email: string, name: string, role?: string) => Promise<{ user: User; password: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  listUsers: () => any[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ensure admin user exists
    ensureSeed()
    
    // Restore session from localStorage
    try {
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
        })
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const u = await authenticate(email, password)
    setUser(u as User)
    return u as User
  }

  const signup = async (email: string, name: string, role = 'tenant') => {
    const { user: u, password } = await createUser({ email, name, role })
    setUser(u as User)
    return { user: u as User, password }
  }

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        setUser,
        listUsers,
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

