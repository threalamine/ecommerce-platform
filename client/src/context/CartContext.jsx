import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const emptyCart = { items: [], items_count: 0, total: 0 }

export function CartProvider({ children }) {
    const { user } = useAuth()
    const [cart, setCart] = useState(emptyCart)

    // Load the cart when a user logs in, clear it when they log out
    useEffect(() => {
        if (!user) {
        setCart(emptyCart)
        return
        }

        client.get('/cart').then((res) => setCart(res.data.data))
    }, [user])

    const addToCart = useCallback(async (productId, quantity = 1) => {
        const res = await client.post('/cart/items', {
        product_id: productId,
        quantity,
        })
        setCart(res.data.data)
    }, [])

    const updateQuantity = useCallback(async (itemId, quantity) => {
        const res = await client.put(`/cart/items/${itemId}`, { quantity })
        setCart(res.data.data)
    }, [])

    const removeItem = useCallback(async (itemId) => {
        const res = await client.delete(`/cart/items/${itemId}`)
        setCart(res.data.data)
    }, [])

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem }}>
        {children}
        </CartContext.Provider>
    )
    }

    export function useCart() {
    return useContext(CartContext)
}