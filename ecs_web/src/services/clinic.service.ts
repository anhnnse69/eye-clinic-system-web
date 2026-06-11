import { apiClient } from "@/lib/axios"
import type { ApiResponse, ClinicManagementItem, MetaResponse } from "@/types"

export interface GetClinicsParams {
  searchTerm?: string
  status?: string       // "ACTIVE" hoặc "INACTIVE"
  pageNumber?: number
  pageSize?: number
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

  /**
   * Bổ sung hàm Vô hiệu hóa / Kích hoạt lại (Nếu có endpoint tương ứng xử lý trên UI)
   */
  async toggleClinicStatus(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.put<ApiResponse<boolean>>(
      `/system-admin/clinics/${id}/toggle-status`
    )
    return response.data
  }
}

export const clinicsService = new ClinicsService()
export default clinicsService