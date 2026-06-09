import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api.js'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import './Admin.css'

const COLORS = ['#2d6a4f', '#52b788', '#d4a017', '#f4c842', '#dc2626', '#3b82f6']

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        adminAPI.getDashboard()
            .then(({ data }) => setStats(data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="page-loader"><div className="spinner" /></div>

    const salesData = stats?.monthly_sales || []
    const categoryData = [
        { name: 'Oil Products', value: stats?.oil_products_count || 0 },
        { name: 'Powder Mix', value: stats?.powder_products_count || 0 },
    ]

    return (
        <div className="page-wrapper">
            <div className="container admin-layout">
                <div className="section-header">
                    <h1 className="section-title">Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Welcome back, Admin</p>
                </div>

                {/* Stat Cards */}
                <div className="stats-grid">
                    {[
                        { icon: '👥', label: 'Total Users', value: stats?.total_users ?? '—', cls: 'primary' },
                        { icon: '📦', label: 'Total Products', value: stats?.total_products ?? '—', cls: 'primary' },
                        { icon: '🛒', label: 'Total Orders', value: stats?.total_orders ?? '—', cls: 'success' },
                        { icon: '💳', label: 'Transactions', value: stats?.total_transactions ?? '—', cls: 'accent' },
                        { icon: '💰', label: 'Total Revenue', value: `₹${Number(stats?.total_revenue || 0).toFixed(0)}`, cls: 'success' },
                        { icon: '📊', label: 'Products Sold', value: stats?.products_sold ?? '—', cls: 'accent' },
                        { icon: '⚠️', label: 'Low Stock', value: stats?.low_stock_count ?? '—', cls: 'danger' },
                        { icon: '❌', label: 'Out of Stock', value: stats?.out_of_stock_count ?? '—', cls: 'danger' },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card ${s.cls}`}>
                            <span className="stat-icon">{s.icon}</span>
                            <span className="stat-value">{s.value}</span>
                            <span className="stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">📈 Monthly Revenue</h3>
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={salesData}>
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <p>No sales data yet</p>
                            </div>
                        )}
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">🥧 Product Categories</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top & Low Stock */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">🏆 Top Selling Products</h3>
                        {stats?.top_products?.length > 0 ? (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
                                    <tbody>
                                        {stats.top_products.map((p, i) => (
                                            <tr key={i}>
                                                <td>{p.product_name}</td>
                                                <td>{p.total_sold}</td>
                                                <td>₹{Number(p.total_revenue).toFixed(0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet</p>}
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">⚠️ Low Stock & Out of Stock</h3>
                        {stats?.low_stock_products?.length > 0 ? (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Product</th><th>Stock</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {stats.low_stock_products.map((p, i) => {
                                            const qty = p.product_count ?? p.stock ?? 0
                                            return (
                                                <tr key={i}>
                                                    <td>{p.product_name}</td>
                                                    <td><strong>{qty}</strong></td>
                                                    <td>
                                                        <span className={`badge ${qty === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                            {qty === 0 ? '❌ Out of Stock' : '⚠️ Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>✅ All products well stocked</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}