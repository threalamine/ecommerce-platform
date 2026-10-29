const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-brand-100 text-brand-700',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }) {
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-800'
                }`}
        >
            {status}
        </span>
    )
}