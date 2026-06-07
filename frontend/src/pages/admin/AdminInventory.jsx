import { useState, useEffect } from 'react'
import { productAPI } from '../../services/api.js'
import { Toast, useToast } from '../../utils/toast.jsx'
import './Admin.css'

export default function AdminInventory() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [addStock, setAddStock] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [history, setHistory] = useState([])
    const [historyModal, setHistoryModal] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(false)
    const { toast, showToast } = useToast()

    useEffect(() => { loadProducts() }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const { data } = await productAPI.adminGetAll()
            setProducts(data.results || data)
        } catch { showToast('Failed to load', 'error') }
        finally { setLoading(false) }
    }

    const openStockModal = (p) => {
        setSelectedProduct(p)
        setAddStock('')
        setNote('')
        setModal(true)
    }

    const handleUpdateStock = async () => {
        const qty = parseInt(addStock)
        if (!qty || qty < 1) { showToast('Enter a valid quantity', 'error'); return }
        setSaving(true)
        try {
            await productAPI.updateStock(selectedProduct.id, { added_stock: qty, note })
            showToast(`+${qty} stock added to ${selectedProduct.product_name}`, 'success')
            setModal(false)
            loadProducts()
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update stock', 'error')
        } finally { setSaving(false) }
    }

    const viewHistory = async (p) => {
        setSelectedProduct(p)
        setHistoryModal(true)
        setHistoryLoading(true)
        try {
            const { data } = await productAPI.getStockHistory(p.id)
            setHistory(data.results || data)
        } catch { showToast('Failed to load history', 'error') }
        finally { setHistoryLoading(false) }
    }

    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10)
    const outOfStock = products.filter(p => p.stock === 0)

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />

            {/* Stock Update Modal */}
            {modal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">📦 Update Stock</h3>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <div className="modal-form">
                            <div className="stock-product-info">
                                <p className="stock-product-name">{selectedProduct.product_name}</p>
                                <p className="stock-current">Current Stock: <strong>{selectedProduct.stock}</strong> units</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity to Add *</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="1"
                                    value={addStock}
                                    onChange={e => setAddStock(e.target.value)}
                                    placeholder="e.g. 20"
                                    autoFocus
                                />
                                {addStock && parseInt(addStock) > 0 && (
                                    <p className="stock-new-preview">
                                        New Stock: <strong>{selectedProduct.stock + parseInt(addStock)}</strong> units
                                    </p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Note (optional)</label>
                                <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Restocked from supplier" />
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleUpdateStock} disabled={saving}>
                                    {saving ? 'Updating...' : '✓ Update Stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyModal && (
                <div className="modal-overlay" onClick={() => setHistoryModal(false)}>
                    <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">📋 Stock History — {selectedProduct?.product_name}</h3>
                            <button className="modal-close" onClick={() => setHistoryModal(false)}>✕</button>
                        </div>
                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" /></div>
                        ) : history.length === 0 ? (
                            <div className="empty-state" style={{ padding: 32 }}>
                                <div className="icon">📋</div>
                                <p>No stock history yet</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Date</th><th>Previous</th><th>Added</th><th>New Stock</th><th>Note</th></tr>
                                    </thead>
                                    <tbody>
                                        {history.map(h => (
                                            <tr key={h.id}>
                                                <td>{new Date(h.created_at).toLocaleDateString('en-IN')}</td>
                                                <td>{h.previous_stock}</td>
                                                <td><span className="badge badge-success">+{h.added_stock}</span></td>
                                                <td><strong>{h.new_stock}</strong></td>
                                                <td style={{ color: 'var(--text-muted)' }}>{h.note || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="container admin-layout">
                <div className="section-header">
                    <h1 className="section-title">Inventory Management</h1>
                </div>

                {/* Alert Banners */}
                {outOfStock.length > 0 && (
                    <div className="inv-alert danger">
                        ❌ <strong>{outOfStock.length}</strong> product{outOfStock.length !== 1 ? 's are' : ' is'} out of stock!
                    </div>
                )}
                {lowStock.length > 0 && (
                    <div className="inv-alert warning">
                        ⚠️ <strong>{lowStock.length}</strong> product{lowStock.length !== 1 ? 's have' : ' has'} low stock (under 10 units).
                    </div>
                )}

                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Current Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className={p.stock === 0 ? 'row-danger' : p.stock < 10 ? 'row-warning' : ''}>
                                        <td><strong>{p.product_name}</strong></td>
                                        <td>
                                            <span className={`badge ${p.category === 'oil' ? 'badge-warning' : 'badge-primary'}`}>
                                                {p.category === 'oil' ? '🫙 Oil' : '🌾 Powder'}
                                            </span>
                                        </td>
                                        <td>₹{Number(p.price).toFixed(2)}</td>
                                        <td>
                                            <span className="stock-number">{p.stock}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.stock === 0 ? 'badge-danger' :
                                                p.stock < 10 ? 'badge-warning' : 'badge-success'
                                                }`}>
                                                {p.stock === 0 ? '❌ Out of Stock' :
                                                    p.stock < 10 ? '⚠️ Low Stock' : '✓ In Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-table-actions">
                                                <button className="btn btn-primary btn-sm" onClick={() => openStockModal(p)}>
                                                    + Add Stock
                                                </button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => viewHistory(p)}>
                                                    📋 History
                                                </button>
                                            </div>
                                        </td>
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