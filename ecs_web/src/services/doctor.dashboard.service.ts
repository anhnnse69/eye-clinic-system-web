import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface TodayScheduleSummary {
  totalShifts: number;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  blockedSlots: number;
}

export interface AppointmentStatusSummary {
  total: number;
  activeTotal: number;
  pending: number;
  depositPaid: number;
  booked: number;
  arrived: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface DailyTrendItem {
  date: string;
  completedCount: number;
  totalCount: number;
}

export interface UpcomingAppointmentItem {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string;
  status: string;
}

export interface DoctorDashboardResponse {
  todaySchedule: TodayScheduleSummary;
  todayAppointments: AppointmentStatusSummary;
  periodAppointments: AppointmentStatusSummary;
  totalPatients: number;
  trend: DailyTrendItem[];
  upcomingToday: UpcomingAppointmentItem[];
}

export interface DoctorDashboardRequest {
  startDate?: string;
  endDate?: string;
}

class DoctorDashboardService {
  async getDashboard(
    doctorId: string,
    params: DoctorDashboardRequest
  ): Promise<ApiResponse<DoctorDashboardResponse>> {
    const response = await apiClient.get<ApiResponse<DoctorDashboardResponse>>(
      `/doctors/${doctorId}/dashboard`,
      { params }
    );
    return response.data;
  }
}

export const doctorDashboardService = new DoctorDashboardService();
export default doctorDashboardService;