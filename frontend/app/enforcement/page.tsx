'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { membersAPI, accountsAPI } from '@/lib/api'
import { Member, SavingAccount } from '@/lib/types'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/lib/use-toast'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'

function DeactivationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  isLoading 
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title: string
  description: string
  isLoading: boolean
}) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onConfirm(reason.trim())
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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
        
        <p className="text-gray-600 mb-6">{description}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Deactivation *
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
              placeholder="Enter the reason for deactivation..."
              rows={4}
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
              disabled={isLoading || !reason.trim()}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deactivating...
                </div>
              ) : (
                'Deactivate'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function MemberEnforcementCard({ member, onUpdate }: { 
  member: Member
  onUpdate: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const { success, error: showError } = useToast()

  const handleDeactivate = async (reason: string) => {
    setIsLoading(true)
    try {
      console.log(`🔄 Deactivating member ${member.id} with reason: ${reason}`)
      await membersAPI.deactivate(member.id, reason)
      success('Member Deactivated', `${member.firstName} ${member.lastName} has been deactivated`)
      setShowDeactivateModal(false)
      
      // Wait a moment for the backend to process, then refresh
      setTimeout(() => {
        onUpdate()
      }, 500)
    } catch (error: any) {
      console.error('❌ Deactivation failed:', error)
      showError('Deactivation Failed', error.response?.data?.message || 'Failed to deactivate member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      console.log(`🔄 Reactivating member ${member.id}`)
      await membersAPI.reactivate(member.id)
      success('Member Reactivated', `${member.firstName} ${member.lastName} has been reactivated`)
      
      // Wait a moment for the backend to process, then refresh
      setTimeout(() => {
        onUpdate()
      }, 500)
    } catch (error: any) {
      console.error('❌ Reactivation failed:', error)
      showError('Reactivation Failed', error.response?.data?.message || 'Failed to reactivate member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${isLoading ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              member.isActive 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
              <span className="text-white font-bold text-lg">
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>ID: {member.employeeId}</span>
                <span>•</span>
                <span>{member.workDomain}</span>
                <span>•</span>
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
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
                {!member.isActive && (
                  <span className="text-xs text-gray-500">
                    Deactivated: {new Date(member.deactivationDate || '').toLocaleDateString()}
                  </span>
                )}
              </div>
              {!member.isActive && member.deactivationReason && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Reason:</span> {member.deactivationReason}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {member.isActive ? (
              <button
                onClick={() => setShowDeactivateModal(true)}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                <span>Deactivate</span>
              </button>
            ) : (
              <button
                onClick={handleReactivate}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Reactivate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <DeactivationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Member"
        description={`Are you sure you want to deactivate ${member.firstName} ${member.lastName}? This will restrict their access to the system.`}
        isLoading={isLoading}
      />
    </>
  )
}

function BulkDepositCard() {
  const [selectedDomain, setSelectedDomain] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()

  const workDomains = [
    { value: 'ACADEMIC', label: 'Academic Staff' },
    { value: 'ADMINISTRATION', label: 'Administration' },
    { value: 'CONTRACT', label: 'Contract Workers' },
    { value: 'OTHER', label: 'Other' }
  ]

  const handleBulkDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDomain || !amount) {
      showError('Validation Error', 'Please select a domain and enter an amount')
      return
    }

    const depositAmount = parseFloat(amount)
    if (depositAmount <= 0) {
      showError('Validation Error', 'Amount must be greater than 0')
      return
    }

    setIsLoading(true)
    try {
      console.log(`🔄 Starting bulk deposit: ${selectedDomain}, ${depositAmount} ETB`)
      const response = await accountsAPI.bulkDeposit(selectedDomain, depositAmount, description || undefined)
      
      console.log('✅ Bulk deposit response:', response.data)
      
      const result = response.data as any
      const successCount = result.successCount || 0
      const totalAmount = result.totalAmount || 0
      
      success(
        'Bulk Deposit Completed', 
        `Successfully deposited to ${successCount} accounts. Total: ETB ${totalAmount.toLocaleString()}`
      )
      
      // Reset form
      setSelectedDomain('')
      setAmount('')
      setDescription('')
      
    } catch (error: any) {
      console.error('❌ Bulk deposit failed:', error)
      showError('Bulk Deposit Failed', error.response?.data?.message || 'Failed to process bulk deposit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Bulk Deposit by Work Domain
        </h3>
        <p className="text-gray-600">Deposit the same amount to all active members in a specific work domain</p>
      </div>

      {/* Warning Notice */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">Important Notice</h4>
            <p className="text-sm text-yellow-800">
              This will deposit the specified amount to ALL active members in the selected work domain. 
              Only members with active accounts will receive deposits. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleBulkDeposit} className="space-y-6">
        {/* Work Domain Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Work Domain *
          </label>
          <select
            required
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          >
            <option value="">Select work domain...</option>
            {workDomains.map((domain) => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deposit Amount (ETB) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">ETB</span>
            </div>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum deposit: ETB 1.00</p>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this bulk deposit..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedDomain('')
              setAmount('')
              setDescription('')
            }}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedDomain || !amount}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Process Bulk Deposit
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function AccountEnforcementCard({ account, member, onUpdate }: { 
  account: SavingAccount
  member: Member
  onUpdate: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()

  const handleDeactivate = async () => {
    if (!confirm(`Are you sure you want to deactivate account ${account.accountNumber}? This action will prevent any transactions on this account.`)) {
      return
    }

    setIsLoading(true)
    try {
      await accountsAPI.deactivate(account.id)
      success('Account Deactivated', `Account ${account.accountNumber} has been deactivated`)
      onUpdate()
    } catch (error: any) {
      showError('Deactivation Failed', error.response?.data?.message || 'Failed to deactivate account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      await accountsAPI.reactivate(account.id)
      success('Account Reactivated', `Account ${account.accountNumber} has been reactivated`)
      onUpdate()
    } catch (error: any) {
      showError('Reactivation Failed', error.response?.data?.message || 'Failed to reactivate account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            account.accountType === 'FORMAL' 
              ? 'bg-gradient-to-br from-purple-400 to-purple-600' 
              : 'bg-gradient-to-br from-orange-400 to-orange-600'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Account #{account.accountNumber}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>Owner: {member.firstName} {member.lastName}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                account.accountType === 'FORMAL' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {account.accountType}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  ETB {account.currentBalance.toLocaleString()}
                </span>
              </div>
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
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {account.isActive ? (
            <button
              onClick={handleDeactivate}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              <span>Deactivate</span>
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Reactivate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EnforcementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [accounts, setAccounts] = useState<{ account: SavingAccount, member: Member }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members' | 'accounts' | 'bulk'>('members')
  const { toasts, success, error: showError, removeToast } = useToast()

  // Pagination state for members
  const [membersPage, setMembersPage] = useState(0)
  const [membersPageSize, setMembersPageSize] = useState(5)
  const [membersTotalPages, setMembersTotalPages] = useState(0)
  const [membersTotalElements, setMembersTotalElements] = useState(0)

  // State for full member statistics
  const [memberStats, setMemberStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })
  
  // State for full account statistics  
  const [accountStats, setAccountStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  // Pagination state for accounts
  const [accountsPage, setAccountsPage] = useState(0)
  const [accountsPageSize, setAccountsPageSize] = useState(5)
  const [accountsTotalPages, setAccountsTotalPages] = useState(0)
  const [accountsTotalElements, setAccountsTotalElements] = useState(0)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user && user.role === 'MANAGER') {
      loadData()
    }
  }, [user, isLoading, router])

  // Reload members when members pagination changes
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      loadMembers()
    }
  }, [membersPage, membersPageSize])

  // Reload accounts when accounts pagination changes
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      loadAccounts()
    }
  }, [accountsPage, accountsPageSize])

  // Pagination handlers for members
  const handleMembersPageChange = (page: number) => {
    setMembersPage(page)
  }

  const handleMembersPageSizeChange = (size: number) => {
    setMembersPageSize(size)
    setMembersPage(0) // Reset to first page when changing page size
  }

  // Pagination handlers for accounts
  const handleAccountsPageChange = (page: number) => {
    setAccountsPage(page)
  }

  const handleAccountsPageSizeChange = (size: number) => {
    setAccountsPageSize(size)
    setAccountsPage(0) // Reset to first page when changing page size
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      console.log('🔄 Loading enforcement data...')
      
      // Load full statistics first
      await loadFullStatistics()
      
      // Load members with pagination
      await loadMembers()
      
      // Load accounts with pagination
      await loadAccounts()
      
    } catch (error: any) {
      showError('Loading Failed', 'Failed to load enforcement data')
      console.error('Enforcement data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFullStatistics = async () => {
    try {
      // Get full member statistics
      const memberStatsResponse = await membersAPI.getCount()
      const memberStatsData = memberStatsResponse.data || {
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0
      }
      
      setMemberStats({
        total: memberStatsData.totalMembers,
        active: memberStatsData.activeMembers,
        inactive: memberStatsData.inactiveMembers
      })

      // Get full account statistics by loading all accounts
      try {
        console.log('📊 Loading all accounts for statistics...')
        const allAccountsResponse = await accountsAPI.getAll(0, 1000) // Get up to 1000 accounts
        const allAccountsData = Array.isArray(allAccountsResponse.data) 
          ? allAccountsResponse.data 
          : allAccountsResponse.data.content || []
        
        const totalAccounts = allAccountsData.length
        const activeAccounts = allAccountsData.filter((acc: SavingAccount) => acc.isActive).length
        const inactiveAccounts = totalAccounts - activeAccounts
        
        console.log('📊 Account statistics calculated:', { totalAccounts, activeAccounts, inactiveAccounts })
        
        setAccountStats({
          total: totalAccounts,
          active: activeAccounts,
          inactive: inactiveAccounts
        })
      } catch (accountStatsError) {
        console.error('Error loading account statistics:', accountStatsError)
        // Set default values if calculation fails
        setAccountStats({
          total: 0,
          active: 0,
          inactive: 0
        })
      }
      
    } catch (error) {
      console.error('Error loading full statistics:', error)
    }
  }

  const loadMembers = async () => {
    try {
      console.log(`📡 Loading members page ${membersPage + 1} (size: ${membersPageSize})...`)
      
      // Try to load all members including inactive ones using the correct API method
      const membersResponse = await membersAPI.getAll(membersPage, membersPageSize, 'id', 'asc', undefined, true) // includeInactive = true
      
      console.log('📡 Raw members API response:', membersResponse)
      
      const responseData = membersResponse.data
      let allMembers: Member[] = []
      let totalElements = 0
      let totalPages = 0
      
      if (Array.isArray(responseData)) {
        // Direct array response
        allMembers = responseData
        totalElements = responseData.length
        totalPages = Math.ceil(totalElements / membersPageSize)
      } else if (responseData.content) {
        // Paginated response
        allMembers = responseData.content
        totalElements = responseData.totalElements || 0
        totalPages = responseData.totalPages || 0
      }
      
      console.log('✅ Successfully loaded members:', allMembers.length, 'members')
      console.log('📊 Member pagination info:', { totalElements, totalPages, currentPage: membersPage })
      console.log('📊 Member status breakdown:', {
        active: allMembers.filter(m => m.isActive).length,
        inactive: allMembers.filter(m => !m.isActive).length
      })
      
      setMembers(allMembers)
      setMembersTotalElements(totalElements)
      setMembersTotalPages(totalPages)
      
    } catch (error: any) {
      console.error('❌ Failed to load members:', error)
      showError('Loading Failed', 'Failed to load members data')
    }
  }

  const loadAccounts = async () => {
    try {
      console.log(`📡 Loading accounts page ${accountsPage + 1} (size: ${accountsPageSize})...`)
      
      const accountsResponse = await accountsAPI.getAll(accountsPage, accountsPageSize)
      const responseData = accountsResponse.data
      
      let allAccounts: SavingAccount[] = []
      let totalElements = 0
      let totalPages = 0
      
      if (Array.isArray(responseData)) {
        // Direct array response
        allAccounts = responseData
        totalElements = responseData.length
        totalPages = Math.ceil(totalElements / accountsPageSize)
      } else if (responseData.content) {
        // Paginated response
        allAccounts = responseData.content
        totalElements = responseData.totalElements || 0
        totalPages = responseData.totalPages || 0
      }
      
      // For each account, we need to get the member info
      // For now, we'll create a simplified mapping
      const accountsWithMembers: { account: SavingAccount, member: Member }[] = []
      
      // Get all members to map accounts to members
      const allMembersResponse = await membersAPI.getAll(0, 1000, 'id', 'asc', undefined, true)
      const allMembersData = Array.isArray(allMembersResponse.data) ? allMembersResponse.data : allMembersResponse.data.content || []
      
      allAccounts.forEach((account) => {
        // Find member by account (accounts should have memberId property)
        let member = allMembersData.find(m => m.id === (account as any).memberId)
        
        // If no member found by memberId, try to find by other means or create a placeholder
        if (!member) {
          // Try to find member by matching account in member's savingAccounts array
          member = allMembersData.find(m => 
            m.savingAccounts && m.savingAccounts.some((acc: any) => acc.id === account.id)
          )
          
          // If still no member found, create a placeholder member for display
          if (!member) {
            console.warn(`No member found for account ${account.accountNumber}, creating placeholder`)
            member = {
              id: 0,
              firstName: 'Unknown',
              lastName: 'Member',
              employeeId: 'N/A',
              workDomain: 'OTHER' as const,
              registrationDate: account.openingDate,
              registrationFee: 0,
              isActive: true
            }
          }
        }
        
        accountsWithMembers.push({ account, member })
      })
      
      console.log('✅ Successfully loaded accounts:', allAccounts.length, 'accounts')
      console.log('👥 Successfully mapped accounts with members:', accountsWithMembers.length, 'account-member pairs')
      console.log('📊 Account pagination info:', { totalElements, totalPages, currentPage: accountsPage })
      
      setAccounts(accountsWithMembers)
      setAccountsTotalElements(totalElements)
      setAccountsTotalPages(totalPages)
      
    } catch (error: any) {
      console.error('❌ Failed to load accounts:', error)
      showError('Loading Failed', 'Failed to load accounts data')
    }
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

  if (user.role !== 'MANAGER') {
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
            <p className="text-red-700 mb-6">Only managers can access enforcement actions.</p>
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
              <button 
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const response = await membersAPI.getAll(0, 100, 'id', 'asc', undefined, true)
                    console.log('🔍 Debug API Response:', response)
                    const count = Array.isArray(response.data) ? response.data.length : (response.data.content?.length || 0)
                    alert(`Debug: Found ${count} members`)
                  } catch (error) {
                    console.error('🔍 Debug API Error:', error)
                    alert('Debug: API call failed - check console')
                  }
                }}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Debug API</span>
              </button>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Enforcement Actions</h1>
          <p className="text-gray-600 text-lg">Deactivate or reactivate members and accounts</p>
        </div>

        {/* Warning Notice */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Important Notice</h3>
              <p className="text-yellow-800">
                Use these enforcement actions carefully. Deactivating members or accounts will restrict their access and functionality. 
                Always provide a clear reason for deactivation to maintain proper records.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'members'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Members ({memberStats.total})</span>
                  <div className="flex space-x-1 text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {memberStats.active} Active
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {memberStats.inactive} Inactive
                    </span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'accounts'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Accounts ({accountStats.total})</span>
                  <div className="flex space-x-1 text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {accountStats.active} Active
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {accountStats.inactive} Inactive
                    </span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'bulk'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Bulk Operations</span>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    New
                  </div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading enforcement data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'members' ? (
              <>
                {members.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {members.map(member => (
                        <MemberEnforcementCard
                          key={member.id}
                          member={member}
                          onUpdate={loadMembers}
                        />
                      ))}
                    </div>
                    {membersTotalPages > 1 && (
                      <Pagination
                        currentPage={membersPage}
                        totalPages={membersTotalPages}
                        totalElements={membersTotalElements}
                        pageSize={membersPageSize}
                        onPageChange={handleMembersPageChange}
                        onPageSizeChange={handleMembersPageSizeChange}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
                    <p className="text-gray-500">No members available for enforcement actions</p>
                  </div>
                )}
              </>
            ) : activeTab === 'accounts' ? (
              <>
                {accounts.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {accounts.map(({ account, member }) => (
                        <AccountEnforcementCard
                          key={account.id}
                          account={account}
                          member={member}
                          onUpdate={loadAccounts}
                        />
                      ))}
                    </div>
                    {accountsTotalPages > 1 && (
                      <Pagination
                        currentPage={accountsPage}
                        totalPages={accountsTotalPages}
                        totalElements={accountsTotalElements}
                        pageSize={accountsPageSize}
                        onPageChange={handleAccountsPageChange}
                        onPageSizeChange={handleAccountsPageSizeChange}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Found</h3>
                    <p className="text-gray-500">No accounts available for enforcement actions</p>
                  </div>
                )}
              </>
            ) : (
              // Bulk Operations Tab
              <BulkDepositCard />
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}