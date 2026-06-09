import { useState, useEffect } from 'react'
import { orderAPI } from '../services/api.js'
import './MyOrders.css'

const STATUS_MAP = {
    pending: { label: 'Pending', cls: 'badge-warning' },
    processing: { label: 'Processing', cls: 'badge-primary' },
    delivered: { label: 'Delivered', cls: 'badge-success' },
    cancelled: { label: 'Cancelled', cls: 'badge-danger' },
}

export default function MyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        orderAPI.getAll()
            .then(({ data }) => setOrders(data.results || data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="page-loader"><div className="spinner" /></div>

    return (
        <div className="page-wrapper">
            <div className="container orders-container">
                <div className="section-header">
                    <h1 className="section-title">My Orders</h1>
                    <span className="results-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>Your orders will appear here after you make a purchase</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const st = STATUS_MAP[order.status] || STATUS_MAP.pending
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
                                                <span className="order-label">Date</span>
                                                <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div className="order-meta-item">
                                                <span className="order-label">Items</span>
                                                <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="order-meta-item">
                                                <span className="order-label">Total</span>
                                                <span className="order-total">₹{Number(order.total_amount).toFixed(2)}</span>
                                            </div>
                                            <span className={`badge ${st.cls}`}>{st.label}</span>
                                        </div>
                                        <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                                    </div>

                                    {isOpen && (
                                        <div className="order-details">
                                            <div className="order-items-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Qty</th>
                                                            <th>Unit Price</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.items?.map(item => (
                                                            <tr key={item.id}>
                                                                <td>{item.product_name}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>₹{Number(item.unit_price).toFixed(2)}</td>
                                                                <td>₹{Number(item.subtotal).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="order-footer-row">
                                                <span />
                                                <div className="order-grand-total">
                                                    Grand Total: <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
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