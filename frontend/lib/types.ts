export interface Member {
  id: number
  firstName: string
  lastName: string
  employeeId: string
  workDomain: 'ACADEMIC' | 'ADMINISTRATION' | 'CONTRACT' | 'OTHER'
  email?: string
  phoneNumber?: string
  registrationDate: string
  registrationFee: number
  isActive: boolean
  deactivationDate?: string
  deactivationReason?: string
  shares?: Share[]
  savingAccounts?: SavingAccount[]
}

export interface Share {
  id: number
  shareValue: number
  purchaseDate: string
  certificateNumber: string
  isActive: boolean
}

export interface SavingAccount {
  id: number
  accountNumber: string
  accountType: 'FORMAL' | 'INFORMAL'
  currentBalance: number
  openingDate: string
  isActive: boolean
  monthlyAmount?: number // For formal accounts
  targetAmount?: number // For informal accounts
  transactions?: Transaction[]
}

export interface Transaction {
  id: number
  amount: number
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'PENALTY' | 'FEE'
  description?: string
  transactionDate: string
  referenceNumber: string
}

export interface AuthUser {
  username: string
  role: 'ASSISTANT' | 'MANAGER' | 'ADMIN'
  token: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  role: 'ASSISTANT' | 'MANAGER' | 'ADMIN'
}

export interface CreateMemberRequest {
  firstName: string
  lastName: string
  employeeId: string
  workDomain: 'ACADEMIC' | 'ADMINISTRATION' | 'CONTRACT' | 'OTHER'
  email?: string
  phoneNumber?: string
}

export interface UpdateMemberRequest {
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
}

export interface ApiResponse<T> {
  message: string
  data?: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
}

export interface ApiError {
  error: string
  message: string
  status: number
}