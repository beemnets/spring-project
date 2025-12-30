import React, { useState } from 'react'
import { CreateMemberRequest } from '@/lib/types'

interface RegisterMemberFormProps {
  onSubmit: (data: CreateMemberRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const workDomainOptions = [
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'OTHER', label: 'Other' },
]

export function RegisterMemberForm({ onSubmit, onCancel, isLoading = false }: RegisterMemberFormProps) {
  const [formData, setFormData] = useState<CreateMemberRequest>({
    firstName: '',
    lastName: '',
    employeeId: '',
    workDomain: 'ACADEMIC',
    email: '',
    phoneNumber: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required'
    }

    if (!formData.workDomain) {
      newErrors.workDomain = 'Work domain is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error registering member:', error)
    }
  }

  const handleChange = (field: keyof CreateMemberRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-bold text-gray-800 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.firstName ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-bold text-gray-800 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.lastName ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employeeId" className="block text-sm font-bold text-gray-800 mb-2">
            Employee ID *
          </label>
          <input
            type="text"
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.employeeId ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
            placeholder="Enter employee ID"
          />
          {errors.employeeId && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.employeeId}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="workDomain" className="block text-sm font-bold text-gray-800 mb-2">
            Work Domain *
          </label>
          <select
            id="workDomain"
            value={formData.workDomain}
            onChange={(e) => handleChange('workDomain', e.target.value as any)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.workDomain ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
          >
            {workDomainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.workDomain && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.workDomain}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.email ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-800 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium bg-white/60 backdrop-blur-sm ${
              errors.phoneNumber ? 'border-red-300 bg-red-50/40' : 'border-white/40 hover:bg-white/70 focus:bg-white/80'
            }`}
            disabled={isLoading}
            placeholder="Enter phone number"
          />
          {errors.phoneNumber && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Registration Info */}
      <div className="bg-gradient-to-r from-blue-50/40 to-indigo-50/40 backdrop-blur-sm p-6 rounded-xl border border-white/30">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center text-lg">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Registration Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-white/30 text-center">
            <div className="text-blue-600 font-semibold text-sm mb-1">Registration Fee</div>
            <div className="text-gray-900 font-bold text-xl">500.00 ETB</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-white/30 text-center">
            <div className="text-blue-600 font-semibold text-sm mb-1">Initial Shares</div>
            <div className="text-gray-900 font-bold text-xl">3 shares</div>
            <div className="text-gray-500 text-sm">450.00 ETB</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-white/30 text-center">
            <div className="text-blue-600 font-semibold text-sm mb-1">Total Cost</div>
            <div className="text-green-600 font-bold text-xl">950.00 ETB</div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-white/30">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-transparent rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering Member...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Register Member
            </div>
          )}
        </button>
      </div>
    </form>
  )
}