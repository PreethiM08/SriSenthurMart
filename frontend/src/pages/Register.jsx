import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        full_name: '', username: '', email: '',
        phone_number: '', password: '', confirm_password: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setErrors({ ...errors, [e.target.name]: '' })
    }

    const validate = () => {
        const errs = {}
        if (!form.full_name.trim()) errs.full_name = 'Full name is required'
        if (!form.username.trim()) errs.username = 'Username is required'
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
        if (!form.phone_number.trim()) errs.phone_number = 'Phone is required'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
        if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            await register(form)
            navigate('/')
        } catch (err) {
            const data = err.response?.data || {}
            const apiErrors = {}
            Object.keys(data).forEach(k => {
                apiErrors[k] = Array.isArray(data[k]) ? data[k][0] : data[k]
            })
            setErrors(apiErrors)
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
                        <h2>Create Account</h2>
                        <p>Join thousands of happy customers</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    className={`form-input ${errors.full_name ? 'error' : ''}`}
                                    name="full_name" value={form.full_name}
                                    onChange={handleChange} placeholder="John Doe"
                                />
                                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    className={`form-input ${errors.username ? 'error' : ''}`}
                                    name="username" value={form.username}
                                    onChange={handleChange} placeholder="johndoe"
                                />
                                {errors.username && <span className="form-error">{errors.username}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                name="email" value={form.email}
                                onChange={handleChange} placeholder="john@example.com"
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                className={`form-input ${errors.phone_number ? 'error' : ''}`}
                                name="phone_number" value={form.phone_number}
                                onChange={handleChange} placeholder="+91 9876543210"
                            />
                            {errors.phone_number && <span className="form-error">{errors.phone_number}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    name="password" value={form.password}
                                    onChange={handleChange} placeholder="Min 8 characters"
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className={`form-input ${errors.confirm_password ? 'error' : ''}`}
                                    name="confirm_password" value={form.confirm_password}
                                    onChange={handleChange} placeholder="Repeat password"
                                />
                                {errors.confirm_password && <span className="form-error">{errors.confirm_password}</span>}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}