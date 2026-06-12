import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Staff } from "@/types"

interface StaffFilters {
  clinicId?: string
  specialty?: string
  isActive?: boolean
  page?: number
  pageSize?: number
  search?: string
}

interface CreateStaffData {
  userId: string
  clinicId: string
  specialty?: string
  licenseNumber?: string
  department?: string
  position?: string
}

interface UpdateStaffData {
  specialty?: string
  licenseNumber?: string
  department?: string
  position?: string
  isActive?: boolean
}

export interface StaffAccountResponse {
  userId: string;    
  fullName: string;
  email: string;
  phone: string;
  role: string; 
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffAccountRequest {
  phone: string      
  email: string
  fullName: string
  password: string    
  staffRole: number   
}

class StaffService {
  async list(params?: StaffFilters): Promise<PaginatedResponse<Staff>> {
    const response = await apiClient.get<PaginatedResponse<Staff>>("/staff", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Staff>> {
    const response = await apiClient.get<ApiResponse<Staff>>(`/staff/${id}`)
    return response.data
  }

  async create(data: CreateStaffData): Promise<ApiResponse<Staff>> {
    const response = await apiClient.post<ApiResponse<Staff>>("/staff", data)
    return response.data
  }

  async update(id: string, data: UpdateStaffData): Promise<ApiResponse<Staff>> {
    const response = await apiClient.patch<ApiResponse<Staff>>(`/staff/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/staff/${id}`)
    return response.data
  }

  async getByClinic(clinicId: string): Promise<ApiResponse<Staff[]>> {
    const response = await apiClient.get<ApiResponse<Staff[]>>(`/staff/clinic/${clinicId}`)
    return response.data
  }

  async getBySpecialty(specialty: string, clinicId?: string): Promise<ApiResponse<Staff[]>> {
    const response = await apiClient.get<ApiResponse<Staff[]>>("/staff/specialty", {
      params: { specialty, clinicId },
    })
    return response.data
  }
  
  async getStaffList(): Promise<ApiResponse<StaffAccountResponse[]>> {
    const response = await apiClient.get<ApiResponse<StaffAccountResponse[]>>(
      "https://localhost:7070/api/v1/clinic-admin/staff/accounts"
    )
    return response.data
  }

  async createStaffAccount(data: CreateStaffAccountRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "https://localhost:7070/api/v1/clinic-admin/staff/create", 
      data
    )
    return response.data
  }
}



export const staffService = new StaffService()
export default staffService
