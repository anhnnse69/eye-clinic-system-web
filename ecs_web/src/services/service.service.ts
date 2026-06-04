import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Service } from "@/types"

interface ServiceFilters {
  clinicId?: string
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

interface CreateServiceData {
  name: string
  description?: string
  price: number
  duration: number
  category?: string
}

interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  duration?: number
  category?: string
  isActive?: boolean
}

class ServiceService {
  async list(params?: ServiceFilters): Promise<PaginatedResponse<Service>> {
    const response = await apiClient.get<PaginatedResponse<Service>>("/services", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Service>> {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`)
    return response.data
  }

  async create(data: CreateServiceData): Promise<ApiResponse<Service>> {
    const response = await apiClient.post<ApiResponse<Service>>("/services", data)
    return response.data
  }

  async update(id: string, data: UpdateServiceData): Promise<ApiResponse<Service>> {
    const response = await apiClient.patch<ApiResponse<Service>>(`/services/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/services/${id}`)
    return response.data
  }

  async getByClinic(clinicId: string): Promise<ApiResponse<Service[]>> {
    const response = await apiClient.get<ApiResponse<Service[]>>(`/services/clinic/${clinicId}`)
    return response.data
  }
}

export const serviceService = new ServiceService()
export default serviceService
