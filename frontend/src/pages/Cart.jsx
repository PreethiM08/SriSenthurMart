import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { Toast, useToast } from '../utils/toast.jsx'
import './Cart.css'

const PLACEHOLDER = 'https://placehold.co/80x80/e8f5e9/2d6a4f?text=🌿'

export default function Cart() {
    const { cartItems, cartSummary, loading, updateCart, removeFromCart, clearCart } = useCart()
    const navigate = useNavigate()
    const { toast, showToast } = useToast()

    const handleUpdate = async (itemId, qty) => {
        try { await updateCart(itemId, qty) }
        catch (err) { showToast(err.response?.data?.error || 'Failed to update', 'error') }
    }

    const handleRemove = async (itemId, name) => {
        try {
            await removeFromCart(itemId)
            showToast(`${name} removed from cart`, 'warning')
        } catch { showToast('Failed to remove item', 'error') }
    }

    const handleClear = async () => {
        if (!confirm('Clear entire cart?')) return
        try { await clearCart(); showToast('Cart cleared', 'warning') }
        catch { showToast('Failed to clear cart', 'error') }
    }

    if (loading) return <div className="page-loader"><div className="spinner" /></div>

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />
            <div className="container cart-container">
                <div className="section-header">
                    <h1 className="section-title">Shopping Cart</h1>
                    {cartItems.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={handleClear}>🗑 Clear Cart</button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started</p>
                        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Browse Products</button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Items */}
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img
                                        src={item.product.image_url || PLACEHOLDER}
                                        alt={item.product.product_name}
                                        className="cart-item-img"
                                        onError={e => { e.target.src = PLACEHOLDER }}
                                    />
                                    <div className="cart-item-info">
                                        <h3 className="cart-item-name">{item.product.product_name}</h3>
                                        <p className="cart-item-qty-info">{item.product.quantity_value} {item.product.quantity_unit}</p>
                                        <p className="cart-item-price">₹{Number(item.product.price).toFixed(2)} each</p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="qty-control">
                                            <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                                            <span className="qty-val">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.product_count}>+</button>
                                        </div>
                                        <p className="cart-item-total">₹{Number(item.total_price).toFixed(2)}</p>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id, item.product.product_name)}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="cart-summary card">
                            <h3 className="cart-summary-title">Order Summary</h3>
                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span>Products ({cartSummary.products_count})</span>
                                    <span>₹{Number(cartSummary.grand_total).toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery</span>
                                    <span className="text-success-label">FREE</span>
                                </div>
                            </div>
                            <div className="summary-total">
                                <span>Total Amount</span>
                                <span>₹{Number(cartSummary.grand_total).toFixed(2)}</span>
                            </div>
                            <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/checkout?from_cart=true')}>
                                Proceed to Checkout →
                            </button>
                            <button className="btn btn-ghost w-full mt-4" onClick={() => navigate('/')}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}