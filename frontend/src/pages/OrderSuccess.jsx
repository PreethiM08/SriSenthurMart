import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../services/api.js'
import './OrderSuccess.css'

export default function OrderSuccess() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const txnId = searchParams.get('txn') || 'TXN000000'
    const [order, setOrder] = useState(null)

    useEffect(() => {
        orderAPI.getOne(id).then(({ data }) => setOrder(data)).catch(() => navigate('/'))
    }, [id])

    const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

    return (
        <div className="page-wrapper success-page">
            <div className="container">
                <div className="success-card">
                    {/* Header */}
                    <div className="success-header">
                        <div className="success-icon-big">✓</div>
                        <h1>Order Placed Successfully!</h1>
                        <p>Thank you for shopping with NatureMart. Your order is confirmed.</p>
                    </div>

                    {/* Transaction Receipt */}
                    <div className="receipt">
                        <h3 className="receipt-title">🧾 Transaction Receipt</h3>
                        <div className="receipt-grid">
                            <div className="receipt-row">
                                <span>Transaction ID</span>
                                <strong className="txn-id">{txnId}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Order ID</span>
                                <strong>#{id}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Date & Time</span>
                                <strong>{date}</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Payment Status</span>
                                <span className="badge badge-success">✓ Paid</span>
                            </div>
                            <div className="receipt-row">
                                <span>Order Status</span>
                                <span className="badge badge-warning">Pending</span>
                            </div>
                            <div className="receipt-row total-row">
                                <span>Amount Paid</span>
                                <strong className="receipt-total">₹{order ? Number(order.total_amount).toFixed(2) : '...'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    {order?.items && (
                        <div className="receipt-items">
                            <h3 className="receipt-title">📦 Items Ordered</h3>
                            {order.items.map(item => (
                                <div key={item.id} className="receipt-item">
                                    <span>{item.product_name}</span>
                                    <span>×{item.quantity}</span>
                                    <span>₹{Number(item.total_price).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="success-actions">
                        <Link to="/orders" className="btn btn-primary btn-lg">View My Orders</Link>
                        <Link to="/" className="btn btn-ghost btn-lg">Continue Shopping</Link>
                    </div>

                    <p className="success-note">
                        📧 An order confirmation will be sent to your registered email.
                    </p>
                </div>
            </div>
        </div>
    )
}