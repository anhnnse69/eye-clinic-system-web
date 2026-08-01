import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"


interface DoctorTimeSlot {
    slotId: string
    startTime: string
    endTime: string
    maxPatients: number
    currentPatients: number
    remaining: number
    status: string
}

interface DoctorScheduleDay {
    scheduleId: string
    workDate: string
    shiftType: string
    slots: DoctorTimeSlot[]
}

interface ViewDoctorSlotsResponse {
    doctorId: string
    fullName: string
    avatarUrl?: string
    title?: string
    specialty?: string
    clinicName: string
    clinicAddress: string
    experienceYears: number
    bio?: string
    ratingAvg?: number
    reviewCount?: number
    scheduleDays: DoctorScheduleDay[]
}

export interface ClinicBasicInfo {
    id: string
    name: string
    address: string
    phone?: string
    logoUrl?: string
}

export interface DoctorOption {
    id_doctor: string
    fullName: string
    title?: string
    specialtyName?: string
    experienceYears: number
}

export interface ServiceOption {
    id_service: string
    serviceName: string
    price?: number
    durationMinutes: number
}

export interface SlotOption {
    id_slot: string
    startTime: string
    endTime: string
    maxPatients: number
    currentPatients: number
    isAvailable: boolean
}

export interface PatientProfileOption {
    id: string
    fullName: string
    gender: string
    dob: string
    relationship?: string
}

export interface BookAppointmentRequest {
    patientId: string
    doctorId: string
    slotId: string
    serviceId?: string
    symptoms?: string
}

export interface BookAppointmentResponse {
    id_appointment: string
    doctorName: string
    clinicName: string
    serviceName: string
    appointmentDate: string
    timeSlot: string
    status: string
    depositAmount: number
    depositPaid: boolean
    bookingSource: string
}

export interface ClinicSlotOption {
    id: string
    startTime: string
    endTime: string
    isAvailable: boolean
    clinicId: string
    date: string
}

export interface BookAppointmentByClinicRequest {
    clinicId: string
    patientId: string
    slotId: string
    serviceId?: string
    symptoms?: string
}

function formatTimeHHmm(isoOrTime: string): string {
    if (/^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime
    try {
        const d = new Date(isoOrTime)
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
        })
    } catch {
        return isoOrTime
    }
}

class PatientAppointmentService {

    async getClinicBasicInfo(clinicId: string): Promise<ApiResponse<ClinicBasicInfo>> {
        const res = await apiClient.get<ApiResponse<{
            id: string; name: string; address: string; phone: string; logoUrl?: string
        }>>(`/clinics/${clinicId}`)

        const apiResponse = res.data
        const data = apiResponse.data
            ? {
                id: apiResponse.data.id,
                name: apiResponse.data.name,
                address: apiResponse.data.address,
                phone: apiResponse.data.phone,
                logoUrl: apiResponse.data.logoUrl,
            }
            : undefined

        return { codeMessage: apiResponse.codeMessage, data }
    }

    async getDoctorsByClinic(clinicId: string): Promise<ApiResponse<DoctorOption[]>> {
        const res = await apiClient.get<ApiResponse<DoctorOption[]>>(
            `/clinics/${clinicId}/doctors`
        )
        return res.data
    }

    async getServicesByClinic(clinicId: string): Promise<ApiResponse<ServiceOption[]>> {
        const res = await apiClient.get<ApiResponse<ServiceOption[]>>(
            `/clinics/${clinicId}/services`
        )
        return res.data
    }

    async getDoctorSlotsDetail(doctorId: string): Promise<ApiResponse<ViewDoctorSlotsResponse>> {
        const res = await apiClient.get<ApiResponse<ViewDoctorSlotsResponse>>(
            `/doctors/${doctorId}/slots`
        )
        return res.data
    }

    async getDoctorSlots(doctorId: string, date: string): Promise<ApiResponse<SlotOption[]>> {
        const res = await apiClient.get<ApiResponse<ViewDoctorSlotsResponse>>(
            `/doctors/${doctorId}/slots`
        )
        const apiResponse = res.data
        if (!apiResponse.data) {
            return { codeMessage: apiResponse.codeMessage, data: [] }
        }

        const allSlots: SlotOption[] = []

        apiResponse.data.scheduleDays.forEach((day) => {
            if (day.workDate === date) {
                day.slots.forEach((slot) => {
                    allSlots.push({
                        id_slot: slot.slotId,
                        startTime: formatTimeHHmm(slot.startTime),
                        endTime: formatTimeHHmm(slot.endTime),
                        maxPatients: slot.maxPatients,
                        currentPatients: slot.currentPatients,
                        isAvailable: slot.status === "AVAILABLE" && slot.remaining > 0,
                    })
                })
            }
        })

        allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))

        return { codeMessage: apiResponse.codeMessage, data: allSlots }
    }

    async getMyProfiles(): Promise<ApiResponse<PatientProfileOption[]>> {
        const res = await apiClient.get<ApiResponse<PatientProfileOption[]>>(
            "/patient/profiles/booking-options"
        )
        return res.data
    }

    async bookAppointment(
        payload: BookAppointmentRequest
    ): Promise<ApiResponse<BookAppointmentResponse>> {
        const res = await apiClient.post<ApiResponse<BookAppointmentResponse>>(
            "/appointments",
            {
                patientId: payload.patientId,
                doctorId: payload.doctorId,
                slotId: payload.slotId,
                serviceId: payload.serviceId ?? null,
                symptoms: payload.symptoms ?? null,
            }
        )
        return res.data
    }

    async getClinicAvailableSlots(
        clinicId: string,
        date: string,
        serviceId?: string
    ): Promise<ApiResponse<ClinicSlotOption[]>> {
        const params = new URLSearchParams({
            date: date,
            ...(serviceId && { serviceId })
        })
        const res = await apiClient.get<ApiResponse<ClinicSlotOption[]>>(
            `/clinics/${clinicId}/available-slots?${params.toString()}`
        )
        return res.data
    }

    async bookAppointmentByClinic(
        payload: BookAppointmentByClinicRequest
    ): Promise<ApiResponse<BookAppointmentResponse>> {
        const res = await apiClient.post<ApiResponse<BookAppointmentResponse>>(
            "/appointments/by-clinic",
            {
                clinicId: payload.clinicId,
                patientId: payload.patientId,
                slotId: payload.slotId,
                serviceId: payload.serviceId ?? null,
                symptoms: payload.symptoms ?? null,
            }
        )
        return res.data
    }
}

export const patientAppointmentService = new PatientAppointmentService()