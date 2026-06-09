import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import { Toast, useToast } from '../utils/toast.jsx'
import './ProductDetail.css'

const PLACEHOLDER = 'https://placehold.co/500x500/e8f5e9/2d6a4f?text=🌿'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { toast, showToast } = useToast()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        productAPI.getOne(id)
            .then(({ data }) => setProduct(data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [id])

    const handleAddToCart = async () => {
        setAdding(true)
        try {
            await addToCart(product.id, qty)
            showToast(`${product.product_name} added to cart!`, 'success')
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to add to cart', 'error')
        } finally { setAdding(false) }
    }

    const handleBuyNow = () => {
        navigate(`/checkout?product=${product.id}&qty=${qty}`)
    }

    if (loading) return <div className="page-loader"><div className="spinner" /></div>
    if (!product) return null

    const stock = Number(product.product_count || 0)
    const isOutOfStock = stock <= 0

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />
            <div className="container pd-container">
                <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="pd-grid">
                    {/* Image */}
                    <div className="pd-img-wrap">
                        <img
                            src={product.image_url || PLACEHOLDER}
                            alt={product.product_name}
                            className="pd-img"
                            onError={e => { e.target.src = PLACEHOLDER }}
                        />
                        <span className={`product-category-badge ${product.category}`}>
                            {product.category === 'oil' ? '🫙 Oil Product' : '🌾 Powder Mix'}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="pd-info">
                        <h1 className="pd-name">{product.product_name}</h1>

                        <div className="pd-meta">
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Quantity</span>
                                <span className="pd-meta-val">{product.quantity_value} {product.quantity_unit}</span>
                            </div>
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Stock</span>
                                <span className={`pd-meta-val ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
                                    {isOutOfStock ? '✕ Out of Stock' : `✓ ${product.product_count} available`}
                                </span>
                            </div>
                        </div>

                        <div className="pd-price">
                            ₹{Number(product?.price || 0).toFixed(2)}
                        </div>

                        {!isOutOfStock && (
                            <div className="pd-qty-row">
                                <span className="form-label">Quantity</span>
                                <div className="qty-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                    >−</button>
                                    <span className="qty-val">{qty}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQty(q => Math.min(product.product_count, q + 1))}
                                    >+</button>
                                </div>
                                <span className="pd-subtotal">
                                    = ₹{(Number(product?.price || 0) * Number(qty || 0)).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="pd-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || adding}
                            >
                                {adding ? 'Adding...' : '🛒 Add to Cart'}
                            </button>
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                            >
                                ⚡ Buy Now
                            </button>
                        </div>

                        <div className="pd-benefits">
                            <div className="pd-benefit">🌿 100% Natural</div>
                            <div className="pd-benefit">✅ Quality Guaranteed</div>
                            <div className="pd-benefit">🚚 Fast Delivery</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}