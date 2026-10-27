import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Catalog />} />
        </Routes>
      </main>
    </div>
  )
}