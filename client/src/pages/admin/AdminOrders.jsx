import { useEffect, useState } from 'react'
import client from '../../api/client'

const filters = ['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

// The next steps an order can take, matching the rules in Laravel
const nextActions = {
    pending: [{ status: 'cancelled', label: 'Cancel' }],
    paid: [{ status: 'shipped', label: 'Mark as shipped' }],
    shipped: [{ status: 'delivered', label: 'Mark as delivered' }],
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [meta, setMeta] = useState(null)
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        setLoading(true)

        client
            .get('/admin/orders', { params: { status: status || undefined, page } })
            .then((res) => {
                setOrders(res.data.data)
                setMeta(res.data.meta)
                setError(null)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [status, page])

    const changeStatus = async (order, newStatus) => {
        setUpdatingId(order.id)
        setError(null)

        try {
            const res = await client.put(`/admin/orders/${order.id}/status`, { status: newStatus })
            setOrders((current) => current.map((o) => (o.id === order.id ? res.data.data : o)))
        } catch (err) {
            const errors = err.response?.data?.errors
            setError(errors ? Object.values(errors)[0][0] : 'Something went wrong')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Orders</h1>

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value)
                        setPage(1)
                    }}
                    className="rounded border bg-white px-3 py-2 text-sm"
                >
                    {filters.map((value) => (
                        <option key={value} value={value}>
                            {value === '' ? 'All statuses' : value}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && orders.length === 0 && <p className="text-gray-500">No orders found.</p>}

            {orders.length > 0 && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="p-3">Order</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Items</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-t align-top">
                                    <td className="p-3">
                                        <p className="font-semibold">#{order.id}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-3">
                                        <p>{order.customer?.name}</p>
                                        <p className="text-xs text-gray-500">{order.customer?.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {order.shipping.city}, {order.shipping.country}
                                        </p>
                                    </td>
                                    <td className="p-3">
                                        {order.items.map((item) => (
                                            <p key={item.id}>
                                                {item.name} × {item.quantity}
                                            </p>
                                        ))}
                                    </td>
                                    <td className="p-3 font-bold">${order.total}</td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {(nextActions[order.status] ?? []).map((action) => (
                                            <button
                                                key={action.status}
                                                onClick={() => changeStatus(order, action.status)}
                                                disabled={updatingId === order.id}
                                                className="rounded border px-3 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page <= 1}
                        className="rounded border bg-white px-4 py-2 disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span>
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= meta.last_page}
                        className="rounded border bg-white px-4 py-2 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}