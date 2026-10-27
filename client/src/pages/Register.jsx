import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
        await register(form)
        navigate('/')
        } catch (err) {
        const errors = err.response?.data?.errors
        setError(errors ? Object.values(errors)[0][0] : 'Something went wrong')
        } finally {
        setSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <input
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="Name"
            required
            className="w-full rounded border bg-white px-3 py-2"
            />
            <input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="Email"
            required
            className="w-full rounded border bg-white px-3 py-2"
            />
            <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="Password (min 8 characters)"
            required
            className="w-full rounded border bg-white px-3 py-2"
            />
            <input
            type="password"
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            placeholder="Confirm password"
            required
            className="w-full rounded border bg-white px-3 py-2"
            />

            <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
            {submitting ? 'Creating account...' : 'Register'}
            </button>
        </form>

        <p className="mt-4 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 underline">
            Log in
            </Link>
        </p>
        </div>
    )
}