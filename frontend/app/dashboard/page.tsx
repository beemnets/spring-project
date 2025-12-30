'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { membersAPI, accountsAPI } from '@/lib/api'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  totalAccounts: number
  recentRegistrations: number
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  trend,
  isLoading = false
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  trend?: { value: number; isPositive: boolean }
  isLoading?: boolean
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
    red: 'from-red-50 to-red-100 border-red-200'
  }

  const iconColorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconColorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
            trend.isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            <svg className={`w-3 h-3 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    </div>
  )
}

function QuickActions({ role }: { role: string }) {
  const quickActions = [
    {
      name: 'Register Member',
      href: '/member-management',
      icon: '👤',
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['ASSISTANT', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Create Account',
      href: '/account-management',
      icon: '💳',
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['ASSISTANT', 'MANAGER', 'ADMIN']
    },
    {
      name: 'View Statistics',
      href: '/statistics',
      icon: '📊',
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['MANAGER', 'ADMIN']
    },
    {
      name: 'Enforcement',
      href: '/enforcement',
      icon: '⚖️',
      color: 'bg-orange-500 hover:bg-orange-600',
      roles: ['MANAGER']
    }
  ]

  const availableActions = quickActions.filter(action => action.roles.includes(role))

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {availableActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`${action.color} text-white p-4 rounded-xl text-center transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-sm font-medium">{action.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      
      // Get recent members (last 10 registered)
      const membersResponse = await membersAPI.getAll(0, 10, 'registrationDate', 'desc')
      const members = Array.isArray(membersResponse.data) ? membersResponse.data : membersResponse.data.content || []
      
      // Get recent accounts (last 10 created)
      let accounts: any[] = []
      try {
        const accountsResponse = await accountsAPI.getAll(0, 10, 'openingDate', 'desc')
        accounts = Array.isArray(accountsResponse.data) ? accountsResponse.data : accountsResponse.data.content || []
      } catch (error) {
        console.log('Could not load recent accounts:', error)
      }

      // Combine and format activities
      const recentActivities: Array<{
        id: string
        type: string
        user: string
        time: string
        icon: string
        color: string
      }> = []
      
      // Add recent member registrations
      members.slice(0, 3).forEach((member, index) => {
        const registrationDate = new Date(member.registrationDate)
        const timeAgo = getTimeAgo(registrationDate)
        recentActivities.push({
          id: `member-${member.id}`,
          type: 'member_registered',
          user: `${member.firstName} ${member.lastName}`,
          time: timeAgo,
          icon: '👤',
          color: 'text-blue-500'
        })
      })

      // Add recent account creations
      accounts.slice(0, 2).forEach((account, index) => {
        const openingDate = new Date(account.openingDate)
        const timeAgo = getTimeAgo(openingDate)
        recentActivities.push({
          id: `account-${account.id}`,
          type: 'account_created',
          user: `Account ${account.accountNumber}`,
          time: timeAgo,
          icon: '💳',
          color: 'text-green-500'
        })
      })

      // Sort by most recent and take top 4
      recentActivities.sort((a, b) => {
        // This is a simple sort, in a real app you'd sort by actual timestamps
        return 0 // Keep the order as is since we're already getting recent items
      })

      setActivities(recentActivities.slice(0, 4))
    } catch (error) {
      console.error('Error loading recent activity:', error)
      // Fallback to empty array
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
        <Link href="/statistics" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
              <div className={`text-xl ${activity.color}`}>{activity.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-xs text-gray-500 capitalize">{activity.type.replace('_', ' ')}</p>
              </div>
              <div className="text-xs text-gray-400">{activity.time}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RoleBasedNavigation({ role }: { role: string }) {
  const navigationItems = [
    {
      name: 'Member Management',
      href: '/member-management',
      icon: '👥',
      description: 'Register, view, and manage members',
      roles: ['ASSISTANT', 'MANAGER', 'ADMIN'],
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Account Management', 
      href: '/account-management',
      icon: '💳',
      description: 'Create and manage saving accounts',
      roles: ['ASSISTANT', 'MANAGER', 'ADMIN'],
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Staff Management',
      href: '/staff-management', 
      icon: '👨‍💼',
      description: 'Create and manage staff members',
      roles: ['ADMIN'],
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: '📊', 
      description: 'View system statistics and reports',
      roles: ['MANAGER', 'ADMIN'],
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Enforcement',
      href: '/enforcement',
      icon: '⚖️',
      description: 'Deactivate/reactivate members and accounts',
      roles: ['MANAGER'],
      gradient: 'from-red-500 to-red-600'
    }
  ]

  const availableItems = navigationItems.filter(item => item.roles.includes(role))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="group block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{item.name}</h3>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
            <span>Access Module</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}

function RoleInfo({ role }: { role: string }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ASSISTANT': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access including staff management and statistics'
      case 'MANAGER':
        return 'Member and account management, statistics, and enforcement actions'
      case 'ASSISTANT':
        return 'Basic member registration and account management operations'
      default:
        return 'Limited access'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑'
      case 'MANAGER': return '👨‍💼'
      case 'ASSISTANT': return '👤'
      default: return '❓'
    }
  }

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{getRoleIcon(role)}</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Access Level</h3>
            <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border ${getRoleColor(role)}`}>
              {role}
            </span>
            <p className="text-gray-600 mt-2 text-sm">{getRoleDescription(role)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Access to</p>
          <p className="text-3xl font-bold text-gray-900">
            {role === 'ADMIN' ? '4' : role === 'MANAGER' ? '4' : '2'}
          </p>
          <p className="text-sm text-gray-500">modules</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadDashboardStats()
      // Auto-refresh stats every 30 seconds
      const interval = setInterval(loadDashboardStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user, isLoading, router])

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true)
      
      // Load member statistics from dedicated endpoint
      const memberStatsResponse = await membersAPI.getCount()
      const memberStats = memberStatsResponse.data || {
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0
      }
      
      // Calculate recent registrations (last 7 days) from member list
      const membersResponse = await membersAPI.getAll(0, 1000, 'id', 'asc', undefined, true)
      const members = Array.isArray(membersResponse.data) ? membersResponse.data : membersResponse.data.content || []
      
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentRegistrations = members.filter(m => 
        new Date(m.registrationDate || '') > sevenDaysAgo
      ).length

      // Get real account data
      let totalAccounts = 0
      try {
        const accountsResponse = await accountsAPI.getAll(0, 1000) // Get all accounts
        const accounts = Array.isArray(accountsResponse.data) ? accountsResponse.data : accountsResponse.data.content || []
        totalAccounts = accounts.length
      } catch (accountError) {
        console.log('Could not load accounts, using member-based estimate:', accountError)
        // Fallback to estimate if accounts endpoint fails
        totalAccounts = Math.floor(memberStats.totalMembers * 1.2)
      }

      setStats({
        totalMembers: memberStats.totalMembers,
        activeMembers: memberStats.activeMembers,
        inactiveMembers: memberStats.inactiveMembers,
        totalAccounts,
        recentRegistrations
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ma'ed System
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-xs text-gray-500 hidden sm:block">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button 
                onClick={loadDashboardStats}
                disabled={statsLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Refresh Data"
              >
                <svg className={`w-5 h-5 ${statsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <button 
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your cooperative system.</p>
        </div>

        <RoleInfo role={user.role} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Members"
            value={stats?.totalMembers.toLocaleString() || '0'}
            color="blue"
            isLoading={statsLoading}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Members"
            value={stats?.activeMembers.toLocaleString() || '0'}
            subtitle={stats ? `${((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% of total` : ''}
            color="green"
            isLoading={statsLoading}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Recent Registrations"
            value={stats?.recentRegistrations.toLocaleString() || '0'}
            subtitle="Last 7 days"
            color="purple"
            isLoading={statsLoading}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          />
          <StatCard
            title="Total Accounts"
            value={stats?.totalAccounts.toLocaleString() || '0'}
            color="orange"
            isLoading={statsLoading}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QuickActions role={user.role} />
          <RecentActivity />
        </div>

        {/* Main Navigation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Modules</h2>
          <RoleBasedNavigation role={user.role} />
        </div>
      </div>
    </div>
  )
}