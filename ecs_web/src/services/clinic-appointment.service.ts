import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface GetClinicAppointmentsRequest {
  searchTerm?: string
  status?: string         
  appointmentDate?: string 
  pageNumber: number
  pageSize: number
}

export interface GetClinicAppointmentResponse {
  id_appointment: string
  patientName: string
  patientPhone: string
  doctorName: string
  serviceName: string
  appointmentDate: string
  timeSlot: string
  status: string
  depositAmount: number
  depositPaid: boolean
  bookingSource: string
  symptoms: string
  createdAt: string
}

class ClinicAppointmentService {
  async getAll(params: GetClinicAppointmentsRequest): Promise<ApiResponse<GetClinicAppointmentResponse[]>> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== "")
    )

    const response = await apiClient.get<ApiResponse<GetClinicAppointmentResponse[]>>(
      "/clinic-admin/appointments",
      { params: cleanParams }
    )

    return response.data
  }
}

export const clinicAppointmentService = new ClinicAppointmentService()