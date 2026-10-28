import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../../api/client'

const emptyForm = {
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock: '0',
    is_active: true,
}

export default function AdminProductForm() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const navigate = useNavigate()

    const [form, setForm] = useState(emptyForm)
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState(null)

    useEffect(() => {
        client.get('/admin/categories').then((res) => setCategories(res.data))
    }, [])

    useEffect(() => {
        if (!isEdit) return

        client
            .get(`/admin/products/${id}`)
            .then((res) => {
                const product = res.data.data
                setForm({
                    name: product.name,
                    category_id: String(product.category?.id ?? ''),
                    description: product.description ?? '',
                    price: String(product.price),
                    stock: String(product.stock),
                    is_active: product.is_active,
                })
                setImages(product.images ?? [])
            })
            .catch(() => setMessage({ type: 'error', text: 'Product not found.' }))
            .finally(() => setLoading(false))
    }, [id, isEdit])

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setErrors({})
        setMessage(null)

        const payload = {
            ...form,
            category_id: Number(form.category_id),
            price: Number(form.price),
            stock: Number(form.stock),
        }

        try {
            if (isEdit) {
                await client.put(`/admin/products/${id}`, payload)
                setMessage({ type: 'success', text: 'Product saved.' })
            } else {
                const res = await client.post('/admin/products', payload)
                navigate(`/admin/products/${res.data.data.id}/edit`)
            }
        } catch (err) {
            const data = err.response?.data

            if (data?.errors) {
                setErrors(data.errors)
            } else {
                setMessage({ type: 'error', text: data?.message ?? 'Something went wrong' })
            }
        } finally {
            setSaving(false)
        }
    }

    const handleUpload = async (e) => {
        const input = e.target
        const files = Array.from(input.files)
        if (files.length === 0) return

        const body = new FormData()
        files.forEach((file) => body.append('images[]', file))

        setUploading(true)
        setMessage(null)

        try {
            const res = await client.post(`/admin/products/${id}/images`, body)
            setImages(res.data.data.images ?? [])
        } catch (err) {
            const errs = err.response?.data?.errors
            setMessage({
                type: 'error',
                text: errs ? Object.values(errs)[0][0] : 'Upload failed',
            })
        } finally {
            setUploading(false)
            input.value = ''
        }
    }

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Delete this image?')) return

        try {
            await client.delete(`/admin/products/${id}/images/${imageId}`)
            setImages((current) => current.filter((image) => image.id !== imageId))
        } catch {
            setMessage({ type: 'error', text: 'Could not delete the image.' })
        }
    }

    const fieldError = (field) =>
        errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field][0]}</p>

    if (loading) return <p className="text-gray-500">Loading...</p>

    return (
        <div className="max-w-2xl">
            <Link to="/admin/products" className="mb-4 inline-block text-sm text-blue-600 underline">
                ← Back to products
            </Link>

            <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Edit product' : 'New product'}</h1>

            {message && (
                <p
                    className={`mb-4 rounded p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-600'
                        }`}
                >
                    {message.text}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        required
                        className="w-full rounded border bg-white px-3 py-2"
                    />
                    {fieldError('name')}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Category</label>
                    <select
                        value={form.category_id}
                        onChange={update('category_id')}
                        required
                        className="w-full rounded border bg-white px-3 py-2"
                    >
                        <option value="">Choose a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {fieldError('category_id')}
                    {categories.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                            No categories yet.{' '}
                            <Link to="/admin/categories" className="text-blue-600 underline">
                                Create one first
                            </Link>
                            .
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                        value={form.description}
                        onChange={update('description')}
                        rows={4}
                        className="w-full rounded border bg-white px-3 py-2"
                    />
                    {fieldError('description')}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price}
                            onChange={update('price')}
                            required
                            className="w-full rounded border bg-white px-3 py-2"
                        />
                        {fieldError('price')}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Stock</label>
                        <input
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={update('stock')}
                            required
                            className="w-full rounded border bg-white px-3 py-2"
                        />
                        {fieldError('stock')}
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Visible in the shop
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-black px-6 py-2 text-white disabled:opacity-50"
                >
                    {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
                </button>
            </form>

            {isEdit ? (
                <div className="mt-10 border-t pt-6">
                    <h2 className="mb-4 text-lg font-semibold">Images</h2>

                    {images.length === 0 && <p className="mb-4 text-sm text-gray-500">No images yet.</p>}

                    <div className="mb-4 flex flex-wrap gap-3">
                        {images.map((image) => (
                            <div key={image.id} className="relative h-24 w-24 overflow-hidden rounded border">
                                <img src={image.url} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(image.id)}
                                    className="absolute right-1 top-1 rounded bg-black/70 px-2 text-xs text-white"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Up to 5 files at a time, 2 MB each (jpg, png or webp).
                    </p>
                    {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
                </div>
            ) : (
                <p className="mt-6 text-sm text-gray-500">
                    You can add images after the product is created.
                </p>
            )}
        </div>
    )
}