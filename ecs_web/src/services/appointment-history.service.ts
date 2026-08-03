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
    hasFeedback?: boolean
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

export interface GetAppointmentDetailRequest {
    appointmentId: string
}

export interface GetAppointmentDetailResponse {
    id_appointment: string
    patientId?: string
    status: string
    createdAt: string

    patientName: string
    patientPhone: string
    patientEmail: string
    patientDob: string
    patientGender: string

    clinicName: string
    clinicAddress: string
    clinicPhone: string
    doctorName: string
    doctorTitle: string
    serviceName: string
    appointmentDate: string
    timeSlot: string
    symptoms?: string
    noteReason?: string

    feedback?: {
        ratingDoctor: number
        ratingClinic: number
        comment?: string
        isPublic: boolean
        createdAt: string
    }

    prescription?: {
        diagnosisMain: string
        diagnosisComorbid?: string
        doctorNotes?: string
        items: {
            medicineName: string
            dosage: string
            frequency: string
            durationDays: string
            quantity: string
            instruction: string
        }[]
    }
}

export interface SubmitFeedbackRequest {
    appointmentId: string
    ratingDoctor: number
    ratingClinic: number
    comment?: string
    isPublic?: boolean
}

export interface SubmitFeedbackResponse {
    feedbackId: string
    appointmentId: string
    ratingDoctor: number
    ratingClinic: number
    comment?: string
    isPublic: boolean
    createdAt: string
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

    async getDetail(
        params: GetAppointmentDetailRequest
    ): Promise<ApiResponse<GetAppointmentDetailResponse>> {
        const response = await apiClient.get<
            ApiResponse<GetAppointmentDetailResponse>
        >(`/patient/appointments/${params.appointmentId}`)
        return response.data
    }

    async submitFeedback(
        params: SubmitFeedbackRequest
    ): Promise<ApiResponse<SubmitFeedbackResponse>> {
        const response = await apiClient.post<
            ApiResponse<SubmitFeedbackResponse>
        >(`/patient/appointments/${params.appointmentId}/feedback`, {
            ratingDoctor: params.ratingDoctor,
            ratingClinic: params.ratingClinic,
            comment: params.comment,
            isPublic: params.isPublic ?? true
        })
        return response.data
    }
}

export const appointmentHistoryService = new AppointmentHistoryService()