import { useEffect, useState } from 'react'
import client from '../../api/client'

const money = (value) => `$${Number(value).toFixed(2)}`

function StatCard({ label, value }) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
    )
}

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        client
            .get('/admin/stats')
            .then((res) => setStats(res.data))
            .catch((err) => setError(err.message))
    }, [])

    if (error) return <p className="text-red-600">Error: {error}</p>
    if (!stats) return <p className="text-gray-500">Loading...</p>

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Revenue" value={money(stats.revenue)} />
                <StatCard label="Orders" value={stats.orders_count} />
                <StatCard label="Customers" value={stats.customers_count} />
                <StatCard label="Products" value={stats.products_count} />
            </div>

            <div className="mt-6 rounded-lg border bg-white p-4">
                <h2 className="mb-3 font-semibold">Orders by status</h2>
                <div className="flex flex-wrap gap-3">
                    {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <div key={status} className="rounded bg-gray-100 px-3 py-2 text-sm">
                            <span className="capitalize">{status}</span>:{' '}
                            <span className="font-bold">{stats.orders_by_status[status] ?? 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                    <h2 className="mb-3 font-semibold">Top products</h2>
                    {stats.top_products.length === 0 ? (
                        <p className="text-sm text-gray-500">No sales yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2 text-right">Units</th>
                                    <th className="pb-2 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.top_products.map((product) => (
                                    <tr key={product.name} className="border-t">
                                        <td className="py-2">{product.name}</td>
                                        <td className="py-2 text-right">{product.units_sold}</td>
                                        <td className="py-2 text-right">{money(product.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <h2 className="mb-3 font-semibold">Low stock</h2>
                    {stats.low_stock.length === 0 ? (
                        <p className="text-sm text-gray-500">All products have enough stock.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {stats.low_stock.map((product) => (
                                <li key={product.id} className="flex justify-between border-t pt-2">
                                    <span>{product.name}</span>
                                    <span className={product.stock === 0 ? 'font-bold text-red-600' : 'font-bold'}>
                                        {product.stock} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}