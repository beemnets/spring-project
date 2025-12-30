import React from 'react'

interface SortableHeaderProps {
  children: React.ReactNode
  sortKey: string
  currentSort: string
  currentDirection: 'asc' | 'desc'
  onSort: (key: string, direction: 'asc' | 'desc') => void
  className?: string
}

export function SortableHeader({
  children,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
  className = ''
}: SortableHeaderProps) {
  const handleClick = () => {
    if (currentSort === sortKey) {
      // Toggle direction if same column
      onSort(sortKey, currentDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to ascending for new column
      onSort(sortKey, 'asc')
    }
  }

  const isActive = currentSort === sortKey

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg
            className={`w-3 h-3 ${
              isActive && currentDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg
            className={`w-3 h-3 -mt-1 ${
              isActive && currentDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </th>
  )
}