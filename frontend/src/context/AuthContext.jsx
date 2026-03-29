import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('hospital_user')
    const token  = localStorage.getItem('hospital_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch (_) { logout() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('hospital_token', data.token)
    localStorage.setItem('hospital_refresh', data.refreshToken || '')
    localStorage.setItem('hospital_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    localStorage.setItem('hospital_token', data.token)
    localStorage.setItem('hospital_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hospital_token')
    localStorage.removeItem('hospital_refresh')
    localStorage.removeItem('hospital_user')
    setUser(null)
  }, [])

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(`ROLE_${role}`)
  }, [user])

  const isAdmin   = useCallback(() => hasRole('ADMIN'),   [hasRole])
  const isDoctor  = useCallback(() => hasRole('DOCTOR'),  [hasRole])
  const isPatient = useCallback(() => hasRole('PATIENT'), [hasRole])

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      hasRole, isAdmin, isDoctor, isPatient,
      token: localStorage.getItem('hospital_token'),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
