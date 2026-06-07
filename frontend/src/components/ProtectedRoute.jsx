import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to={adminOnly ? '/admin/login' : '/login'} state={{ from: location }} replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />
    }

    if (!adminOnly && isAdmin) {
        return <Navigate to="/admin/dashboard" replace />
    }

    return children
}