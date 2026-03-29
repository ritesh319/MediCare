import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-7xl mb-4">🔒</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  )
}
