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

export interface ViewClinicServicesRequest {
  pageNumber: number
  pageSize: number
  isActive?: boolean
  searchTerm?: string
}

export interface ViewClinicServiceResponse {
  id_service: string
  serviceName: string
  price: number | null
  durationMinutes: number
  isActive: boolean
}

export interface CreateServiceRequest {
  serviceName: string
  price: number
  durationMinutes: number
}

export interface CreateServiceResponse {
  id: string
  clinicId: string
  serviceName: string
  price: number
  durationMinutes: number
  isActive: boolean
}

export interface EditServiceRequest {
  serviceName: string
  price?: number
  durationMinutes: number
}

export interface EditServiceResponse {
  serviceId: string
  clinicId: string
  serviceName: string
  price: number | null
  durationMinutes: number
  updatedAt: string
}

export interface DeactivateServiceResponse {
  serviceId: string
  isActive: boolean
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

  async getClinicServices(params: ViewClinicServicesRequest): Promise<ApiResponse<ViewClinicServiceResponse[]>> {
    const response = await apiClient.get<ApiResponse<ViewClinicServiceResponse[]>>(
      "/clinic-admin/clinic-services",
      {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          isActive: params.isActive,
          searchTerm: params.searchTerm,
        },
      }
    )
    return response.data
  }

  async createService(data: CreateServiceRequest): Promise<ApiResponse<CreateServiceResponse>> {
    const response = await apiClient.post<ApiResponse<CreateServiceResponse>>(
      "/clinic-admin/clinic-services/create",
      data
    )
    return response.data
  }

  async editService(id: string, data: EditServiceRequest): Promise<ApiResponse<EditServiceResponse>> {
    const response = await apiClient.put<ApiResponse<EditServiceResponse>>(
      `/clinic-admin/clinic-services/${id}`,
      data
    )
    return response.data
  }

  async deactivateService(id: string): Promise<ApiResponse<DeactivateServiceResponse>> {
    const response = await apiClient.put<ApiResponse<DeactivateServiceResponse>>(
      `/clinic-admin/clinic-services/${id}/deactivate`
    )
    return response.data
  }
}

export const serviceService = new ServiceService()
export default serviceService
