import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            await login(email, password)
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
            <h1 className="mb-6 text-2xl font-bold">Log in</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded border bg-white px-3 py-2"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full rounded border bg-white px-3 py-2"
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <p className="mt-4 text-sm">
                No account?{' '}
                <Link to="/register" className="text-blue-600 underline">
                    Register
                </Link>
            </p>
        </div>
    )
}