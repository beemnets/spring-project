import React, { useState, useEffect } from 'react'
import { Member, UpdateMemberRequest } from '@/lib/types'

interface UpdateMemberFormProps {
  member: Member
  onSubmit: (data: UpdateMemberRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function UpdateMemberForm({ member, onSubmit, onCancel, isLoading = false }: UpdateMemberFormProps) {
  const [formData, setFormData] = useState<UpdateMemberRequest>({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email || '',
    phoneNumber: member.phoneNumber || ''
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
      console.error('Error updating member:', error)
    }
  }

  const handleChange = (field: keyof UpdateMemberRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Member Info Display */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
          <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Current Member Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
            <span className="text-blue-600 font-semibold text-sm block mb-1">Employee ID</span>
            <span className="font-bold text-gray-900 text-lg">{member.employeeId}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
            <span className="text-blue-600 font-semibold text-sm block mb-1">Work Domain</span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              member.workDomain === 'ACADEMIC' ? 'bg-purple-100 text-purple-800' :
              member.workDomain === 'ADMINISTRATION' ? 'bg-blue-100 text-blue-800' :
              member.workDomain === 'CONTRACT' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {member.workDomain}
            </span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
            <span className="text-blue-600 font-semibold text-sm block mb-1">Registration Date</span>
            <span className="font-bold text-gray-900">{new Date(member.registrationDate).toLocaleDateString()}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
            <span className="text-blue-600 font-semibold text-sm block mb-1">Status</span>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
              member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                member.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              {member.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
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
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium ${
              errors.firstName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white/70 hover:bg-white focus:bg-white'
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
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium ${
              errors.lastName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white/70 hover:bg-white focus:bg-white'
            }`}
            disabled={isLoading}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.lastName}</p>
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
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium ${
              errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white/70 hover:bg-white focus:bg-white'
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
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 font-medium ${
              errors.phoneNumber ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white/70 hover:bg-white focus:bg-white'
            }`}
            disabled={isLoading}
            placeholder="Enter phone number"
          />
          {errors.phoneNumber && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-transparent rounded-xl hover:from-b">
        </button>
      </div>
    </form>
  )
}