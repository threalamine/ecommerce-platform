import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { cart } = useCart()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="text-xl font-bold">
                    MyShop
                </Link>

                <nav className="flex items-center gap-4 text-sm">
                    <Link to="/cart" className="relative underline">
                        Cart
                        {cart.items_count > 0 && (
                            <span className="ml-1 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                                {cart.items_count}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="font-semibold underline">
                                    Admin
                                </Link>
                            )}
                            <Link to="/orders" className="underline">
                                My orders
                            </Link>
                            <span>Hi, {user.name}</span>
                            <button onClick={handleLogout} className="underline">
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="underline">
                                Log in
                            </Link>
                            <Link to="/register" className="rounded bg-black px-3 py-1 text-white">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}