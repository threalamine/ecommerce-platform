import { useEffect, useState } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'

const PER_PAGE = 12

function SkeletonCard() {
    return (
        <div className="card overflow-hidden">
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    )
}

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

    const pillClass = (active) =>
        `rounded-full px-4 py-1.5 text-sm font-medium transition ${active
            ? 'bg-brand-600 text-white'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`

    const showSkeleton = loading && products.length === 0

    return (
        <div>
            <section className="mb-8 rounded-2xl bg-brand-600 px-6 py-10 text-white sm:px-10 sm:py-14">
                <h1 className="text-3xl font-bold sm:text-4xl">Find your next favorite thing</h1>
                <p className="mt-3 max-w-xl text-brand-100">
                    Browse the collection, filter by category and check out securely.
                </p>
            </section>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="input flex-1"
                />

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value)
                        setPage(1)
                    }}
                    className="input sm:w-56"
                >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="name">Name</option>
                </select>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => {
                        setCategory('')
                        setPage(1)
                    }}
                    className={pillClass(category === '')}
                >
                    All
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => {
                            setCategory(c.slug)
                            setPage(1)
                        }}
                        className={pillClass(category === c.slug)}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">Error: {error}</p>}

            {!loading && !error && products.length === 0 && (
                <div className="card p-10 text-center text-gray-500">
                    No products found. Try another search or category.
                </div>
            )}

            {showSkeleton ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            ) : (
                <div
                    className={`grid grid-cols-2 gap-4 transition-opacity md:grid-cols-3 lg:grid-cols-4 ${loading ? 'opacity-60' : ''
                        }`}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page <= 1}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= meta.last_page}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}