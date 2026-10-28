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
                <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
                <div className="card p-10 text-center">
                    <p className="mb-4 text-gray-600">Your cart is empty.</p>
                    <Link to="/" className="btn btn-primary">
                        Continue shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
                {cart.items.map((item) => (
                    <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Product: image, name and unit price */}
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {item.product.image && (
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="min-w-0">
                                <Link
                                    to={`/products/${item.product.slug}`}
                                    className="font-semibold hover:text-brand-600"
                                >
                                    {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500">${item.product.price} each</p>
                            </div>
                        </div>

                        {/* Controls: quantity, line total and remove */}
                        <div className="flex items-center justify-between gap-4 border-t pt-3 sm:justify-end sm:gap-6 sm:border-t-0 sm:pt-0">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleQuantity(item, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                                >
                                    −
                                </button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantity(item, item.quantity + 1)}
                                    className="h-8 w-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>

                            <p className="min-w-16 text-right font-bold">${item.line_total}</p>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-sm font-medium text-red-600 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card mt-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg">
                    Total: <span className="font-bold">${cart.total}</span>
                </p>
                <Link to="/checkout" className="btn btn-primary w-full px-6 py-3 sm:w-auto">
                    Checkout
                </Link>
            </div>
        </div>
    )
}