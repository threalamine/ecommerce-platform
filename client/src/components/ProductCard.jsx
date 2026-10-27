export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="aspect-square bg-gray-100">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="mt-1 font-bold">${product.price}</p>
        {product.stock === 0 && <p className="text-sm text-red-600">Out of stock</p>}
      </div>
    </div>
  )
}