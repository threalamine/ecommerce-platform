import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const fields = [
    { name: 'shipping_name', label: 'Full name' },
    { name: 'shipping_phone', label: 'Phone' },
    { name: 'shipping_address', label: 'Address' },
    { name: 'shipping_city', label: 'City' },
    { name: 'shipping_postal_code', label: 'Postal code' },
    { name: 'shipping_country', label: 'Country' },
]

export default function Checkout() {
    const { user, loading } = useAuth()
    const { cart } = useCart()

    const [form, setForm] = useState({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country: '',
    })
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    if (loading) return <p className="text-gray-500">Loading...</p>
    if (!user) return <Navigate to="/login" replace />

    if (cart.items.length === 0) {
        return (
            <div>
                <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
                <p className="mb-4 text-gray-600">Your cart is empty.</p>
                <Link to="/" className="text-blue-600 underline">
                    Continue shopping
                </Link>
            </div>
        )
    }

    const update = (name) => (e) => setForm({ ...form, [name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            // 1. Create the order from the cart
            const orderRes = await client.post('/orders', form)
            const orderId = orderRes.data.data.id

            // 2. Ask Laravel for the Stripe payment page
            const payRes = await client.post(`/orders/${orderId}/checkout`)

            // 3. Send the customer to Stripe
            window.location.href = payRes.data.url
        } catch (err) {
            const data = err.response?.data
            setError(data?.errors ? Object.values(data.errors)[0][0] : (data?.message ?? 'Something went wrong'))
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-lg font-semibold">Shipping details</h2>

                    {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                    {fields.map((field) => (
                        <input
                            key={field.name}
                            type="text"
                            value={form[field.name]}
                            onChange={update(field.name)}
                            placeholder={field.label}
                            required
                            className="w-full rounded border bg-white px-3 py-2"
                        />
                    ))}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
                    >
                        {submitting ? 'Redirecting to payment...' : 'Place order and pay'}
                    </button>
                </form>

                <div className="h-fit rounded-lg border bg-white p-4">
                    <h2 className="mb-4 text-lg font-semibold">Order summary</h2>

                    <div className="space-y-2">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>
                                    {item.product.name} × {item.quantity}
                                </span>
                                <span>${item.line_total}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                        <span>Total</span>
                        <span>${cart.total}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}