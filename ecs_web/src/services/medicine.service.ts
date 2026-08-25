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

export interface GetMedicineCatalogRequest {
  pageNumber: number
  pageSize: number
  isActive?: boolean
  searchTerm?: string
}

export interface GetMedicineCatalogResponse {
  id: string
  medicineName: string
  genericName: string | null
  unit: string
  dosageForm: string
  concentration: string
  manufacturer: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateMedicineCatalogRequest {
  medicineName: string
  genericName?: string
  unit: string
  dosageForm?: string
  concentration?: string
  manufacturer?: string
  notes?: string
}

export interface CreateMedicineCatalogResponse {
  id: string
}

export interface UpdateMedicineCatalogRequest {
  id: string
  medicineName: string
  genericName?: string
  unit: string
  dosageForm?: string
  concentration?: string
  manufacturer?: string
  notes?: string
  isActive: boolean
}

export interface UpdateMedicineCatalogResponse {
  id: string
  medicineName: string
  isActive: boolean
  updatedAt: string
}

export interface DeleteMedicineCatalogRequest {
  id: string
}

export interface DeleteMedicineCatalogResponse {
  id: string
  medicineName: string
  isActive: boolean
  updatedAt: string
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

  async getMedicineCatalog(params: GetMedicineCatalogRequest): Promise<ApiResponse<GetMedicineCatalogResponse[]>> {
    const response = await apiClient.get<ApiResponse<GetMedicineCatalogResponse[]>>(
      "/clinic-admin/medicine-catalog",
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

  async createMedicine(params: CreateMedicineCatalogRequest): Promise<ApiResponse<CreateMedicineCatalogResponse>> {
    const response = await apiClient.post<ApiResponse<CreateMedicineCatalogResponse>>(
      "/clinic-admin/medicine-catalog/create",
      params
    )
    return response.data
  }

  async updateMedicineCatalog(params: UpdateMedicineCatalogRequest): Promise<ApiResponse<UpdateMedicineCatalogResponse>> {
    const response = await apiClient.put<ApiResponse<UpdateMedicineCatalogResponse>>(
      "/clinic-admin/medicine-catalog/edit",
      params
    )
    return response.data
  }

  async toggleMedicineStatus(params: DeleteMedicineCatalogRequest): Promise<ApiResponse<DeleteMedicineCatalogResponse>> {
  const response = await apiClient.put<ApiResponse<DeleteMedicineCatalogResponse>>(
    `/clinic-admin/medicine-catalog/${params.id}/delete`
  );
  return response.data;
}
}

export const medicineService = new MedicineService()
export default medicineService
