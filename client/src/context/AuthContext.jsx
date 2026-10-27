import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On page load, restore the session if a token exists
    useEffect(() => {
        if (!localStorage.getItem('token')) {
        setLoading(false)
        return
        }

        client
        .get('/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    }, [])

    const login = async (email, password) => {
        const res = await client.post('/login', { email, password })
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
    }

    const register = async (data) => {
        const res = await client.post('/register', data)
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
    }

    const logout = async () => {
        try {
        await client.post('/logout')
        } finally {
        localStorage.removeItem('token')
        setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
        {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}