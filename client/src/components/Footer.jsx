export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} MyShop. A portfolio project.</p>
        <p>Built with Laravel, React and Stripe.</p>
      </div>
    </footer>
  )
}