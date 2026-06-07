import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const from = location.state?.from?.pathname || '/'

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password) { setError('All fields are required'); return }
        setLoading(true)
        try {
            await login(form)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-brand">
                    <span className="auth-brand-icon">🌿</span>
                    <h1>SriSenthurMart</h1>
                    <p>Pure oils & natural powder mixes, delivered fresh to your door.</p>
                </div>
                <div className="auth-features">
                    <div className="auth-feature">🫙 Cold-pressed oils</div>
                    <div className="auth-feature">🌾 Artisanal powder mixes</div>
                    <div className="auth-feature">🚚 Fast delivery</div>
                    <div className="auth-feature">✅ 100% natural</div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to continue shopping</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                className="form-input"
                                name="username" value={form.username}
                                onChange={handleChange} placeholder="Enter your username"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                name="password" value={form.password}
                                onChange={handleChange} placeholder="Enter your password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>

                    <div className="auth-divider">or</div>
                    <p className="auth-footer">
                        Are you an admin? <Link to="/admin/login">Admin Login →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}