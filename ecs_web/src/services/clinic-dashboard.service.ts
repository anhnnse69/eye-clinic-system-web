import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface DashboardChartItem {
  date: string
  revenue: number
  appointments: number
}

export interface ClinicDashboardResponse {
  totalAppointments: number
  completedAppointments: number
  pendingAppointments: number
  cancelledAppointments: number

  totalRevenue: number

  totalDoctors: number
  totalStaffs: number
  totalServices: number
  totalRooms: number
  totalMedicines: number

  weeklyStatistics: DashboardChartItem[]
}

class ClinicDashboardService {
  async get(): Promise<ApiResponse<ClinicDashboardResponse>> {
    const response =
      await apiClient.get<ApiResponse<ClinicDashboardResponse>>(
        "/clinic-admin/dashboard"
      )

    return response.data
  }
}

export const clinicDashboardService =
  new ClinicDashboardService()