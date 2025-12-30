'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { AuthUser } from './types'

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('auth-token')
    const userData = Cookies.get('auth-user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser({ ...parsedUser, token })
      } catch (error) {
        console.error('Error parsing user data:', error)
        Cookies.remove('auth-token')
        Cookies.remove('auth-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: AuthUser) => {
    setUser(userData)
    Cookies.set('auth-token', userData.token, { expires: 1 }) // 1 day
    Cookies.set('auth-user', JSON.stringify({
      username: userData.username,
      role: userData.role
    }), { expires: 1 })
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('auth-token')
    Cookies.remove('auth-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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