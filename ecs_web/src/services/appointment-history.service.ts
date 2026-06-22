import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface GetAppointmentHistoryRequest {
    searchTerm?: string
    status?: string
    pageNumber?: number
    pageSize?: number
}

export interface GetAppointmentHistoryResponse {
    id_appointment: string
    appointmentDate: string
    timeSlot: string
    status: string
    clinicName: string
    clinicAddress: string
    patientName: string
    doctorName: string
    serviceName: string
    servicePrice: string
}

export interface CancelAppointmentRequest {
    appointmentId: string
    reason?: string
}

export interface CancelAppointmentResponse {
    appointmentId: string
    status: string
    cancelledAt: string
    cancellationReason?: string
    message: string
}

class AppointmentHistoryService {
    async getAll(
        params: GetAppointmentHistoryRequest
    ): Promise<ApiResponse<GetAppointmentHistoryResponse[]>> {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== "")
        )
        const response = await apiClient.get<
            ApiResponse<GetAppointmentHistoryResponse[]>
        >("/patient/appointments/history", {
            params: cleanParams,
        })
        return response.data
    }

    async cancelAppointment(
        params: CancelAppointmentRequest
    ): Promise<ApiResponse<CancelAppointmentResponse>> {
        const response = await apiClient.patch<
            ApiResponse<CancelAppointmentResponse>
        >(`/patient/appointments/${params.appointmentId}/cancel`, {
            reason: params.reason
        })
        return response.data
    }
}

export const appointmentHistoryService = new AppointmentHistoryService()