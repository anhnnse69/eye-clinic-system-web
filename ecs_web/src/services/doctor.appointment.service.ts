import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

// ── Khớp 1:1 với ECS.Domain.Enums.AppointmentStatus ──
export type AppointmentStatusEnum =
  | "PENDING"
  | "DEPOSIT_PAID"
  | "BOOKED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NOSHOW";

export interface AppointmentItem {
  appointmentId: string;
  appointmentDate: string;
  status: string;
  symptoms?: string;
  bookingSource: string;
  depositAmount: number;
  depositPaid: boolean;
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

export interface ViewDoctorAppointmentsRequest {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  date?: string;       // "yyyy-MM-dd"
  search?: string;
}

export interface ViewDoctorAppointmentsResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  appointments: AppointmentItem[];
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

// Status còn cho phép Confirm/Reject (chưa được xử lý)
export const ACTIONABLE_STATUSES: AppointmentStatusEnum[] = [
  "PENDING",
  "DEPOSIT_PAID",
];

class DoctorAppointmentService {
  async getAppointments(
    doctorId: string,
    params: ViewDoctorAppointmentsRequest
  ): Promise<ApiResponse<ViewDoctorAppointmentsResponse>> {
    const response = await apiClient.get<
      ApiResponse<ViewDoctorAppointmentsResponse>
    >(`/doctors/${doctorId}/appointments`, { params });

    return response.data;
  }

  async confirmRejectAppointment(
    doctorId: string,
    appointmentId: string,
    payload: ConfirmRejectAppointmentRequest
  ): Promise<ApiResponse<ConfirmRejectAppointmentResponse>> {
    const response = await apiClient.patch<
      ApiResponse<ConfirmRejectAppointmentResponse>
    >(
      `/doctors/${doctorId}/appointments/${appointmentId}/decision`,
      payload
    );
    return response.data;
  }
}

export const doctorAppointmentService = new DoctorAppointmentService();
export default doctorAppointmentService;