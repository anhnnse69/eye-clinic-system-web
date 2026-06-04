import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Medicine } from "@/types"

interface MedicineFilters {
  clinicId?: string
  page?: number
  pageSize?: number
  search?: string
  category?: string
  isActive?: boolean
}

interface CreateMedicineData {
  name: string
  genericName?: string
  dosage: string
  unit: string
  price: number
  stock: number
  category?: string
  supplier?: string
  expiryDate?: string
}

interface UpdateMedicineData {
  name?: string
  genericName?: string
  dosage?: string
  unit?: string
  price?: number
  stock?: number
  category?: string
  supplier?: string
  expiryDate?: string
  isActive?: boolean
}

class MedicineService {
  async list(params?: MedicineFilters): Promise<PaginatedResponse<Medicine>> {
    const response = await apiClient.get<PaginatedResponse<Medicine>>("/medicines", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Medicine>> {
    const response = await apiClient.get<ApiResponse<Medicine>>(`/medicines/${id}`)
    return response.data
  }

  async create(data: CreateMedicineData): Promise<ApiResponse<Medicine>> {
    const response = await apiClient.post<ApiResponse<Medicine>>("/medicines", data)
    return response.data
  }

  async update(id: string, data: UpdateMedicineData): Promise<ApiResponse<Medicine>> {
    const response = await apiClient.patch<ApiResponse<Medicine>>(`/medicines/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/medicines/${id}`)
    return response.data
  }

  async updateStock(id: string, quantity: number): Promise<ApiResponse<Medicine>> {
    const response = await apiClient.patch<ApiResponse<Medicine>>(`/medicines/${id}/stock`, { quantity })
    return response.data
  }

  async search(query: string, clinicId?: string): Promise<ApiResponse<Medicine[]>> {
    const response = await apiClient.get<ApiResponse<Medicine[]>>("/medicines/search", {
      params: { q: query, clinicId },
    })
    return response.data
  }

  async getLowStock(threshold?: number, clinicId?: string): Promise<ApiResponse<Medicine[]>> {
    const response = await apiClient.get<ApiResponse<Medicine[]>>("/medicines/low-stock", {
      params: { threshold, clinicId },
    })
    return response.data
  }
}

export const medicineService = new MedicineService()
export default medicineService
