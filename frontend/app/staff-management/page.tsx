'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { authAPI } from '@/lib/api'
import { RegisterRequest, AuthUser, PageResponse } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { SortableHeader } from '@/components/ui/SortableHeader'
import { Pagination } from '@/components/ui/Pagination'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/use-toast'

function UpdateRoleModal({ 
  isOpen, 
  onClose, 
  onRoleUpdated,
  staff
}: { 
  isOpen: boolean
  onClose: () => void
  onRoleUpdated: () => void
  staff: AuthUser | null
}) {
  const [newRole, setNewRole] = useState<'ASSISTANT' | 'MANAGER' | 'ADMIN'>('ASSISTANT')
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    if (staff) {
      setNewRole(staff.role as 'ASSISTANT' | 'MANAGER' | 'ADMIN')
    }
  }, [staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staff) return

    setIsLoading(true)
    try {
      await authAPI.updateStaffRole(staff.username, newRole)
      success('Role Updated', `${staff.username} has been ${getRoleAction(staff.role, newRole)} to ${newRole}`)
      onRoleUpdated()
      onClose()
    } catch (error: any) {
      showError('Update Failed', error.response?.data?.message || 'Failed to update staff role')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleAction = (oldRole: string, newRole: string) => {
    const roleHierarchy = { 'ASSISTANT': 1, 'MANAGER': 2, 'ADMIN': 3 }
    const oldLevel = roleHierarchy[oldRole as keyof typeof roleHierarchy]
    const newLevel = roleHierarchy[newRole as keyof typeof roleHierarchy]
    
    if (newLevel > oldLevel) return 'promoted'
    if (newLevel < oldLevel) return 'demoted'
    return 'updated'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600 bg-red-100 border-red-200'
      case 'MANAGER': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'ASSISTANT': return 'text-blue-600 bg-blue-100 border-blue-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  if (!isOpen || !staff) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Staff Role">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Staff Role</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              staff.role === 'ADMIN' ? 'bg-gradient-to-br from-red-400 to-red-600' :
              staff.role === 'MANAGER' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
              'bg-gradient-to-br from-blue-400 to-blue-600'
            }`}>
              <span className="text-white font-bold text-lg">
                {staff.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{staff.username}</h3>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(staff.role)}`}>
                Current: {staff.role}
              </span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              New Role
            </label>
            <div className="space-y-3">
              {(['ASSISTANT', 'MANAGER', 'ADMIN'] as const).map((role) => (
                <label key={role} className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={newRole === role}
                    onChange={(e) => setNewRole(e.target.value as 'ASSISTANT' | 'MANAGER' | 'ADMIN')}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{role}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role)}`}>
                        {role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {role === 'ADMIN' && 'Full system access including staff management'}
                      {role === 'MANAGER' && 'Member/account management, statistics, and enforcement'}
                      {role === 'ASSISTANT' && 'Basic member registration and account operations'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || newRole === staff.role}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                `${getRoleAction(staff.role, newRole).charAt(0).toUpperCase() + getRoleAction(staff.role, newRole).slice(1)} to ${newRole}`
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function CreateStaffForm({ 
  isOpen, 
  onClose, 
  onStaffCreated 
}: { 
  isOpen: boolean
  onClose: () => void
  onStaffCreated: () => void 
}) {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
    role: 'ASSISTANT'
  })
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authAPI.register(formData)
      success('Staff Created', 'Staff member created successfully')
      setFormData({ username: '', password: '', role: 'ASSISTANT' })
      onStaffCreated()
      onClose()
    } catch (error: any) {
      showError('Creation Failed', error.response?.data?.message || 'Failed to create staff member')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Staff">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Staff</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ASSISTANT' | 'MANAGER' | 'ADMIN' })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="ASSISTANT">Assistant</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Staff'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function RoleInfo() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-blue-900">Staff Roles & Permissions</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
          <div className="flex items-center mb-2">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
              ASSISTANT
            </span>
          </div>
          <p className="text-sm text-blue-800">Can register members and manage basic account operations</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
          <div className="flex items-center mb-2">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mr-2">
              MANAGER
            </span>
          </div>
          <p className="text-sm text-purple-800">All assistant permissions plus statistics access and enforcement actions</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-red-100">
          <div className="flex items-center mb-2">
            <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-2">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-red-800">Full system access including staff management</p>
        </div>
      </div>
    </div>
  )
}

function StaffList({ 
  staff, 
  onDelete, 
  loading,
  pageData,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortField,
  sortDirection,
  onUpdateRole
}: { 
  staff: AuthUser[]
  onDelete: (username: string) => void
  loading: boolean
  pageData: PageResponse<AuthUser> | null
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSort: (field: string, direction: 'asc' | 'desc') => void
  sortField: string
  sortDirection: 'asc' | 'desc'
  onUpdateRole: (staff: AuthUser) => void
}) {
  const handleDelete = (username: string, role: string) => {
    if (confirm(`Are you sure you want to delete ${role.toLowerCase()} "${username}"? This action cannot be undone.`)) {
      onDelete(username)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Staff Members</h2>
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
            {pageData ? `${pageData.totalElements} total` : `${staff.length} total`}
          </span>
        </div>
      </div>
      
      {staff.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Members</h3>
          <p className="text-gray-500">Create your first staff member to get started</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <SortableHeader
                    sortKey="username"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={onSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Username
                  </SortableHeader>
                  <SortableHeader
                    sortKey="role"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={onSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Role
                  </SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((member, index) => (
                  <tr key={member.username} className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          member.role === 'ADMIN' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          member.role === 'MANAGER' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {member.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{member.username}</h3>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        member.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        member.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateRole(member)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Role</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDelete(member.username, member.role)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageData && (
            <Pagination
              currentPage={pageData.number}
              totalPages={pageData.totalPages}
              totalElements={pageData.totalElements}
              pageSize={pageData.size}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function StaffManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<AuthUser | null>(null)
  const [pageData, setPageData] = useState<PageResponse<AuthUser> | null>(null)
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState('username')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  const { toasts, success, error: showError, removeToast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user && user.role === 'ADMIN') {
      loadStaff()
    }
  }, [user, isLoading, router])

  // Separate useEffect for pagination, sorting, and search changes
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadStaff()
    }
  }, [currentPage, pageSize, sortField, sortDirection, searchTerm])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getAllStaff(
        currentPage, 
        pageSize, 
        sortField, 
        sortDirection, 
        searchTerm || undefined
      )
      
      if (response.data.data) {
        setPageData(response.data.data)
        setStaff(response.data.data.content || [])
      }
    } catch (error: any) {
      showError('Loading Failed', 'Failed to load staff members')
      console.error('Staff loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (username: string) => {
    try {
      await authAPI.deleteStaff(username)
      success('Staff Deleted', 'Staff member deleted successfully')
      loadStaff()
    } catch (error: any) {
      showError('Deletion Failed', error.response?.data?.message || 'Failed to delete staff member')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0) // Reset to first page when changing page size
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(0) // Reset to first page when sorting
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0) // Reset to first page when searching
    loadStaff()
  }

  const handleRefresh = () => {
    setSearchTerm('')
    setCurrentPage(0)
    setSortField('username')
    setSortDirection('asc')
    loadStaff()
  }

  const handleUpdateRole = (staffMember: AuthUser) => {
    setSelectedStaff(staffMember)
    setShowUpdateRoleModal(true)
  }

  const handleRoleUpdated = () => {
    loadStaff()
    setSelectedStaff(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                  Ma'ed
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{user.username}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-900 mb-2">Access Denied</h1>
            <p className="text-red-700 mb-6">Only administrators can access staff management.</p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                Ma'ed
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user.username}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600 text-lg">Create and manage system staff members</p>
        </div>

        <RoleInfo />
        
        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </div>
              </button>
              
              <button
                onClick={handleRefresh}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <StaffList 
          staff={staff} 
          onDelete={handleDeleteStaff} 
          loading={loading}
          pageData={pageData}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onUpdateRole={handleUpdateRole}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowCreateModal(true)}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      {/* Create Staff Modal */}
      <CreateStaffForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStaffCreated={loadStaff}
      />

      {/* Update Role Modal */}
      <UpdateRoleModal
        isOpen={showUpdateRoleModal}
        onClose={() => {
          setShowUpdateRoleModal(false)
          setSelectedStaff(null)
        }}
        onRoleUpdated={handleRoleUpdated}
        staff={selectedStaff}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}