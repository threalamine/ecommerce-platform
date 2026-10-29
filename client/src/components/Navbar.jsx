import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const linkClass = 'text-sm font-medium text-gray-600 hover:text-gray-900'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { cart } = useCart()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const close = () => setOpen(false)

    const handleLogout = async () => {
        close()
        await logout()
        navigate('/')
    }

    const cartLink = (
        <Link to="/cart" onClick={close} className={`${linkClass} flex items-center gap-2`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
            >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            Cart
            {cart.items_count > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
                    {cart.items_count}
                </span>
            )}
        </Link>
    )

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to="/" onClick={close} className="flex items-center gap-2 text-xl font-bold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                        M
                    </span>
                    MyShop
                </Link>

                {/* Desktop menu */}
                <nav className="hidden items-center gap-6 md:flex">
                    {user?.role === 'admin' && (
                        <Link to="/admin" className={`${linkClass} text-brand-700`}>
                            Admin
                        </Link>
                    )}
                    {user && (
                        <Link to="/orders" className={linkClass}>
                            My orders
                        </Link>
                    )}
                    {cartLink}

                    {user ? (
                        <div className="flex items-center gap-4 border-l pl-6">
                            <span className="text-sm text-gray-500">Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 border-l pl-6">
                            <Link to="/login" className={linkClass}>
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile menu button */}
                <button
                    onClick={() => setOpen((value) => !value)}
                    className="rounded-lg border p-2 md:hidden"
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-5 w-5"
                    >
                        {open ? (
                            <path d="M6 6l12 12M18 6L6 18" />
                        ) : (
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu panel */}
            {open && (
                <nav className="flex flex-col gap-4 border-t bg-white px-4 py-4 md:hidden">
                    {user?.role === 'admin' && (
                        <Link to="/admin" onClick={close} className={`${linkClass} text-brand-700`}>
                            Admin
                        </Link>
                    )}
                    {user && (
                        <Link to="/orders" onClick={close} className={linkClass}>
                            My orders
                        </Link>
                    )}
                    {cartLink}

                    {user ? (
                        <>
                            <span className="text-sm text-gray-500">Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={close} className="btn btn-secondary">
                                Log in
                            </Link>
                            <Link to="/register" onClick={close} className="btn btn-primary">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    )
}