
import { apiClient } from "@/lib/axios"
import type { ApiResponse, ClinicApplication, GetClinicApplicationDetailResponse, RejectClinicApplicationRequest, MetaResponse } from "@/types"

export interface GetClinicApplicationsParams {
  searchTerm?: string
  status?: string       // 👈 1. Thêm thuộc tính status (optional) vào params
  pageNumber?: number
  pageSize?: number
}

interface GetClinicApplicationsResponse {
  data: ClinicApplication[]
  meta: MetaResponse
}

class ClinicApplicationsService {
  /**
   * Lấy danh sách đơn đăng ký phòng khám
   */
  async getApplications(params?: GetClinicApplicationsParams): Promise<ApiResponse<ClinicApplication[]>> {
    const response = await apiClient.get<ApiResponse<ClinicApplication[]>>(
      "/system-admin/applications",
      {
        params: {
          searchTerm: params?.searchTerm,
          status: params?.status, // 👈 2. Truyền kèm status để Axios map vào query string (?status=...)
          pageNumber: params?.pageNumber || 1,
          pageSize: params?.pageSize || 10,
        },
      }
    )
    return response.data
  }

  /**
   * Lấy chi tiết một đơn đăng ký theo ID
   */
  async getApplicationById(id: string): Promise<ApiResponse<GetClinicApplicationDetailResponse>> {
    const response = await apiClient.get<ApiResponse<GetClinicApplicationDetailResponse>>(
      `/system-admin/applications/${id}`
    )
    return response.data
  }

  /**
   * Chấp thuận đơn đăng ký phòng khám
   */
  async approveApplication(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/system-admin/applications/${id}/approve`
    )
    return response.data
  }

  /**
   * Từ chối đơn đăng ký phòng khám
   */
  async rejectApplication(id: string, request: RejectClinicApplicationRequest): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/system-admin/applications/${id}/reject`,
      request
    )
    return response.data
  }
}

export const clinicApplicationsService = new ClinicApplicationsService()
export default clinicApplicationsService