import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
    const { user, loading } = useAuth()

    if (loading) return <p className="text-gray-500">Loading...</p>
    if (!user) return <Navigate to="/login" replace />
    if (user.role !== 'admin') return <Navigate to="/" replace />

    return <Outlet />
}