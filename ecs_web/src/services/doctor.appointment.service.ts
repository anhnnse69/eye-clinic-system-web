import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

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
}

export const doctorAppointmentService = new DoctorAppointmentService();
export default doctorAppointmentService;