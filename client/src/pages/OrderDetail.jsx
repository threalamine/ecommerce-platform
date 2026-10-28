import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetail() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const justPaid = searchParams.get('paid') === '1'

    const { user, loading: authLoading } = useAuth()
    const { refreshCart } = useCart()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!user) return

        let cancelled = false
        let attempts = 0
        let timer

        const load = async () => {
        try {
            const res = await client.get(`/orders/${id}`)
            if (cancelled) return

            const data = res.data.data
            setOrder(data)
            setLoading(false)

            if (data.status === 'paid') {
            refreshCart()
            } else if (justPaid && data.status === 'pending' && attempts < 10) {
            // The webhook may arrive a moment after the redirect: check again
            attempts += 1
            timer = setTimeout(load, 2000)
            }
        } catch (err) {
            if (cancelled) return
            if (err.response?.status === 404) setNotFound(true)
            setLoading(false)
        }
        }

        load()

        return () => {
        cancelled = true
        clearTimeout(timer)
        }
    }, [id, user, justPaid, refreshCart])

    if (authLoading || loading) return <p className="text-gray-500">Loading...</p>
    if (!user) return <Navigate to="/login" replace />

    if (notFound || !order) {
        return (
        <div>
            <p className="mb-4">Order not found.</p>
            <Link to="/" className="text-blue-600 underline">
            Back to catalog
            </Link>
        </div>
        )
    }

    return (
        <div>
        {justPaid && order.status === 'paid' && (
            <p className="mb-6 rounded bg-green-50 p-4 text-green-800">
            Payment received. Thank you for your order!
            </p>
        )}

        {justPaid && order.status === 'pending' && (
            <p className="mb-6 rounded bg-yellow-50 p-4 text-yellow-800">
            We are confirming your payment. This page updates by itself.
            </p>
        )}

        <div className="mb-6 flex items-center gap-3">
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
                statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'
            }`}
            >
            {order.status}
            </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold">Items</h2>

            <div className="space-y-2">
                {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                    <span>
                    {item.name} × {item.quantity}
                    </span>
                    <span>${item.line_total}</span>
                </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                <span>Total</span>
                <span>${order.total}</span>
            </div>
            </div>

            <div className="rounded-lg border bg-white p-4 text-sm">
            <h2 className="mb-4 text-lg font-semibold">Shipping</h2>
            <p>{order.shipping.name}</p>
            <p>{order.shipping.address}</p>
            <p>
                {order.shipping.postal_code} {order.shipping.city}
            </p>
            <p>{order.shipping.country}</p>
            <p className="mt-2 text-gray-500">{order.shipping.phone}</p>
            </div>
        </div>

        <Link to="/" className="mt-6 inline-block text-blue-600 underline">
            Continue shopping
        </Link>
        </div>
    )
}