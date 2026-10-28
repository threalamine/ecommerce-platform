import { useEffect, useState } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'

const PER_PAGE = 12

export default function Catalog() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [meta, setMeta] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [category, setCategory] = useState('')
    const [sort, setSort] = useState('newest')
    const [page, setPage] = useState(1)

    // Load categories once
    useEffect(() => {
        client.get('/categories').then((res) => setCategories(res.data))
    }, [])

    // Wait 400ms after the user stops typing before searching
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    // Load products whenever a filter changes
    useEffect(() => {
        setLoading(true)
        client
            .get('/products', {
                params: {
                    q: debouncedSearch || undefined,
                    category: category || undefined,
                    sort,
                    page,
                    per_page: PER_PAGE,
                },
            })
            .then((res) => {
                setProducts(res.data.data)
                setMeta(res.data.meta)
                setError(null)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [debouncedSearch, category, sort, page])

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Catalog</h1>

            <div className="mb-6 flex flex-wrap gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="min-w-60 flex-1 rounded border bg-white px-3 py-2"
                />

                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value)
                        setPage(1)
                    }}
                    className="rounded border bg-white px-3 py-2"
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value)
                        setPage(1)
                    }}
                    className="rounded border bg-white px-3 py-2"
                >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="name">Name</option>
                </select>
            </div>

            {error && <p className="text-red-600">Error: {error}</p>}
            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && !error && products.length === 0 && (
                <p className="text-gray-500">No products found.</p>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {meta && meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
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