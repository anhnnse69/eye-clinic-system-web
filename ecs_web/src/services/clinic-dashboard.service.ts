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
  cancelledAppointments: number
  totalRevenue: number
  totalStaffs: number
  totalServices: number
  totalRooms: number
  totalMedicines: number

  weeklyStatistics: DashboardChartItem[]
}

export interface ClinicProfileReportDto {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  openTime: string
  closeTime: string
  ratingAvg?: number
  reviewCount?: number
  isActive: boolean
  isPublished: boolean
  createdAt: string
  totalStaffs: number
  totalMedicalRecords: number
  totalServices: number
  totalRooms: number
}

export interface ClinicStaffReportDto {
  userId: string
  fullName: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface ClinicMedicalRecordReportDto {
  recordId: string
  appointmentId: string
  patientName: string
  patientPhone: string
  patientGender: string
  patientDob: string
  doctorName: string
  recordType: string
  chiefComplaint?: string
  summary?: string
  notes?: string
  status: string
  finalizedAt?: string
  createdAt: string
}

export interface ClinicServiceReportDto {
  serviceId: string
  serviceName: string
  price: number
  durationMinutes: number
  isActive: boolean
}

export interface ClinicRoomReportDto {
  roomId: string
  roomName: string
  roomType?: string
  isActive: boolean
}

export interface ExportClinicReportResponse {
  clinicInfo: ClinicProfileReportDto
  staffs: ClinicStaffReportDto[]
  medicalRecords: ClinicMedicalRecordReportDto[]
  services: ClinicServiceReportDto[]
  rooms: ClinicRoomReportDto[]
}

class ClinicDashboardService {
  async get(): Promise<ApiResponse<ClinicDashboardResponse>> {
    const response =
      await apiClient.get<ApiResponse<ClinicDashboardResponse>>(
        "/clinic-admin/dashboard"
      )

    return response.data
  }

  async getExportReport(): Promise<ApiResponse<ExportClinicReportResponse>> {
    const response = await apiClient.get<ApiResponse<ExportClinicReportResponse>>(
      "/clinic-admin/export-report"
    )
    return response.data
  }
}

export const clinicDashboardService =
  new ClinicDashboardService()