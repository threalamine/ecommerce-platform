import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Cart() {
    const { user, loading } = useAuth()
    const { cart, updateQuantity, removeItem } = useCart()
    const [error, setError] = useState(null)

    if (loading) return <p className="text-gray-500">Loading...</p>
    if (!user) return <Navigate to="/login" replace />

    const handleQuantity = async (item, quantity) => {
        setError(null)
        try {
        await updateQuantity(item.id, quantity)
        } catch (err) {
        const errors = err.response?.data?.errors
        setError(errors ? Object.values(errors)[0][0] : 'Something went wrong')
        }
    }

    if (cart.items.length === 0) {
        return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
            <p className="mb-4 text-gray-600">Your cart is empty.</p>
            <Link to="/" className="text-blue-600 underline">
            Continue shopping
            </Link>
        </div>
        )
    }

    return (
        <div>
        <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
            {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-white p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                {item.product.image && (
                    <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    />
                )}
                </div>

                <div className="flex-1">
                <Link to={`/products/${item.product.slug}`} className="font-semibold underline">
                    {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">${item.product.price} each</p>
                </div>

                <div className="flex items-center gap-2">
                <button
                    onClick={() => handleQuantity(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 rounded border disabled:opacity-40"
                >
                    −
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                    onClick={() => handleQuantity(item, item.quantity + 1)}
                    className="h-8 w-8 rounded border"
                >
                    +
                </button>
                </div>

                <p className="w-24 text-right font-bold">${item.line_total}</p>

                <button onClick={() => removeItem(item.id)} className="text-sm text-red-600 underline">
                Remove
                </button>
            </div>
            ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg border bg-white p-4">
            <p className="text-lg">
            Total: <span className="font-bold">${cart.total}</span>
            </p>
            <Link to="/checkout" className="rounded bg-black px-6 py-3 text-white">
            Checkout
            </Link>
        </div>
        </div>
    )
}