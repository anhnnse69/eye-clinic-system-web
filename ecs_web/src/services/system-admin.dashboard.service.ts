import { apiClient } from "@/lib/axios"
import type { ApiResponse, AdminSystemDashboardResponse, AdminSystemDashboardParams } from "@/types"

class SystemAdminDashboardService {
  /**
   * Lấy dữ liệu tổng hợp phân tích của toàn bộ hệ thống hoặc theo bộ lọc chi nhánh
   */
  async getSystemDashboard(params?: AdminSystemDashboardParams): Promise<ApiResponse<AdminSystemDashboardResponse>> {
    const response = await apiClient.get<ApiResponse<AdminSystemDashboardResponse>>(
      "/system-admin/dashboard", // Đã sửa từ "/system-admin/dashboard" thành đường dẫn thực tế của BE
      {
        params: {
          clinicId: params?.clinicId || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
      }
    )
    return response.data
  }
}

export const systemAdminDashboardService = new SystemAdminDashboardService()
export default systemAdminDashboardService