import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import './Navbar.css'

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth()
    const { cartSummary } = useCart()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropOpen, setDropOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    if (!user) return null

    if (isAdmin) {
        return (
            <nav className="navbar admin-navbar">
                <div className="container navbar-inner">
                    <Link to="/admin/dashboard" className="navbar-brand">
                        <span className="brand-icon">🌿</span>
                        <span>SriSenthurMart <em>Admin</em></span>
                    </Link>
                    <div className="admin-nav-links">
                        <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>Dashboard</Link>
                        <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>Products</Link>
                        <Link to="/admin/inventory" className={isActive('/admin/inventory') ? 'active' : ''}>Inventory</Link>
                        <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>Orders</Link>
                        <Link to="/admin/transactions" className={isActive('/admin/transactions') ? 'active' : ''}>Transactions</Link>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        )
    }

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🌿</span>
                    <span>SriSenthurMart</span>
                </Link>

                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Shop</Link>
                    <Link to="/orders" className={isActive('/orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Orders</Link>
                </div>

                <div className="navbar-right">
                    <Link to="/cart" className="cart-btn">
                        <span>🛒</span>
                        {(cartSummary?.products_count > 0) && (
                            <span className="cart-count">{cartSummary.products_count}</span>
                        )}
                    </Link>

                    <div className="user-drop" onMouseLeave={() => setDropOpen(false)}>
                        <button className="user-btn" onClick={() => setDropOpen(!dropOpen)}>
                            <span className="user-avatar">{user.full_name?.[0] || user.username?.[0] || 'U'}</span>
                            <span className="user-name">{user.full_name || user.username}</span>
                            <span>▾</span>
                        </button>
                        {dropOpen && (
                            <div className="drop-menu">
                                <div className="drop-header">
                                    <p className="drop-name">{user.full_name}</p>
                                    <p className="drop-email">{user.email}</p>
                                </div>
                                <Link to="/orders" className="drop-item" onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                                <button className="drop-item danger" onClick={handleLogout}>🚪 Logout</button>
                            </div>
                        )}
                    </div>

                    <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
        </nav>
    )
}