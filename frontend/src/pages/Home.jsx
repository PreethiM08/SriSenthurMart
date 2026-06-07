import { useState, useEffect } from 'react'
import { productAPI } from '../services/api.js'
import ProductCard from '../components/ProductCard.jsx'
import { Toast, useToast } from '../utils/toast.jsx'
import './Home.css'

const CATEGORIES = [
    { value: '', label: 'All Products', icon: '🌟' },
    { value: 'oil', label: 'Oil Products', icon: '🫙' },
    { value: 'powder', label: 'Powder Mix', icon: '🌾' },
]

export default function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')
    const { toast, showToast } = useToast()

    useEffect(() => {
        const timeout = setTimeout(() => loadProducts(), 300)
        return () => clearTimeout(timeout)
    }, [category, search, sort])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const params = {}
            if (category) params.category = category
            if (search) params.search = search
            if (sort) params.ordering = sort
            const { data } = await productAPI.getAll(params)
            setProducts(data.results || data)
        } catch {
            showToast('Failed to load products', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />

            {/* Hero */}
            <div className="home-hero">
                <div className="container">
                    <p className="hero-eyebrow">100% Natural & Organic</p>
                    <h1 className="hero-title">
                        Pure Oils &<br />Powder Mixes
                    </h1>
                    <p className="hero-sub">Cold-pressed, stone-ground, and traditionally made for your kitchen.</p>
                </div>
            </div>

            <div className="container home-content">
                {/* Controls */}
                <div className="home-controls">
                    <div className="category-tabs">
                        {CATEGORIES.map(c => (
                            <button
                                key={c.value}
                                className={`cat-tab ${category === c.value ? 'active' : ''}`}
                                onClick={() => setCategory(c.value)}
                            >
                                {c.icon} {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="search-sort">
                        <div className="search-wrap">
                            <span className="search-icon">🔍</span>
                            <input
                                className="search-input"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                            )}
                        </div>
                        <select className="form-select sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="">Sort by</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="product_name">Name A–Z</option>
                            <option value="-created_at">Newest</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🌿</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <>
                        <p className="results-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                        <div className="products-grid">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} onToast={showToast} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}