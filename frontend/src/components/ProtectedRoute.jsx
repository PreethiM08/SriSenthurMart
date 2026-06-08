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

    // Not logged in → always go to /login (unified page)
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Logged in as user but trying to access admin route
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />
    }

    // Logged in as admin but trying to access user route
    if (!adminOnly && isAdmin) {
        return <Navigate to="/admin/dashboard" replace />
    }

    return children
}
