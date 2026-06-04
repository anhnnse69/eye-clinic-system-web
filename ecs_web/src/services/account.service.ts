import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, User } from "@/types"
import type { Role } from "@/types"

interface AccountFilters {
  role?: Role
  clinicId?: string
  page?: number
  pageSize?: number
  search?: string
}

interface CreateAccountData {
  email: string
  password: string
  name: string
  role: Role
  clinicId?: string
}

interface UpdateAccountData {
  name?: string
  role?: Role
  clinicId?: string
  isActive?: boolean
}

class AccountService {
  async list(params?: AccountFilters): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>("/accounts", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/accounts/${id}`)
    return response.data
  }

  async create(data: CreateAccountData): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>("/accounts", data)
    return response.data
  }

  async update(id: string, data: UpdateAccountData): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/accounts/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/accounts/${id}`)
    return response.data
  }

  async changePassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/accounts/${id}/change-password`, {
      newPassword,
    })
    return response.data
  }

  async resetPassword(id: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    const response = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(
      `/accounts/${id}/reset-password`
    )
    return response.data
  }
}

export const accountService = new AccountService()
export default accountService
