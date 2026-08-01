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

export type AppointmentStatusEnum =
  | "PENDING"
  | "DEPOSIT_PAID"
  | "BOOKED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NOSHOW";

export interface ClinicAppointmentItem {
  appointmentId: string;
  appointmentDate: string;
  status: AppointmentStatusEnum | string;
  symptoms?: string;
  bookingSource: string;
  depositAmount: number;
  depositPaid: boolean;

  doctorId: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorAvatarUrl?: string;

  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientAvatarUrl?: string;
  patientGender?: string;
  patientDob?: string;

  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;

  slotStartTime: string;
  slotEndTime: string;

  hasMedicalRecord: boolean;
  medicalRecordId?: string;
  createdAt: string;
}

export interface ViewClinicAppointmentsRequest {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  date?: string;       // "yyyy-MM-dd"
  search?: string;
  doctorId?: string;
}

export interface ViewClinicAppointmentsResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  appointments: ClinicAppointmentItem[];
}

export type AppointmentDecision = "CONFIRM" | "REJECT";

export interface ConfirmRejectAppointmentRequest {
  decision: AppointmentDecision;
  rejectReason?: string;
}

export interface ConfirmRejectAppointmentResponse {
  appointmentId: string;
  status: AppointmentStatusEnum;
  noteReason?: string;
  updatedAt: string;
}

// Status còn cho phép lễ tân Confirm/Reject (chưa được xử lý)
export const ACTIONABLE_STATUSES: AppointmentStatusEnum[] = [
  "PENDING",
  "DEPOSIT_PAID",
];

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

  async getAppointments(
    params: ViewClinicAppointmentsRequest
  ): Promise<ApiResponse<ViewClinicAppointmentsResponse>> {
    const response = await apiClient.get<
      ApiResponse<ViewClinicAppointmentsResponse>
    >(`/receptionist/appointments`, { params });

    return response.data;
  }

  async confirmRejectAppointment(
    appointmentId: string,
    payload: ConfirmRejectAppointmentRequest
  ): Promise<ApiResponse<ConfirmRejectAppointmentResponse>> {
    const response = await apiClient.patch<
      ApiResponse<ConfirmRejectAppointmentResponse>
    >(`/receptionist/appointments/${appointmentId}/decision`, payload);
    return response.data;
  }
}

export const clinicAppointmentService = new ClinicAppointmentService()