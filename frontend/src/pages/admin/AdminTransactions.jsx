import { useState, useEffect } from 'react'
import { transactionAPI } from '../../services/api.js'
import { Toast, useToast } from '../../utils/toast.jsx'
import './Admin.css'

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all | daily | weekly | monthly
    const { toast, showToast } = useToast()

    useEffect(() => { loadTransactions() }, [])

    const loadTransactions = async () => {
        setLoading(true)
        try {
            const { data } = await transactionAPI.adminGetAll({ filter })
            setTransactions(data.results || data)
        } catch { showToast('Failed to load transactions', 'error') }
        finally { setLoading(false) }
    }

    useEffect(() => { loadTransactions() }, [filter])

    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const getFilterLabel = () => {
        const map = { all: 'All Time', daily: 'Today', weekly: 'This Week', monthly: 'This Month' }
        return map[filter] || 'All Time'
    }

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />
            <div className="container admin-layout">
                <div className="section-header">
                    <h1 className="section-title">Transaction Management</h1>
                    <div className="admin-table-actions">
                        {['all', 'daily', 'weekly', 'monthly'].map(f => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card success">
                        <span className="stat-icon">💳</span>
                        <span className="stat-value">{transactions.length}</span>
                        <span className="stat-label">{getFilterLabel()} Transactions</span>
                    </div>
                    <div className="stat-card accent">
                        <span className="stat-icon">💰</span>
                        <span className="stat-value">₹{totalRevenue.toFixed(0)}</span>
                        <span className="stat-label">{getFilterLabel()} Revenue</span>
                    </div>
                    <div className="stat-card primary">
                        <span className="stat-icon">📊</span>
                        <span className="stat-value">
                            {transactions.length > 0 ? `₹${(totalRevenue / transactions.length).toFixed(0)}` : '₹0'}
                        </span>
                        <span className="stat-label">Avg. Order Value</span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">💳</div>
                        <h3>No transactions found</h3>
                        <p>Transactions will appear here after orders are paid</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className="txn-id-cell">{t.transaction_id}</span>
                                        </td>
                                        <td>#{t.order_id}</td>
                                        <td>{t.user_name || '—'}</td>
                                        <td><strong>₹{Number(t.amount).toFixed(2)}</strong></td>
                                        <td>
                                            <span className={`badge ${t.payment_status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                                                {t.payment_status === 'success' ? '✓ Success' : '✕ Failed'}
                                            </span>
                                        </td>
                                        <td>{new Date(t.payment_date).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}