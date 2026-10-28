import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function Orders() {
    const { user, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return

        client
            .get('/orders')
            .then((res) => setOrders(res.data.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user])

    if (authLoading || (user && loading)) return <p className="text-gray-500">Loading...</p>
    if (!user) return <Navigate to="/login" replace />
    if (error) return <p className="text-red-600">Error: {error}</p>

    if (orders.length === 0) {
        return (
            <div>
                <h1 className="mb-4 text-2xl font-bold">My orders</h1>
                <p className="mb-4 text-gray-600">You have no orders yet.</p>
                <Link to="/" className="text-blue-600 underline">
                    Start shopping
                </Link>
            </div>
        )
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">My orders</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="flex items-center justify-between rounded-lg border bg-white p-4 hover:shadow-md"
                    >
                        <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()} · {order.items.length}{' '}
                                {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {order.status}
                            </span>
                            <span className="font-bold">${order.total}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}