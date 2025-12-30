import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 pb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-gray-900">
                Ma'ed Management System
              </span>
            </div>
            <div className="space-x-4">
              <Link href="/login">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Staff Login
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Cooperative Management
            <span className="text-blue-600 block">System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for managing cooperative members, shares, and saving accounts. 
            Secure, efficient, and role-based access for staff members.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700">
                Access System
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            System Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Member Management</h3>
              <p className="text-gray-600">
                Register and manage cooperative members with comprehensive profiles 
                and activity tracking.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Savings Accounts</h3>
              <p className="text-gray-600">
                Formal and informal saving accounts with flexible deposit and 
                withdrawal options.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-purple-600 text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure authentication with different access levels for 
                Assistant, Manager, and Admin roles.
              </p>
            </div>
          </div>
        </div>

        {/* Staff Access Info */}
        <div className="py-16 text-center">
          <div className="bg-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Staff Access Required</h2>
            <p className="text-xl mb-6 opacity-90">
              This system is for authorized staff members only. Please contact your administrator for access credentials.
            </p>
            <Link href="/login">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-md text-lg font-semibold hover:bg-gray-100">
                Staff Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}