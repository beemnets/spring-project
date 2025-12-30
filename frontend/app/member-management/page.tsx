'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { membersAPI } from '@/lib/api'
import { Member, PageResponse, CreateMemberRequest, UpdateMemberRequest } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { SortableHeader } from '@/components/ui/SortableHeader'
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu'
import { Modal } from '@/components/ui/Modal'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { RegisterMemberForm } from '@/components/forms/RegisterMemberForm'
import { UpdateMemberForm } from '@/components/forms/UpdateMemberForm'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/use-toast'

const workDomainOptions = [
  { value: '', label: 'All Domains' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'OTHER', label: 'Other' },
]

function MemberDetailsModal({ 
  isOpen, 
  onClose, 
  member 
}: {
  isOpen: boolean
  onClose: () => void
  member: Member | null
}) {
  if (!isOpen || !member) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Details">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm text-gray-600">Employee ID: {member.employeeId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Full Name:</span>
                <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
              </div>
              <div>
                <span className="text-gray-600">Employee ID:</span>
                <div className="font-medium text-gray-900">{member.employeeId}</div>
              </div>
              <div>
                <span className="text-gray-600">Work Domain:</span>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  member.workDomain === 'ACADEMIC' ? 'bg-purple-100 text-purple-800' :
                  member.workDomain === 'ADMINISTRATION' ? 'bg-blue-100 text-blue-800' :
                  member.workDomain === 'CONTRACT' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.workDomain}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  member.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    member.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  {member.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {member.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium text-gray-900">{member.email}</div>
                </div>
              )}
              {member.phoneNumber && (
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium text-gray-900">{member.phoneNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Information */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registration Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Registration Date:</span>
                <div className="font-medium text-blue-800">
                  {member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-blue-600">Registration Fee:</span>
                <div className="font-medium text-blue-800">{formatCurrency(member.registrationFee)}</div>
              </div>
              {!member.isActive && member.deactivationDate && (
                <>
                  <div>
                    <span className="text-blue-600">Deactivation Date:</span>
                    <div className="font-medium text-blue-800">
                      {new Date(member.deactivationDate).toLocaleDateString()}
                    </div>
                  </div>
                  {member.deactivationReason && (
                    <div>
                      <span className="text-blue-600">Deactivation Reason:</span>
                      <div className="font-medium text-blue-800">{member.deactivationReason}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Shares Information */}
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
              Shares Portfolio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-600">Total Shares:</span>
                <span className="font-bold text-green-800 text-lg">{member.shares?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Total Value:</span>
                <span className="font-bold text-green-800 text-lg">
                  {formatCurrency((member.shares?.length || 0) * 150)}
                </span>
              </div>
              
              {member.shares && member.shares.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Share Details:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {member.shares.map((share, index) => (
                      <div key={share.id} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-green-600">Share #{index + 1}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                share.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {share.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="mt-1 text-sm">
                              <div className="text-gray-600">
                                <strong>ID:</strong> {share.id}
                              </div>
                              <div className="text-gray-600">
                                <strong>Certificate:</strong> {share.certificateNumber}
                              </div>
                              <div className="text-gray-600">
                                <strong>Purchase Date:</strong> {new Date(share.purchaseDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-700">
                              {formatCurrency(share.shareValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!member.shares || member.shares.length === 0) && (
                <div className="text-center py-4 text-green-600">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No shares purchased yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Savings Accounts Information */}
          {member.savingAccounts && member.savingAccounts.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Savings Accounts ({member.savingAccounts.length})
              </h3>
              <div className="space-y-2">
                {member.savingAccounts.map((account) => (
                  <div key={account.id} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-purple-800">#{account.accountNumber}</div>
                        <div className="text-sm text-purple-600">{account.accountType} Account</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-800">{formatCurrency(account.currentBalance)}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          account.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

function MembersList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pageData, setPageData] = useState<PageResponse<Member> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Toast notifications
  const { toasts, success, error: showError, removeToast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [selectedDomain, statusFilter, currentPage, pageSize, sortField, sortDirection])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      let response
      
      if (searchQuery) {
        response = await membersAPI.search(searchQuery, currentPage, pageSize, sortField, sortDirection)
      } else if (selectedDomain) {
        response = await membersAPI.getByDomain(selectedDomain, currentPage, pageSize, sortField, sortDirection)
      } else {
        // Include inactive members based on status filter
        const includeInactive = statusFilter === 'inactive' || statusFilter === ''
        response = await membersAPI.getAll(currentPage, pageSize, sortField, sortDirection, undefined, includeInactive)
      }
      
      // Handle both Page<Member> and Member[] responses
      let pageData: PageResponse<Member>
      
      if (Array.isArray(response.data)) {
        // Backend is returning array directly instead of Page object
        let filteredMembers = response.data as Member[]
        if (statusFilter === 'active') {
          filteredMembers = (response.data as Member[]).filter(m => m.isActive)
        } else if (statusFilter === 'inactive') {
          filteredMembers = (response.data as Member[]).filter(m => !m.isActive)
        }
        
        pageData = {
          content: filteredMembers,
          totalElements: filteredMembers.length,
          totalPages: Math.ceil(filteredMembers.length / pageSize),
          size: pageSize,
          number: currentPage,
          first: currentPage === 0,
          last: currentPage >= Math.ceil(filteredMembers.length / pageSize) - 1,
          numberOfElements: filteredMembers.length
        }
      } else {
        // Backend is returning proper Page object
        let filteredContent = response.data.content
        if (statusFilter === 'active') {
          filteredContent = response.data.content.filter(m => m.isActive)
        } else if (statusFilter === 'inactive') {
          filteredContent = response.data.content.filter(m => !m.isActive)
        }
        
        pageData = {
          ...response.data,
          content: filteredContent,
          totalElements: filteredContent.length,
          numberOfElements: filteredContent.length
        }
      }
      
      setPageData(pageData)
      setError(null)
    } catch (err) {
      console.error('Error loading members:', err)
      setError('Failed to load members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!pageData?.content) return
    
    // Create CSV content
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Work Domain', 'Status', 'Shares', 'Registration Date']
    const csvContent = [
      headers.join(','),
      ...pageData.content.map(member => [
        member.employeeId,
        member.firstName,
        member.lastName,
        member.email || '',
        member.workDomain,
        member.isActive ? 'Active' : 'Inactive',
        member.shares?.length || 0,
        member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `members_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    success('Export Complete', `Exported ${pageData.content.length} members to CSV`)
  }

  const handleRegisterMember = async (data: CreateMemberRequest) => {
    setIsSubmitting(true)
    try {
      const response = await membersAPI.create(data)
      setShowRegisterModal(false)
      // Reset to first page and reload members
      setCurrentPage(0)
      setSearchQuery('')
      setSelectedDomain('')
      await loadMembers()
      success('Member Registered', `${data.firstName} ${data.lastName} has been successfully registered.`)
    } catch (error: any) {
      showError('Registration Failed', error.response?.data?.message || error.message || 'Failed to register member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMember = async (data: UpdateMemberRequest) => {
    if (!selectedMember) return
    
    setIsSubmitting(true)
    try {
      // Backend returns Member directly, not wrapped in ApiResponse
      const response = await membersAPI.update(selectedMember.id, data)
      setShowUpdateModal(false)
      setSelectedMember(null)
      loadMembers()
      success('Member Updated', `${data.firstName} ${data.lastName}'s information has been updated.`)
    } catch (error: any) {
      showError('Update Failed', error.response?.data?.message || 'Failed to update member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurchaseShares = async (id: number) => {
    const quantity = prompt('How many shares to purchase? (1-10)')
    if (quantity && parseInt(quantity) > 0 && parseInt(quantity) <= 10) {
      try {
        await membersAPI.purchaseShares(id, parseInt(quantity))
        success('Shares Purchased', `Successfully purchased ${quantity} shares.`)
        loadMembers()
      } catch (error: any) {
        showError('Purchase Failed', error.response?.data?.message || 'Failed to purchase shares')
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(0)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
    // Don't auto-search on every keystroke, let user finish typing
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    loadMembers()
  }

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain)
    setCurrentPage(0)
  }

  const openUpdateModal = (member: Member) => {
    setSelectedMember(member)
    setShowUpdateModal(true)
  }

  const openDetailsModal = async (member: Member) => {
    try {
      // Fetch full member details including shares and accounts
      const response = await membersAPI.getFullById(member.id)
      setSelectedMember(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Failed to fetch member details:', error)
      // Fallback to the basic member data if full details fail
      setSelectedMember(member)
      setShowDetailsModal(true)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>
  }

  const members = pageData?.content || []

  return (
    <>
      <div className="space-y-6">
        {/* Advanced Search and Filter Bar */}
        <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, employee ID, or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-20 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 border border-l-0 border-blue-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </form>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Domain Filter */}
              <div className="relative">
                <select
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 min-w-[160px]"
                >
                  {workDomainOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Export Button */}
              <button 
                onClick={handleExport}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 shadow-sm transition-all duration-200 flex items-center space-x-2"
                title="Export to CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </button>

              {/* Refresh Button */}
              <button 
                onClick={loadMembers}
                disabled={isLoading}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                title="Refresh Data"
              >
                <svg className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedDomain || statusFilter) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setCurrentPage(0)
                      loadMembers()
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDomain && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Domain: {workDomainOptions.find(opt => opt.value === selectedDomain)?.label}
                  <button
                    onClick={() => {
                      setSelectedDomain('')
                      setCurrentPage(0)
                    }}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {statusFilter === 'active' ? 'Active Only' : 'Inactive Only'}
                  <button
                    onClick={() => {
                      setStatusFilter('')
                      setCurrentPage(0)
                      loadMembers()
                    }}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDomain('')
                  setStatusFilter('')
                  setCurrentPage(0)
                  loadMembers()
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Summary */}
          {pageData && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {pageData.content.length} of {pageData.totalElements} members
                {(searchQuery || selectedDomain || statusFilter) && (
                  <span className="ml-2 text-blue-600 font-medium">(filtered)</span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span>Page {pageData.number + 1} of {pageData.totalPages}</span>
                <div className="flex items-center space-x-2">
                  <span>Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <SortableHeader
                    sortKey="firstName"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Member
                  </SortableHeader>
                  <SortableHeader
                    sortKey="employeeId"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Employee ID
                  </SortableHeader>
                  <SortableHeader
                    sortKey="workDomain"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Domain
                  </SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Shares
                  </th>
                  <SortableHeader
                    sortKey="isActive"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Status
                  </SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member: Member, index) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    onClick={() => openDetailsModal(member)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          {member.email && (
                            <div className="text-sm text-gray-500">{member.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        {member.employeeId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        member.workDomain === 'ACADEMIC' ? 'bg-purple-100 text-purple-800' :
                        member.workDomain === 'ADMINISTRATION' ? 'bg-blue-100 text-blue-800' :
                        member.workDomain === 'CONTRACT' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.workDomain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.shares?.length || 0} shares
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency((member.shares?.length || 0) * 150)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          member.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        trigger={
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        }
                      >
                        <DropdownItem onClick={() => openUpdateModal(member)}>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Update Info</span>
                          </div>
                        </DropdownItem>
                        <DropdownItem onClick={() => handlePurchaseShares(member.id)}>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Purchase Shares</span>
                          </div>
                        </DropdownItem>
                      </DropdownMenu>
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
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowRegisterModal(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Register Member Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Member"
        size="lg"
      >
        <RegisterMemberForm
          onSubmit={handleRegisterMember}
          onCancel={() => setShowRegisterModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Update Member Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false)
          setSelectedMember(null)
        }}
        title="Update Member Information"
        size="lg"
      >
        {selectedMember && (
          <UpdateMemberForm
            member={selectedMember}
            onSubmit={handleUpdateMember}
            onCancel={() => {
              setShowUpdateModal(false)
              setSelectedMember(null)
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
      />
    </>
  )
}

export default function MemberManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

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
        <MembersList />
      </div>
    </div>
  )
}