import { NavLink, Outlet } from 'react-router-dom'

const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/orders', label: 'Orders', end: false },
    { to: '/admin/products', label: 'Products', end: false },
    { to: '/admin/categories', label: 'Categories', end: false },
]

export default function AdminLayout() {
    return (
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <aside>
                <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Admin</h2>
                <nav className="flex gap-2 md:flex-col">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `rounded px-3 py-2 text-sm ${isActive ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <section className="min-w-0">
                <Outlet />
            </section>
        </div>
    )
}