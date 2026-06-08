import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import './ProductCard.css'

const PLACEHOLDER = 'https://placehold.co/300x300/e8f5e9/2d6a4f?text=🌿'

export default function ProductCard({ product, onToast }) {
    const { addToCart } = useCart()
    const navigate = useNavigate()
    const [adding, setAdding] = useState(false)

    const isOutOfStock = product.product_count === 0

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        if (isOutOfStock) return
        setAdding(true)
        try {
            await addToCart(product.id, 1)
            onToast?.(`${product.product_name} added to cart`, 'success')
        } catch (err) {
            onToast?.(err.response?.data?.error || 'Failed to add to cart', 'error')
        } finally {
            setAdding(false)
        }
    }

    const handleBuyNow = (e) => {
        e.stopPropagation()
        navigate(`/checkout?product=${product.id}&qty=1`)
    }

    return (
        <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
            <div className="product-img-wrap">
                <img
                    src={product.image_url || PLACEHOLDER}
                    alt={product.product_name}
                    className="product-img"
                    onError={(e) => { e.target.src = PLACEHOLDER }}
                />
                <span className={`product-category-badge ${product.category}`}>
                    {product.category === 'oil' ? '🫙 Oil' : '🌾 Powder'}
                </span>
                {isOutOfStock && <div className="out-of-stock-overlay">Out of Stock</div>}
            </div>

            <div className="product-body">
                <h3 className="product-name">{product.product_name}</h3>
                <p className="product-qty">{product.quantity_value} {product.quantity_unit}</p>

                <div className="product-footer">
                    <div className="product-price-block">
                        <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
                        <span className={`stock-badge ${isOutOfStock ? 'out' : 'in'}`}>
                            {isOutOfStock ? 'Out of Stock' : `${product.product_count} left`}
                        </span>
                    </div>

                    <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                        >
                            Buy Now
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || adding}
                        >
                            {adding ? '...' : '🛒'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}