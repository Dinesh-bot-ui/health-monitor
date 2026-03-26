"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type User = {
  id: string
  email: string
  fullName: string
  hasCompletedHealthForm: boolean
}

type LoginResult = { success: boolean; error?: string; isFormSubmitted?: boolean }

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  register: (fullName: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  completeHealthForm: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        return { success: false, error: data.detail || "Invalid credentials" }
      }

      const userData: User = {
        id: data.id.toString(),
        email: data.email,
        fullName: data.full_name,
        hasCompletedHealthForm: data.is_form_submitted ?? false   // ✅ from DB
      }

      setUser(userData)

      // 🔥 STORE REAL USER ID
      localStorage.setItem("user_id", data.id)
      // ✅ Persist form-submitted flag for page refreshes
      localStorage.setItem("is_form_submitted", data.is_form_submitted ? "1" : "0")

      setIsLoading(false)
      return { success: true, isFormSubmitted: data.is_form_submitted ?? false }

    } catch (err) {
      setIsLoading(false)
      return { success: false, error: "Cannot connect to server. Is the backend running?" }
    }
  }, [])

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        return false
      }

      // ✅ IMPORTANT: use backend ID
      const userData: User = {
        id: data.id.toString(),
        email: data.email,
        fullName,
        hasCompletedHealthForm: false
      }

      setUser(userData)

      // 🔥 STORE REAL USER ID
      localStorage.setItem("user_id", data.id)

      setIsLoading(false)
      return true

    } catch (err) {
      setIsLoading(false)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('healthpulse_current_user')
    localStorage.removeItem('user_id')
  }, [])

  const completeHealthForm = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, hasCompletedHealthForm: true }
      setUser(updatedUser)
      localStorage.setItem('healthpulse_current_user', JSON.stringify(updatedUser))

      // Update in users list
      const storedUsers = localStorage.getItem('healthpulse_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      const userIndex = users.findIndex((u: { id: string }) => u.id === user.id)
      if (userIndex >= 0) {
        users[userIndex].hasCompletedHealthForm = true
        localStorage.setItem('healthpulse_users', JSON.stringify(users))
      }
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, completeHealthForm }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
