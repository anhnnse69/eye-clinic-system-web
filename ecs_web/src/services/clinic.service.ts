import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Clinic } from "@/types"

interface ClinicFilters {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

class ClinicService {
  async list(params?: ClinicFilters): Promise<PaginatedResponse<Clinic>> {
    const response = await apiClient.get<PaginatedResponse<Clinic>>("/clinics", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.get<ApiResponse<Clinic>>(`/clinics/${id}`)
    return response.data
  }

  async create(data: Partial<Clinic>): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.post<ApiResponse<Clinic>>("/clinics", data)
    return response.data
  }

  async update(id: string, data: Partial<Clinic>): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.patch<ApiResponse<Clinic>>(`/clinics/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/clinics/${id}`)
    return response.data
  }

  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.patch<ApiResponse<Clinic>>(`/clinics/${id}`, { isActive })
    return response.data
  }
  
  async getProfile(): Promise<ApiResponse<Partial<Clinic>>> {
    const response = await apiClient.get<ApiResponse<Partial<Clinic>>>(
      "/clinic-admin/clinic/profile"
    )
    return response.data
  }
}


export const clinicService = new ClinicService()
export default clinicService
