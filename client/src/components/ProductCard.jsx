import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
    const image = product.images?.[0]?.url

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                    </div>
                )}

                {product.stock === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                        Out of stock
                    </span>
                )}
            </div>

            <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                    {product.category?.name}
                </p>
                <h3 className="mt-1 line-clamp-1 font-semibold">{product.name}</h3>
                <p className="mt-2 text-lg font-bold">${product.price}</p>
            </div>
        </Link>
    )
}