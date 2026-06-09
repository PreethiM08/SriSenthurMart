import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI, transactionAPI } from '../services/api.js'
import './Payment.css'

function generateTxnId() {
    return 'TXN' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export default function Payment() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [step, setStep] = useState('form') // form | processing | success
    const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        orderAPI.getOne(orderId)
            .then(({ data }) => setOrder(data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false))
    }, [orderId])

    const formatCard = (val) => val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
    const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)

    const handleChange = (e) => {
        const { name, value } = e.target
        let v = value
        if (name === 'number') v = formatCard(value)
        if (name === 'expiry') v = formatExpiry(value)
        if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 3)
        setCardForm({ ...cardForm, [name]: v })
        setErrors({ ...errors, [name]: '' })
    }

    const validate = () => {
        const errs = {}
        if (!cardForm.name.trim()) errs.name = 'Required'
        if (cardForm.number.replace(/\s/g, '').length < 16) errs.number = 'Enter valid 16-digit card number'
        if (cardForm.expiry.length < 5) errs.expiry = 'Enter valid expiry'
        if (cardForm.cvv.length < 3) errs.cvv = 'Enter 3-digit CVV'
        return errs
    }

    const handlePay = async () => {
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setPaying(true)
        setStep('processing')

        // Simulate processing delay
        await new Promise(r => setTimeout(r, 2000))

        try {
            const txnId = generateTxnId()
            const { data } = await transactionAPI.create({
                order_id: parseInt(orderId),
                transaction_id: txnId,
                amount: order.total_amount,
                payment_status: 'success'
            })
            setStep('success')
            setTimeout(() => navigate(`/order-success/${orderId}?txn=${txnId}`), 1500)
        } catch {
            setStep('form')
            setPaying(false)
        }
    }

    if (loading) return <div className="page-loader"><div className="spinner" /></div>

    return (
        <div className="page-wrapper">
            <div className="payment-page">
                {step === 'processing' && (
                    <div className="payment-overlay">
                        <div className="processing-card">
                            <div className="processing-spinner" />
                            <h3>Processing Payment</h3>
                            <p>Please wait, do not close this window...</p>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="payment-overlay success">
                        <div className="processing-card">
                            <div className="success-icon">✓</div>
                            <h3>Payment Successful!</h3>
                            <p>Redirecting to order confirmation...</p>
                        </div>
                    </div>
                )}

                <div className="container payment-container">
                    <div className="payment-grid">
                        {/* Card Form */}
                        <div className="payment-card-section">
                            <div className="card payment-form-card">
                                <div className="payment-header">
                                    <h2>Secure Payment</h2>
                                    <div className="payment-secure-badge">🔒 SSL Encrypted</div>
                                </div>

                                {/* Card Preview */}
                                <div className="card-preview">
                                    <div className="card-preview-inner">
                                        <div className="card-chip">💳</div>
                                        <div className="card-number-preview">
                                            {cardForm.number || '•••• •••• •••• ••••'}
                                        </div>
                                        <div className="card-bottom">
                                            <div>
                                                <p className="card-label">Card Holder</p>
                                                <p className="card-value">{cardForm.name || 'YOUR NAME'}</p>
                                            </div>
                                            <div>
                                                <p className="card-label">Expires</p>
                                                <p className="card-value">{cardForm.expiry || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="payment-form">
                                    <div className="form-group">
                                        <label className="form-label">Cardholder Name</label>
                                        <input
                                            className={`form-input ${errors.name ? 'error' : ''}`}
                                            name="name" value={cardForm.name}
                                            onChange={handleChange} placeholder="John Doe"
                                        />
                                        {errors.name && <span className="form-error">{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Card Number</label>
                                        <input
                                            className={`form-input ${errors.number ? 'error' : ''}`}
                                            name="number" value={cardForm.number}
                                            onChange={handleChange} placeholder="1234 5678 9012 3456"
                                        />
                                        {errors.number && <span className="form-error">{errors.number}</span>}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Expiry Date</label>
                                            <input
                                                className={`form-input ${errors.expiry ? 'error' : ''}`}
                                                name="expiry" value={cardForm.expiry}
                                                onChange={handleChange} placeholder="MM/YY"
                                            />
                                            {errors.expiry && <span className="form-error">{errors.expiry}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">CVV</label>
                                            <input
                                                className={`form-input ${errors.cvv ? 'error' : ''}`}
                                                name="cvv" value={cardForm.cvv}
                                                onChange={handleChange} placeholder="123"
                                                type="password" maxLength={3}
                                            />
                                            {errors.cvv && <span className="form-error">{errors.cvv}</span>}
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-lg w-full"
                                        onClick={handlePay}
                                        disabled={paying}
                                    >
                                        {paying ? 'Processing...' : `💳 Pay ₹${Number(order?.total_amount).toFixed(2)}`}
                                    </button>

                                    <p className="payment-note">This is a mock payment — no real transaction occurs.</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="card payment-order-summary">
                            <h3 className="checkout-section-title">Order #{orderId}</h3>
                            <div className="checkout-items">
                                {order?.items?.map(item => (
                                    <div key={item.id} className="checkout-item">
                                        <div className="checkout-item-info">
                                            <p className="checkout-item-name">{item.product_name}</p>
                                            <p className="checkout-item-meta">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="checkout-item-price">₹{Number(item.subtotal).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-total" style={{ marginTop: 16 }}>
                                <span>Total</span>
                                <span>₹{Number(order?.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}