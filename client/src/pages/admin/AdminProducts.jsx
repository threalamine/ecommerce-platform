import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [meta, setMeta] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [reloadKey, setReloadKey] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Wait 400ms after the user stops typing before searching
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        setLoading(true)

        client
            .get('/admin/products', { params: { q: debouncedSearch || undefined, page } })
            .then((res) => {
                setProducts(res.data.data)
                setMeta(res.data.meta)
                setError(null)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [debouncedSearch, page, reloadKey])

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? This also deletes its images.`)) return

        setError(null)

        try {
            await client.delete(`/admin/products/${product.id}`)

            if (products.length === 1 && page > 1) {
                setPage((p) => p - 1)
            } else {
                setReloadKey((k) => k + 1)
            }
        } catch (err) {
            setError(err.response?.data?.message ?? 'Something went wrong')
        }
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link to="/admin/products/new" className="rounded bg-black px-4 py-2 text-sm text-white">
                    New product
                </Link>
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="mb-4 w-full rounded border bg-white px-3 py-2"
            />

            {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && products.length === 0 && <p className="text-gray-500">No products found.</p>}

            {products.length > 0 && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="p-3">Product</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-t">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                                                {product.images?.[0] && (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">{product.category?.name}</td>
                                    <td className="p-3">${product.price}</td>
                                    <td
                                        className={`p-3 ${product.stock <= 5 ? 'font-bold text-red-600' : ''}`}
                                    >
                                        {product.stock}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${product.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {product.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="space-x-2 whitespace-nowrap p-3">
                                        <Link
                                            to={`/admin/products/${product.id}/edit`}
                                            className="rounded border px-3 py-1 text-xs hover:bg-gray-100"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
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