import { useEffect, useState } from 'react'
import client from '../../api/client'

const firstError = (err) => {
    const errors = err.response?.data?.errors
    return errors ? Object.values(errors)[0][0] : (err.response?.data?.message ?? 'Something went wrong')
}

export default function AdminCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    const load = () =>
        client
            .get('/admin/categories')
            .then((res) => setCategories(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))

    useEffect(() => {
        load()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            await client.post('/admin/categories', { name })
            setName('')
            await load()
        } catch (err) {
            setError(firstError(err))
        } finally {
            setSaving(false)
        }
    }

    const startEdit = (category) => {
        setEditingId(category.id)
        setEditingName(category.name)
        setError(null)
    }

    const handleUpdate = async (id) => {
        setError(null)

        try {
            await client.put(`/admin/categories/${id}`, { name: editingName })
            setEditingId(null)
            await load()
        } catch (err) {
            setError(firstError(err))
        }
    }

    const handleDelete = async (category) => {
        const warning =
            category.products_count > 0
                ? `Deleting "${category.name}" will also delete its ${category.products_count} product(s). Continue?`
                : `Delete "${category.name}"?`

        if (!window.confirm(warning)) return

        setError(null)

        try {
            await client.delete(`/admin/categories/${category.id}`)
            await load()
        } catch (err) {
            setError(firstError(err))
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Categories</h1>

            <form onSubmit={handleCreate} className="mb-6 flex gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New category name"
                    required
                    className="flex-1 rounded border bg-white px-3 py-2"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {saving ? 'Adding...' : 'Add'}
                </button>
            </form>

            {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="text-gray-500">Loading...</p>}

            {!loading && categories.length === 0 && (
                <p className="text-gray-500">No categories yet. Add your first one above.</p>
            )}

            {categories.length > 0 && (
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Slug</th>
                                <th className="p-3">Products</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="border-t">
                                    <td className="p-3">
                                        {editingId === category.id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="w-full rounded border px-2 py-1"
                                            />
                                        ) : (
                                            category.name
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-500">{category.slug}</td>
                                    <td className="p-3">{category.products_count}</td>
                                    <td className="space-x-2 p-3">
                                        {editingId === category.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(category.id)}
                                                    className="rounded bg-black px-3 py-1 text-xs text-white"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="rounded border px-3 py-1 text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(category)}
                                                    className="rounded border px-3 py-1 text-xs hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}