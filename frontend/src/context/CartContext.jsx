import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const { user, isAdmin } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [cartSummary, setCartSummary] = useState({ products_count: 0, grand_total: 0 })
    const [loading, setLoading] = useState(false)

    const fetchCart = useCallback(async () => {
        if (!user || isAdmin) return
        setLoading(true)
        try {
            const { data } = await cartAPI.get()
            setCartItems(data.items)
            setCartSummary({
                products_count: data.products_count || 0,
                grand_total: data.total_amount || 0
            })
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }, [user, isAdmin])

    useEffect(() => { fetchCart() }, [fetchCart])

    const addToCart = useCallback(async (product_id, quantity = 1) => {
        const { data } = await cartAPI.add({ product_id, quantity })
        await fetchCart()
        return data
    }, [fetchCart])

    const updateCart = useCallback(async (itemId, quantity) => {
        await cartAPI.update(itemId, { quantity })
        await fetchCart()
    }, [fetchCart])

    const removeFromCart = useCallback(async (itemId) => {
        await cartAPI.remove(itemId)
        await fetchCart()
    }, [fetchCart])

    const clearCart = useCallback(async () => {
        await cartAPI.clear()
        setCartItems([])
        setCartSummary({ products_count: 0, grand_total: 0 })
    }, [])

    return (
        <CartContext.Provider value={{
            cartItems, cartSummary, loading,
            fetchCart, addToCart, updateCart, removeFromCart, clearCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext)
    // Return safe defaults if context isn't ready yet
    if (!ctx) return {
        cartItems: [],
        cartSummary: { products_count: 0, grand_total: 0 },
        loading: false,
        fetchCart: () => { },
        addToCart: () => { },
        updateCart: () => { },
        removeFromCart: () => { },
        clearCart: () => { }
    }
    return ctx
}