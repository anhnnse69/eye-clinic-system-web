import { apiClient } from "@/lib/axios"
import type { ApiResponse, ClinicManagementItem, MetaResponse } from "@/types"

export interface GetClinicsParams {
  searchTerm?: string
  status?: string      
  pageNumber?: number
  pageSize?: number
}


export interface UpdateClinicRequest {
  name: string
  address: string
  phone: string
  email: string | null
  logoUrl: string | null
  description: string | null
}


export interface GetClinicByIdDetail {
  name: string
  address: string
  phone: string
  email: string
  logoUrl: string
  description: string
  isActive: boolean
  ratingAvg: number
  reviewCount: number
}

class ClinicsService {
  /**
   * Lấy danh sách các phòng khám (Master list)
   */
  async getClinics(params?: GetClinicsParams): Promise<ApiResponse<ClinicManagementItem[]>> {
    const response = await apiClient.get<ApiResponse<ClinicManagementItem[]>>(
      "/system-admin/clinics",
      {
        params: {
          searchTerm: params?.searchTerm,
          status: params?.status,
          pageNumber: params?.pageNumber || 1,
          pageSize: params?.pageSize || 10,
        },
      }
    )
    return response.data
  }

  
  async deleteClinic(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/system-admin/clinics/${id}`
    )
    return response.data
  }

  
  async getClinicById(id: string): Promise<ApiResponse<GetClinicByIdDetail>> {
    const response = await apiClient.get<ApiResponse<GetClinicByIdDetail>>(
      `/system-admin/clinics/${id}`
    );
    return response.data;
  }

  
  async updateClinic(id: string, data: UpdateClinicRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/system-admin/clinics/${id}`,
      data
    );
    return response.data;
  }
}

export const clinicsService = new ClinicsService()
export default clinicsService