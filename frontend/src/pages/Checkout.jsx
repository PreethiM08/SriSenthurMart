import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productAPI, orderAPI } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Toast, useToast } from '../utils/toast.jsx'
import './Checkout.css'

export default function Checkout() {
    const { user } = useAuth()
    const { cartItems, cartSummary } = useCart()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { toast, showToast } = useToast()

    const fromCart = searchParams.get('from_cart') === 'true'
    const productId = searchParams.get('product')
    const qty = parseInt(searchParams.get('qty') || '1')

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [placing, setPlacing] = useState(false)

    useEffect(() => {
        if (productId) {
            productAPI.getOne(productId).then(({ data }) => setProduct(data))
        }
    }, [productId])

    const items = fromCart ? cartItems : product ? [{
        product, quantity: qty, total_price: product.price * qty
    }] : []

    const total = fromCart
        ? cartSummary.grand_total
        : product ? (product.price * qty).toFixed(2) : 0

    const handleProceed = async () => {
        if (items.length === 0) { showToast('No items to order', 'error'); return }
        setPlacing(true)
        try {
            const payload = fromCart
                ? { from_cart: true }
                : { product_id: parseInt(productId), quantity: qty, from_cart: false }
            const { data } = await orderAPI.create(payload)
            navigate(`/payment/${data.id}`)
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to create order', 'error')
        } finally { setPlacing(false) }
    }

    if (!fromCart && !productId) {
        navigate('/')
        return null
    }

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />
            <div className="container checkout-container">
                <h1 className="section-title" style={{ marginBottom: 28 }}>Checkout</h1>

                <div className="checkout-grid">
                    {/* Customer Details */}
                    <div>
                        <div className="card checkout-section">
                            <h3 className="checkout-section-title">👤 Customer Details</h3>
                            <div className="customer-details">
                                <div className="detail-row"><span>Full Name</span><strong>{user?.full_name}</strong></div>
                                <div className="detail-row"><span>Username</span><strong>{user?.username}</strong></div>
                                <div className="detail-row"><span>Email</span><strong>{user?.email}</strong></div>
                                <div className="detail-row"><span>Phone</span><strong>{user?.phone_number}</strong></div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="card checkout-section">
                            <h3 className="checkout-section-title">📦 Order Items</h3>
                            {items.length === 0 ? (
                                <div className="page-loader"><div className="spinner" /></div>
                            ) : (
                                <div className="checkout-items">
                                    {items.map((item, i) => (
                                        <div key={i} className="checkout-item">
                                            <div className="checkout-item-info">
                                                <p className="checkout-item-name">{item.product.product_name}</p>
                                                <p className="checkout-item-meta">{item.product.quantity_value} {item.product.quantity_unit} × {item.quantity}</p>
                                            </div>
                                            <span className="checkout-item-price">₹{Number(item.total_price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card checkout-summary">
                        <h3 className="checkout-section-title">💰 Order Summary</h3>
                        <div className="summary-rows">
                            <div className="summary-row"><span>Items ({items.length})</span><span>₹{Number(total).toFixed(2)}</span></div>
                            <div className="summary-row"><span>Delivery</span><span className="text-success-label">FREE</span></div>
                            <div className="summary-row"><span>Tax</span><span>Included</span></div>
                        </div>
                        <div className="summary-total">
                            <span>Total Amount</span>
                            <span>₹{Number(total).toFixed(2)}</span>
                        </div>
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={handleProceed}
                            disabled={placing || items.length === 0}
                        >
                            {placing ? 'Processing...' : '💳 Proceed to Payment'}
                        </button>
                        <button className="btn btn-ghost w-full mt-4" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>
                        <div className="checkout-secure">
                            🔒 Secure & encrypted payment
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}