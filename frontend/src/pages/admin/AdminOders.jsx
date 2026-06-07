import { useState, useEffect } from 'react'
import { orderAPI } from '../../services/api.js'
import { Toast, useToast } from '../../utils/toast.jsx'
import './Admin.css'

const STATUS_OPTIONS = ['pending', 'processing', 'delivered', 'cancelled']
const STATUS_MAP = {
    pending: 'badge-warning',
    processing: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const [statusChanging, setStatusChanging] = useState(null)
    const [filter, setFilter] = useState('')
    const { toast, showToast } = useToast()

    useEffect(() => { loadOrders() }, [])

    const loadOrders = async () => {
        setLoading(true)
        try {
            const { data } = await orderAPI.adminGetAll()
            setOrders(data.results || data)
        } catch { showToast('Failed to load orders', 'error') }
        finally { setLoading(false) }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        setStatusChanging(orderId)
        try {
            await orderAPI.adminUpdateStatus(orderId, { status: newStatus })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            showToast(`Order #${orderId} status updated to ${newStatus}`, 'success')
        } catch { showToast('Failed to update status', 'error') }
        finally { setStatusChanging(null) }
    }

    const filtered = orders.filter(o => {
        if (!filter) return true
        return o.status === filter
    })

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />
            <div className="container admin-layout">
                <div className="section-header">
                    <h1 className="section-title">Order Management</h1>
                    <div className="admin-table-actions">
                        <select className="form-select" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="">All Orders</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                        <span className="results-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📦</div>
                        <h3>No orders found</h3>
                    </div>
                ) : (
                    <div className="orders-admin-list">
                        {filtered.map(order => {
                            const isOpen = expanded === order.id
                            return (
                                <div key={order.id} className="order-card card">
                                    <div className="order-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
                                        <div className="order-id-section">
                                            <span className="order-label">Order</span>
                                            <span className="order-id">#{order.id}</span>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-meta-item">
                                                <span className="order-label">Customer</span>
                                                <span>{order.user_name}</span>
                                            </div>
                                            <div className="order-meta-item">
                                                <span className="order-label">Date</span>
                                                <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div className="order-meta-item">
                                                <span className="order-label">Amount</span>
                                                <span className="order-total">₹{Number(order.total_amount).toFixed(2)}</span>
                                            </div>
                                            <span className={`badge ${STATUS_MAP[order.status] || 'badge-muted'}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                                    </div>

                                    {isOpen && (
                                        <div className="order-details">
                                            <div className="order-detail-header">
                                                <div className="order-items-table">
                                                    <table>
                                                        <thead>
                                                            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items?.map(item => (
                                                                <tr key={item.id}>
                                                                    <td>{item.product_name}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>₹{Number(item.unit_price).toFixed(2)}</td>
                                                                    <td>₹{Number(item.total_price).toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="order-status-update">
                                                    <p className="form-label">Update Status</p>
                                                    <div className="status-btn-group">
                                                        {STATUS_OPTIONS.map(s => (
                                                            <button
                                                                key={s}
                                                                className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-ghost'}`}
                                                                onClick={() => handleStatusChange(order.id, s)}
                                                                disabled={statusChanging === order.id || order.status === s}
                                                            >
                                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}