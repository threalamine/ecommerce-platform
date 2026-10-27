import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold">
          MyShop
        </Link>
      </div>
    </header>
  )
}