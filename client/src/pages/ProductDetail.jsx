import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addToCart } = useCart()

    const [product, setProduct] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [adding, setAdding] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        setLoading(true)
        setNotFound(false)
        setActiveImage(0)
        setMessage(null)

        client
            .get(`/products/${slug}`)
            .then((res) => setProduct(res.data.data))
            .catch((err) => {
                if (err.response?.status === 404) setNotFound(true)
            })
            .finally(() => setLoading(false))
    }, [slug])

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        setAdding(true)
        setMessage(null)

        try {
            await addToCart(product.id, 1)
            setMessage({ type: 'success', text: 'Added to cart.' })
        } catch (err) {
            const errors = err.response?.data?.errors
            setMessage({
                type: 'error',
                text: errors ? Object.values(errors)[0][0] : 'Something went wrong',
            })
        } finally {
            setAdding(false)
        }
    }

    if (loading) return <p className="text-gray-500">Loading...</p>

    if (notFound || !product) {
        return (
            <div>
                <p className="mb-4">Product not found.</p>
                <Link to="/" className="text-blue-600 underline">
                    Back to catalog
                </Link>
            </div>
        )
    }

    const images = product.images ?? []
    const inStock = product.stock > 0

    return (
        <div>
            <Link to="/" className="mb-6 inline-block text-sm text-blue-600 underline">
                ← Back to catalog
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <div className="aspect-square overflow-hidden rounded-lg border bg-gray-100">
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage].url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                No image
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-3 flex gap-2">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setActiveImage(index)}
                                    className={`h-16 w-16 overflow-hidden rounded border-2 ${index === activeImage ? 'border-black' : 'border-transparent'
                                        }`}
                                >
                                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                    <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
                    <p className="mt-4 text-2xl font-bold">${product.price}</p>

                    <p className="mt-4 text-gray-700">
                        {product.description || 'No description available.'}
                    </p>

                    <p className={`mt-4 text-sm ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                        {inStock ? `${product.stock} in stock` : 'Out of stock'}
                    </p>

                    <button
                        onClick={handleAddToCart}
                        disabled={!inStock || adding}
                        className="mt-6 w-full rounded bg-black px-6 py-3 text-white disabled:opacity-50 md:w-auto"
                    >
                        {adding ? 'Adding...' : 'Add to cart'}
                    </button>

                    {message && (
                        <p
                            className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-600'
                                }`}
                        >
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}