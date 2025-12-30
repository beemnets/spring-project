import React from 'react'

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  className?: string
}

export function FloatingActionButton({ onClick, icon, className = '' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ 
        position: 'fixed', 
        bottom: '32px', 
        right: '32px', 
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
    >
      {icon || (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  )
}