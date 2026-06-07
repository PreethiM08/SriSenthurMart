import { useState, useEffect, useRef } from 'react'
import { productAPI } from '../../services/api.js'
import { Toast, useToast } from '../../utils/toast.jsx'
import './Admin.css'

const PLACEHOLDER = 'https://placehold.co/80x80/e8f5e9/2d6a4f?text=🌿'
const EMPTY_FORM = {
    product_name: '', category: 'oil', price: '',
    quantity_value: '', quantity_unit: 'liter',
    product_count: '', stock: '', image: null, is_active: true
}

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null) // null | 'add' | 'edit'
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('')
    const [imgPreview, setImgPreview] = useState(null)
    const fileRef = useRef()
    const { toast, showToast } = useToast()

    useEffect(() => { loadProducts() }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const { data } = await productAPI.adminGetAll()
            setProducts(data.results || data)
        } catch { showToast('Failed to load products', 'error') }
        finally { setLoading(false) }
    }

    const openAdd = () => {
        setForm(EMPTY_FORM); setEditId(null); setErrors({})
        setImgPreview(null); setModal('add')
    }

    const openEdit = (p) => {
        setForm({
            product_name: p.product_name, category: p.category,
            price: p.price, quantity_value: p.quantity_value,
            quantity_unit: p.quantity_unit, product_count: p.product_count,
            stock: p.stock, image: null, is_active: p.is_active
        })
        setImgPreview(p.image_url || null)
        setEditId(p.id); setErrors({}); setModal('edit')
    }

    const closeModal = () => { setModal(null); setImgPreview(null) }

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target
        if (type === 'file') {
            const file = files[0]
            setForm({ ...form, image: file })
            setImgPreview(file ? URL.createObjectURL(file) : null)
        } else {
            setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
        }
        setErrors({ ...errors, [name]: '' })
    }

    const validate = () => {
        const errs = {}
        if (!form.product_name.trim()) errs.product_name = 'Required'
        if (!form.price || isNaN(form.price) || +form.price <= 0) errs.price = 'Valid price required'
        if (!form.quantity_value || isNaN(form.quantity_value)) errs.quantity_value = 'Required'
        if (!form.stock && form.stock !== 0) errs.stock = 'Required'
        return errs
    }

    const handleSave = async () => {
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setSaving(true)
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'image' && !v) return
                fd.append(k, v)
            })
            if (modal === 'add') {
                await productAPI.create(fd)
                showToast('Product added successfully', 'success')
            } else {
                await productAPI.update(editId, fd)
                showToast('Product updated successfully', 'success')
            }
            closeModal()
            loadProducts()
        } catch (err) {
            const data = err.response?.data || {}
            setErrors(data)
            showToast('Failed to save product', 'error')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return
        try {
            await productAPI.delete(id)
            showToast('Product deleted', 'warning')
            loadProducts()
        } catch { showToast('Failed to delete', 'error') }
    }

    const filtered = products.filter(p => {
        const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase())
        const matchCat = !catFilter || p.category === catFilter
        return matchSearch && matchCat
    })

    return (
        <div className="page-wrapper">
            <Toast toast={toast} />

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-form">
                            {/* Image */}
                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <div className="img-upload-row">
                                    {imgPreview && <img src={imgPreview} className="img-preview" alt="preview" onError={e => { e.target.src = PLACEHOLDER }} />}
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                                        📷 {imgPreview ? 'Change Image' : 'Upload Image'}
                                    </button>
                                    <input ref={fileRef} type="file" name="image" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input className={`form-input ${errors.product_name ? 'error' : ''}`} name="product_name" value={form.product_name} onChange={handleChange} placeholder="e.g. Groundnut Oil" />
                                    {errors.product_name && <span className="form-error">{errors.product_name}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                                        <option value="oil">Oil Products</option>
                                        <option value="powder">Powder Mix Products</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row-3">
                                <div className="form-group">
                                    <label className="form-label">Price (₹) *</label>
                                    <input className={`form-input ${errors.price ? 'error' : ''}`} name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="250.00" />
                                    {errors.price && <span className="form-error">{errors.price}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Quantity Value *</label>
                                    <input className={`form-input ${errors.quantity_value ? 'error' : ''}`} name="quantity_value" type="number" step="0.001" value={form.quantity_value} onChange={handleChange} placeholder="1" />
                                    {errors.quantity_value && <span className="form-error">{errors.quantity_value}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Quantity Unit *</label>
                                    <select className="form-select" name="quantity_unit" value={form.quantity_unit} onChange={handleChange}>
                                        <option value="liter">Liter</option>
                                        <option value="kg">Kg</option>
                                        <option value="gram">Gram</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Product Count</label>
                                    <input className="form-input" name="product_count" type="number" value={form.product_count} onChange={handleChange} placeholder="1" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock *</label>
                                    <input className={`form-input ${errors.stock ? 'error' : ''}`} name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="100" />
                                    {errors.stock && <span className="form-error">{errors.stock}</span>}
                                </div>
                            </div>

                            <label className="form-checkbox">
                                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                                <span>Active (visible to customers)</span>
                            </label>

                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container admin-layout">
                <div className="section-header">
                    <h1 className="section-title">Product Management</h1>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <input className="form-input search-input-sm" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="form-select" style={{ width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="oil">Oil Products</option>
                        <option value="powder">Powder Mix</option>
                    </select>
                    <span className="results-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div className="page-loader"><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No products found</td></tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <img src={p.image_url || PLACEHOLDER} alt={p.product_name} className="img-preview" onError={e => { e.target.src = PLACEHOLDER }} />
                                        </td>
                                        <td><strong>{p.product_name}</strong></td>
                                        <td>
                                            <span className={`badge ${p.category === 'oil' ? 'badge-warning' : 'badge-primary'}`}>
                                                {p.category === 'oil' ? '🫙 Oil' : '🌾 Powder'}
                                            </span>
                                        </td>
                                        <td>₹{Number(p.price).toFixed(2)}</td>
                                        <td>{p.quantity_value} {p.quantity_unit}</td>
                                        <td>
                                            <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                                                {p.stock === 0 ? 'Out of Stock' : `${p.stock}`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.is_active ? 'badge-success' : 'badge-muted'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-table-actions">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.product_name)}>🗑</button>
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