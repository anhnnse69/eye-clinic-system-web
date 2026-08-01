import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Appointment, AppointmentStatus, AppointmentType } from "@/types"

interface AppointmentFilters {
  doctorId?: string
  patientId?: string
  clinicId?: string
  status?: AppointmentStatus
  type?: AppointmentType
  date?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

interface CreateAppointmentData {
  patientId: string
  doctorId: string
  clinicId: string
  scheduledAt: string
  type: AppointmentType
  notes?: string
}

interface UpdateAppointmentData {
  scheduledAt?: string
  status?: AppointmentStatus
  type?: AppointmentType
  notes?: string
  doctorId?: string
  roomId?: string
}

class AppointmentService {
  async list(params?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<PaginatedResponse<Appointment>>("/appointments", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    return response.data
  }

  async create(data: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.post<ApiResponse<Appointment>>("/appointments", data)
    return response.data
  }

  async update(id: string, data: UpdateAppointmentData): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}`, data)
    return response.data
  }

  async cancel(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason })
    return response.data
  }

  async checkIn(id: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/check-in`)
    return response.data
  }

  async startConsultation(id: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/start`)
    return response.data
  }

  async complete(id: string, notes?: string): Promise<ApiResponse<Appointment>> {
    const response = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/complete`, { notes })
    return response.data
  }

  async getByDate(date: string, clinicId?: string): Promise<ApiResponse<Appointment[]>> {
    const response = await apiClient.get<ApiResponse<Appointment[]>>("/appointments/by-date", {
      params: { date, clinicId },
    })
    return response.data
  }

  async getStats(clinicId?: string, date?: string): Promise<ApiResponse<{
    total: number
    completed: number
    cancelled: number
    noShow: number
  }>> {
    const response = await apiClient.get<ApiResponse<{
      total: number
      completed: number
      cancelled: number
      noShow: number
    }>>("/appointments/stats", {
      params: { clinicId, date },
    })
    return response.data
  }
}

export const appointmentService = new AppointmentService()
export default appointmentService
