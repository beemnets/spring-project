import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
      {/* Blurred backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      ></div>

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Modal panel - floating with enhanced glass effect */}
        <div className={`relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl transform transition-all w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/30 ring-1 ring-black/5`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm px-8 pt-8 pb-6 border-b border-white/30 sticky top-0 z-10 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600">Fill in the details below to register a new member</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none hover:bg-white/50 rounded-full p-3 transition-all duration-200 ml-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white/30 backdrop-blur-sm px-8 py-8 rounded-b-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}