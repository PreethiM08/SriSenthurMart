import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import '../Auth.css'
import './Admin.css'

export default function AdminLogin() {
    const { adminLogin } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password) { setError('All fields required'); return }
        setLoading(true)
        try {
            await adminLogin(form)
            navigate('/admin/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid admin credentials')
        } finally { setLoading(false) }
    }

    return (
        <div className="auth-page admin-login-page">
            <div className="auth-left admin-auth-left">
                <div className="auth-brand">
                    <span className="auth-brand-icon">🌿</span>
                    <h1>NatureMart</h1>
                    <p>Admin Control Panel</p>
                </div>
                <div className="auth-features">
                    <div className="auth-feature">📊 Sales Analytics</div>
                    <div className="auth-feature">📦 Product Management</div>
                    <div className="auth-feature">🏪 Inventory Control</div>
                    <div className="auth-feature">💳 Transaction Reports</div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="admin-badge">🔐 Admin Access</div>
                        <h2>Admin Login</h2>
                        <p>Sign in to access the admin panel</p>
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Admin Username</label>
                            <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="admin" autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Signing in...' : '🔐 Admin Sign In'}
                        </button>
                    </form>
                    <p className="auth-footer" style={{ marginTop: 16 }}>
                        Default: <strong>admin</strong> / <strong>Admin@1234</strong>
                    </p>
                </div>
            </div>
        </div>
    )
}