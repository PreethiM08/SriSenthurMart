import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        const storedUser = localStorage.getItem('user')
        const adminFlag = localStorage.getItem('is_admin')
        if (token && storedUser) {
            setUser(JSON.parse(storedUser))
            setIsAdmin(adminFlag === 'true')
        }
        setLoading(false)
    }, [])

    const login = useCallback(async (credentials) => {
        const { data } = await authAPI.login(credentials)
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('is_admin', 'false')
        setUser(data.user)
        setIsAdmin(false)
        return data
    }, [])

    const adminLogin = useCallback(async (credentials) => {
        const { data } = await authAPI.login(credentials)

        if (!data.user.is_staff) {
            throw new Error("Not an admin user")
        }

        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('is_admin', 'true')

        setUser(data.user)
        setIsAdmin(true)

        return data
    }, [])

    const logout = useCallback(async () => {
        try {
            const refresh = localStorage.getItem('refresh_token')
            if (refresh) await authAPI.logout({ refresh })
        } catch { /* ignore */ }
        localStorage.clear()
        setUser(null)
        setIsAdmin(false)
    }, [])

    const register = useCallback(async (data) => {
        const res = await authAPI.register(data)
        localStorage.setItem('access_token', res.data.tokens.access)
        localStorage.setItem('refresh_token', res.data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        localStorage.setItem('is_admin', 'false')
        setUser(res.data.user)
        setIsAdmin(false)
        return res.data
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, adminLogin, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}