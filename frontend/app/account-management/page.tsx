'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { accountsAPI, membersAPI } from '@/lib/api'
import { SavingAccount, Member, PageResponse } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { SortableHeader } from '@/components/ui/SortableHeader'
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu'
import { Modal } from '@/components/ui/Modal'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/use-toast'

const accountTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'INFORMAL', label: 'Informal' },
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
]

interface AccountWithMember {
  account: SavingAccount
  member: Member | null
}

function CreateAccountModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    memberId: '',
    accountType: 'FORMAL',
    monthlyAmount: '',
    targetAmount: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.memberId || !formData.accountType) return
    
    const submitData = {
      memberId: parseInt(formData.memberId),
      accountType: formData.accountType,
      monthlyAmount: formData.accountType === 'FORMAL' && formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : undefined,
      targetAmount: formData.accountType === 'INFORMAL' && formData.targetAmount ? parseFloat(formData.targetAmount) : undefined
    }
    
    onSubmit(submitData)
  }

  const resetForm = () => {
    setFormData({
      memberId: '',
      accountType: 'FORMAL',
      monthlyAmount: '',
      targetAmount: ''
    })
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Account">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create New Account</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member ID Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Member ID *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              placeholder="Enter member ID..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'FORMAL' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === 'FORMAL'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-1 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-sm">Formal</div>
                  <div className="text-xs text-gray-500">Fixed monthly</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'INFORMAL' })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.accountType === 'INFORMAL'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-1 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="font-medium text-sm">Informal</div>
                  <div className="text-xs text-gray-500">Flexible</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Fields */}
          {formData.accountType === 'FORMAL' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Amount (ETB) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">ETB</span>
                </div>
                <input
                  type="number"
                  required
                  min="500"
                  step="50"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                  placeholder="500.00"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum monthly deposit: ETB 500</p>
            </div>
          )}

          {formData.accountType === 'INFORMAL' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Amount (ETB) - Optional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">ETB</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="1000.00"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum amount: ETB 1</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.memberId || !formData.accountType}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function AccountDetailsModal({ 
  isOpen, 
  onClose, 
  account 
}: {
  isOpen: boolean
  onClose: () => void
  account: SavingAccount | null
}) {
  if (!isOpen || !account) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Details">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              account.accountType === 'FORMAL' 
                ? 'bg-purple-500' 
                : 'bg-orange-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
              <p className="text-sm text-gray-600">#{account.accountNumber}</p>
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

        <div className="space-y-4">
          {/* Account Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account Number:</span>
                <div className="font-medium text-gray-900">#{account.accountNumber}</div>
              </div>
              <div>
                <span className="text-gray-600">Account Type:</span>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  account.accountType === 'FORMAL' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {account.accountType}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Current Balance:</span>
                <div className="font-bold text-green-600 text-lg">{formatCurrency(account.currentBalance)}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  account.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    account.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  {account.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Specific Details */}
          {account.accountType === 'FORMAL' && account.monthlyAmount && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-700 mb-2">Formal Account Details</h3>
              <div className="text-sm">
                <span className="text-purple-600">Monthly Deposit Amount:</span>
                <div className="font-bold text-purple-800 text-lg">{formatCurrency(account.monthlyAmount)}</div>
              </div>
            </div>
          )}

          {account.accountType === 'INFORMAL' && account.targetAmount && (
            <div className="bg-orange-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-orange-700 mb-2">Informal Account Details</h3>
              <div className="text-sm">
                <span className="text-orange-600">Target Amount:</span>
                <div className="font-bold text-orange-800 text-lg">{formatCurrency(account.targetAmount)}</div>
                <div className="mt-2">
                  <span className="text-orange-600">Progress:</span>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((account.currentBalance / account.targetAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {((account.currentBalance / account.targetAmount) * 100).toFixed(1)}% of target reached
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Dates */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">Account Timeline</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-blue-600">Opening Date:</span>
                <div className="font-medium text-blue-800">
                  {account.openingDate ? new Date(account.openingDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
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

function TransactionModal({ 
  isOpen, 
  onClose, 
  account, 
  type, 
  onSubmit, 
  isLoading 
}: {
  isOpen: boolean
  onClose: () => void
  account: SavingAccount | null
  type: 'deposit' | 'withdraw'
  onSubmit: (amount: number, description?: string) => void
  isLoading: boolean
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    onSubmit(parseFloat(amount), description || undefined)
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen || !account) return null

  const isWithdraw = type === 'withdraw'
  const maxAmount = isWithdraw ? account.currentBalance : undefined

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${isWithdraw ? 'Withdraw from' : 'Deposit to'} Account`}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWithdraw ? 'bg-red-500' : 'bg-green-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  isWithdraw 
                    ? "M7 16l-4-4m0 0l4-4m-4 4h18" 
                    : "M17 8l4 4m0 0l-4 4m4-4H3"
                } />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isWithdraw ? 'Withdraw Money' : 'Deposit Money'}
              </h2>
              <p className="text-sm text-gray-600">Account #{account.accountNumber}</p>
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

        {/* Account Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Balance:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(account.currentBalance)}
            </span>
          </div>
          {isWithdraw && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Available for Withdrawal:</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(account.currentBalance)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (ETB) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">ETB</span>
              </div>
              <input
                type="number"
                required
                min="1"
                max={maxAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
            {isWithdraw && maxAmount && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum withdrawal: {formatCurrency(maxAmount)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${type} description...`}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
            />
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
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className={`flex-1 py-3 px-6 rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 transition-all duration-200 font-medium ${
                isWithdraw
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `${isWithdraw ? 'Withdraw' : 'Deposit'} ${formatCurrency(parseFloat(amount) || 0)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function AccountsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pageData, setPageData] = useState<PageResponse<AccountWithMember> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<SavingAccount | null>(null)
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Toast notifications
  const { toasts, success, error: showError, removeToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadAccounts()
  }, [selectedType, statusFilter, currentPage, pageSize, sortField, sortDirection])

  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      let response
      
      if (searchQuery) {
        response = await accountsAPI.getAll(currentPage, pageSize, sortField, sortDirection, searchQuery)
      } else {
        response = await accountsAPI.getAll(currentPage, pageSize, sortField, sortDirection)
      }
      
      // Handle both Page<SavingAccount> and SavingAccount[] responses
      let accountsData: SavingAccount[] = []
      let totalElements = 0
      let totalPages = 0
      
      if (Array.isArray(response.data)) {
        accountsData = response.data
        totalElements = accountsData.length
        totalPages = Math.ceil(totalElements / pageSize)
      } else {
        accountsData = response.data.content || []
        totalElements = response.data.totalElements || 0
        totalPages = response.data.totalPages || 0
      }

      // Apply filters
      let filteredAccounts = accountsData
      if (selectedType) {
        filteredAccounts = filteredAccounts.filter(acc => acc.accountType === selectedType)
      }
      if (statusFilter === 'active') {
        filteredAccounts = filteredAccounts.filter(acc => acc.isActive)
      } else if (statusFilter === 'inactive') {
        filteredAccounts = filteredAccounts.filter(acc => !acc.isActive)
      }

      // Get member data for each account
      const accountsWithMembers: AccountWithMember[] = []
      for (const account of filteredAccounts) {
        try {
          // Since the backend doesn't return memberId with accounts,
          // we'll create a placeholder member for now
          // TODO: Backend should be modified to include memberId in SavingAccount
          const member: Member = {
            id: account.id, // Using account ID as placeholder
            firstName: 'Member',
            lastName: `${account.id}`,
            employeeId: `EMP${account.id.toString().padStart(3, '0')}`,
            workDomain: 'ACADEMIC',
            email: `member${account.id}@example.com`,
            phoneNumber: '+251911000000',
            registrationDate: new Date().toISOString(),
            registrationFee: 100,
            isActive: true,
            deactivationDate: undefined,
            deactivationReason: undefined,
            shares: []
          }
          
          accountsWithMembers.push({
            account,
            member
          })
        } catch (error) {
          accountsWithMembers.push({
            account,
            member: null
          })
        }
      }
      
      const pageData: PageResponse<AccountWithMember> = {
        content: accountsWithMembers,
        totalElements: filteredAccounts.length,
        totalPages: Math.ceil(filteredAccounts.length / pageSize),
        size: pageSize,
        number: currentPage,
        first: currentPage === 0,
        last: currentPage >= Math.ceil(filteredAccounts.length / pageSize) - 1,
        numberOfElements: filteredAccounts.length
      }
      
      setPageData(pageData)
      setError(null)
    } catch (err) {
      console.error('Error loading accounts:', err)
      setError('Failed to load accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!pageData?.content) return
    
    // Create CSV content
    const headers = ['Account Number', 'Account Type', 'Owner', 'Current Balance', 'Status', 'Opening Date']
    const csvContent = [
      headers.join(','),
      ...pageData.content.map(({ account, member }) => [
        account.accountNumber,
        account.accountType,
        member ? `${member.firstName} ${member.lastName}` : 'Unknown',
        account.currentBalance,
        account.isActive ? 'Active' : 'Inactive',
        account.openingDate ? new Date(account.openingDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `accounts_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    success('Export Complete', `Exported ${pageData.content.length} accounts to CSV`)
  }

  const handleCreateAccount = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (data.accountType === 'FORMAL') {
        await accountsAPI.createFormal(data.memberId, data.monthlyAmount)
      } else {
        await accountsAPI.createInformal(data.memberId, data.targetAmount)
      }
      
      setShowCreateModal(false)
      setCurrentPage(0)
      await loadAccounts()
      success('Account Created', `${data.accountType} account has been successfully created.`)
    } catch (error: any) {
      showError('Creation Failed', error.response?.data?.message || error.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTransaction = async (amount: number, description?: string) => {
    if (!selectedAccount) return
    
    setIsSubmitting(true)
    try {
      if (transactionType === 'deposit') {
        await accountsAPI.deposit(selectedAccount.id, amount, description)
        success('Deposit Successful', `${formatCurrency(amount)} has been deposited to account ${selectedAccount.accountNumber}`)
      } else {
        await accountsAPI.withdraw(selectedAccount.id, amount, description)
        success('Withdrawal Successful', `${formatCurrency(amount)} has been withdrawn from account ${selectedAccount.accountNumber}`)
      }
      
      setShowTransactionModal(false)
      setSelectedAccount(null)
      loadAccounts()
    } catch (error: any) {
      showError('Transaction Failed', error.response?.data?.message || 'Failed to process transaction')
    } finally {
      setIsSubmitting(false)
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
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    loadAccounts()
  }

  const openTransactionModal = (account: SavingAccount, type: 'deposit' | 'withdraw') => {
    setSelectedAccount(account)
    setTransactionType(type)
    setShowTransactionModal(true)
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>
  }

  const accounts = pageData?.content || []

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
                placeholder="Search by account number or member name..."
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
              {/* Account Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 min-w-[140px]"
                >
                  {accountTypeOptions.map((option) => (
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
                  {statusOptions.map((option) => (
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
                onClick={loadAccounts}
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
          {(searchQuery || selectedType || statusFilter) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setCurrentPage(0)
                      loadAccounts()
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Type: {accountTypeOptions.find(opt => opt.value === selectedType)?.label}
                  <button
                    onClick={() => {
                      setSelectedType('')
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
                  Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                  <button
                    onClick={() => {
                      setStatusFilter('')
                      setCurrentPage(0)
                      loadAccounts()
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
                  setSelectedType('')
                  setStatusFilter('')
                  setCurrentPage(0)
                  loadAccounts()
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
                Showing {pageData.content.length} of {pageData.totalElements} accounts
                {(searchQuery || selectedType || statusFilter) && (
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

        {/* Accounts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <SortableHeader
                    sortKey="accountNumber"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Account
                  </SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Owner
                  </th>
                  <SortableHeader
                    sortKey="accountType"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Type
                  </SortableHeader>
                  <SortableHeader
                    sortKey="currentBalance"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Balance
                  </SortableHeader>
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
                {accounts.map(({ account, member }, index) => (
                  <tr 
                    key={account.id} 
                    className={`hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowDetailsModal(true)
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          account.accountType === 'FORMAL' 
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600' 
                            : 'bg-gradient-to-br from-orange-400 to-orange-600'
                        }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            #{account.accountNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Opened: {account.openingDate ? new Date(account.openingDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {member ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}` : '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member?.employeeId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        account.accountType === 'FORMAL' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {account.accountType}
                      </span>
                      {account.accountType === 'FORMAL' && account.monthlyAmount && (
                        <div className="text-xs text-gray-500 mt-1">
                          Monthly: {formatCurrency(account.monthlyAmount)}
                        </div>
                      )}
                      {account.accountType === 'INFORMAL' && account.targetAmount && (
                        <div className="text-xs text-gray-500 mt-1">
                          Target: {formatCurrency(account.targetAmount)}
                        </div>
                      )}
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
                            {formatCurrency(account.currentBalance)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Current Balance
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        account.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          account.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        {account.isActive ? 'Active' : 'Inactive'}
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
                        {account.isActive && (
                          <>
                            <DropdownItem onClick={() => openTransactionModal(account, 'deposit')}>
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Deposit</span>
                              </div>
                            </DropdownItem>
                            {/* Only show withdraw for informal accounts */}
                            {account.accountType === 'INFORMAL' && (
                              <DropdownItem onClick={() => openTransactionModal(account, 'withdraw')}>
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                  </svg>
                                  <span>Withdraw</span>
                                </div>
                              </DropdownItem>
                            )}
                          </>
                        )}
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
        onClick={() => setShowCreateModal(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAccount}
        isLoading={isSubmitting}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
        type={transactionType}
        onSubmit={handleTransaction}
        isLoading={isSubmitting}
      />

      {/* Account Details Modal */}
      <AccountDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
      />
    </>
  )
}

export default function AccountManagementPage() {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Management</h1>
          <p className="text-gray-600 text-lg">Manage savings accounts, transactions, and balances</p>
        </div>
        
        <AccountsList />
      </div>
    </div>
  )
}