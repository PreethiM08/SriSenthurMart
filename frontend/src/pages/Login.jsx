import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'
import './Login.css'

export default function Login() {
    const { login, adminLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [role, setRole] = useState('user')   // 'user' | 'admin'
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const from = location.state?.from?.pathname || '/'

    const handleRoleSwitch = (r) => {
        setRole(r)
        setError('')
        setForm({ username: '', password: '' })
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password) {
            setError('Both fields are required')
            return
        }
        setLoading(true)
        try {
            if (role === 'admin') {
                await adminLogin(form)
                navigate('/admin/dashboard', { replace: true })
            } else {
                await login(form)
                navigate(from === '/login' ? '/' : from, { replace: true })
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const isAdmin = role === 'admin'

    return (
        <div className={`auth-page ${isAdmin ? 'admin-theme' : ''}`}>
            {/* Left Panel */}
            <div className={`auth-left ${isAdmin ? 'admin-auth-left' : ''}`}>
                <div className="auth-brand">
                    <span className="auth-brand-icon">🌿</span>
                    <h1>SriSenthurMart</h1>
                    {isAdmin
                        ? <p>Admin Control Panel — manage products, orders, inventory & analytics.</p>
                        : <p>Pure oils & natural powder mixes, delivered fresh to your door.</p>
                    }
                </div>
                <div className="auth-features">
                    {isAdmin ? (
                        <>
                            <div className="auth-feature">📊 Sales Analytics</div>
                            <div className="auth-feature">📦 Product Management</div>
                            <div className="auth-feature">🏪 Inventory Control</div>
                            <div className="auth-feature">💳 Transaction Reports</div>
                        </>
                    ) : (
                        <>
                            <div className="auth-feature">🫙 Cold-pressed oils</div>
                            <div className="auth-feature">🌾 Artisanal powder mixes</div>
                            <div className="auth-feature">🚚 Fast delivery</div>
                            <div className="auth-feature">✅ 100% natural</div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-right">
                <div className="auth-card">

                    {/* Role Toggle */}
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-btn ${role === 'user' ? 'active' : ''}`}
                            onClick={() => handleRoleSwitch('user')}
                        >
                            👤 Customer
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'admin' ? 'active admin-active' : ''}`}
                            onClick={() => handleRoleSwitch('admin')}
                        >
                            🔐 Admin
                        </button>
                    </div>

                    {/* Header */}
                    <div className="auth-header">
                        {isAdmin && <div className="admin-badge">🔐 Admin Access</div>}
                        <h2>{isAdmin ? 'Admin Login' : 'Welcome back'}</h2>
                        <p>
                            {isAdmin
                                ? 'Sign in to access the admin panel'
                                : 'Sign in to continue shopping'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && <div className="auth-error">{error}</div>}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                {isAdmin ? 'Admin Username' : 'Username'}
                            </label>
                            <input
                                className="form-input"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder={isAdmin ? 'admin' : 'Enter your username'}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-lg w-full ${isAdmin ? 'btn-admin-submit' : 'btn-primary'}`}
                            disabled={loading}
                        >
                            {loading
                                ? 'Signing in...'
                                : isAdmin ? '🔐 Sign In as Admin' : '→ Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    {!isAdmin && (
                        <p className="auth-footer" style={{ marginTop: 20 }}>
                            Don't have an account? <Link to="/register">Create one</Link>
                        </p>
                    )}

                    {isAdmin && (
                        <p className="auth-footer" style={{ marginTop: 16, fontSize: 12 }}>
                            Default: <strong>admin</strong> / <strong>Admin@1234</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
