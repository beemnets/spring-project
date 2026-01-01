import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  Member,
  SavingAccount,
  Transaction,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  ApiResponse,
  PageResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth-token");
      Cookies.remove("auth-user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthUser>> =>
    api.post("/auth/login", data),

  register: (
    data: RegisterRequest
  ): Promise<AxiosResponse<ApiResponse<AuthUser>>> =>
    api.post("/auth/register", data),

  // Staff management (Admin only)
  getAllStaff: (
    page = 0,
    size = 10,
    sort = "username",
    direction = "asc",
    search?: string
  ): Promise<AxiosResponse<ApiResponse<PageResponse<AuthUser>>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      direction: direction,
    });
    if (search) {
      params.append("search", search);
    }
    return api.get(`/auth/staff?${params.toString()}`);
  },

  deleteStaff: (
    username: string
  ): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.delete(`/auth/staff/${username}`),

  updateStaffRole: (
    username: string,
    role: string
  ): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/auth/staff/${username}/role`, { role }),
};

// Members API
export const membersAPI = {
  // Public
  create: (data: CreateMemberRequest): Promise<AxiosResponse<Member>> =>
    api.post("/members", data),

  // Authenticated with pagination and sorting
  getAll: (
    page = 0,
    size = 10,
    sort = "id",
    direction = "asc",
    search?: string,
    includeInactive = false
  ): Promise<AxiosResponse<PageResponse<Member>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });
    if (search) {
      params.append("search", search);
    }
    if (includeInactive) {
      params.append("includeInactive", "true");
    }
    return api.get(`/members?${params.toString()}`);
  },

  // Get all members including inactive ones (same as getAll with includeInactive=true)
  getAllIncludingInactive: (
    page = 0,
    size = 10,
    sort = "id",
    direction = "asc",
    search?: string
  ): Promise<AxiosResponse<PageResponse<Member>>> => {
    return membersAPI.getAll(page, size, sort, direction, search, true);
  },

  search: (
    query: string,
    page = 0,
    size = 10,
    sort = "id",
    direction = "asc"
  ): Promise<AxiosResponse<PageResponse<Member>>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });
    return api.get(`/members/search?${params.toString()}`);
  },

  getByDomain: (
    domain: string,
    page = 0,
    size = 10,
    sort = "id",
    direction = "asc"
  ): Promise<AxiosResponse<PageResponse<Member>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });
    return api.get(`/members/domain/${domain}?${params.toString()}`);
  },

  getById: (id: number): Promise<AxiosResponse<Member>> =>
    api.get(`/members/${id}`),

  getFullById: (id: number): Promise<AxiosResponse<Member>> =>
    api.get(`/members/${id}/full`),

  update: (
    id: number,
    data: UpdateMemberRequest
  ): Promise<AxiosResponse<Member>> => api.put(`/members/${id}`, data),

  deactivate: (
    id: number,
    reason: string
  ): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.put(`/members/${id}/deactivate?reason=${encodeURIComponent(reason)}`),

  reactivate: (id: number): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.put(`/members/${id}/reactivate`),

  checkEligibility: (
    id: number
  ): Promise<AxiosResponse<ApiResponse<boolean>>> =>
    api.get(`/members/${id}/eligibility`),

  getSharesValue: (id: number): Promise<AxiosResponse<ApiResponse<number>>> =>
    api.get(`/members/${id}/shares/value`),

  getCount: (): Promise<
    AxiosResponse<{
      totalMembers: number;
      activeMembers: number;
      inactiveMembers: number;
    }>
  > => api.get("/members/stats/count"),

  purchaseShares: (id: number, quantity: number): Promise<AxiosResponse<any>> =>
    api.post(`/members/${id}/shares?quantity=${quantity}`),
};

// Accounts API
export const accountsAPI = {
  // Get all accounts with pagination
  getAll: (
    page = 0,
    size = 10,
    sort = "id",
    direction = "asc",
    search?: string
  ): Promise<AxiosResponse<PageResponse<SavingAccount>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sort},${direction}`,
    });
    if (search) {
      params.append("search", search);
    }
    return api.get(`/accounts?${params.toString()}`);
  },

  createFormal: (
    memberId: number,
    monthlyAmount: number
  ): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(
      `/accounts/formal?memberId=${memberId}&monthlyAmount=${monthlyAmount}`
    ),

  createInformal: (
    memberId: number,
    targetAmount?: number
  ): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(
      `/accounts/informal?memberId=${memberId}${
        targetAmount ? `&targetAmount=${targetAmount}` : ""
      }`
    ),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<SavingAccount>>> =>
    api.get(`/accounts/${id}`),

  getByAccountNumber: (
    accountNumber: string
  ): Promise<AxiosResponse<ApiResponse<SavingAccount>>> =>
    api.get(`/accounts/number/${accountNumber}`),

  getByMemberId: (
    memberId: number
  ): Promise<AxiosResponse<ApiResponse<SavingAccount[]>>> =>
    api.get(`/accounts/member/${memberId}`),

  getActiveBymemberId: (
    memberId: number
  ): Promise<AxiosResponse<ApiResponse<SavingAccount[]>>> =>
    api.get(`/accounts/member/${memberId}/active`),

  getMemberBalance: (
    memberId: number
  ): Promise<AxiosResponse<ApiResponse<number>>> =>
    api.get(`/accounts/member/${memberId}/balance`),

  deposit: (
    id: number,
    amount: number,
    description?: string
  ): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(
      `/accounts/${id}/deposit?amount=${amount}${
        description ? `&description=${encodeURIComponent(description)}` : ""
      }`
    ),

  monthlyDeposit: (id: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/accounts/${id}/deposit/monthly`),

  withdraw: (
    id: number,
    amount: number,
    description?: string
  ): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(
      `/accounts/${id}/withdraw?amount=${amount}${
        description ? `&description=${encodeURIComponent(description)}` : ""
      }`
    ),

  close: (id: number): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.put(`/accounts/${id}/close`),

  deactivate: (id: number): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.put(`/accounts/${id}/deactivate`),

  reactivate: (id: number): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.put(`/accounts/${id}/reactivate`),

  bulkDeposit: (
    workDomain: string,
    amount: number,
    description?: string
  ): Promise<AxiosResponse<ApiResponse<any>>> => {
    const params = new URLSearchParams({
      workDomain,
      amount: amount.toString(),
    });
    if (description) {
      params.append("description", description);
    }
    return api.post(`/accounts/bulk-deposit?${params.toString()}`);
  },
};

export default api;
