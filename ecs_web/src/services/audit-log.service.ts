import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, AuditLog } from "@/types"

interface AuditLogFilters {
  userId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

class AuditLogService {
  async list(params?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>("/audit-logs", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<AuditLog>> {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`)
    return response.data
  }

  async getByUser(userId: string, page?: number, pageSize?: number): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(`/audit-logs/user/${userId}`, {
      params: { page, pageSize },
    })
    return response.data
  }

  async getByResource(resource: string, resourceId: string): Promise<ApiResponse<AuditLog[]>> {
    const response = await apiClient.get<ApiResponse<AuditLog[]>>(`/audit-logs/resource`, {
      params: { resource, resourceId },
    })
    return response.data
  }
}

export const auditLogService = new AuditLogService()
export default auditLogService
