import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import { ShiftType, SlotStatus } from "@/types";

export interface SlotAppointmentItem {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  status: string;
  symptoms?: string;
}

export interface ScheduleSlotItem {
  slotId: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  currentPatients: number;
  status: SlotStatus;
  appointments: SlotAppointmentItem[];
}

export interface ScheduleShiftItem {
  scheduleId: string;
  shiftType: ShiftType;
  note?: string;
  roomId?: string;
  roomName?: string;
  slots: ScheduleSlotItem[];
}

export interface ViewDoctorPersonalScheduleResponse {
  workDate: string;
  shifts: ScheduleShiftItem[];
}

export interface ViewDoctorPersonalScheduleRequest {
  workDate: string; // yyyy-MM-dd
  shiftType?: ShiftType | "";
}
// ── Clinic Room (riêng cho doctor) ──

export interface ClinicRoomItem {
  roomId: string;
  roomName: string;
  roomType: string;
  isActive: boolean;
}

// ── Create Schedule ──

export interface CreateDoctorScheduleRequest {
  workDates: string[];
  shiftTypes: string[];
  roomId: string;
}

export interface CreatedScheduleItem {
  scheduleId: string;
  workDate: string;
  shiftType: ShiftType;
  roomName: string;
  slotCount: number;
}

export interface SkippedScheduleItem {
  workDate: string;
  shiftType: ShiftType;
  reason: string;
}

export interface CreateDoctorScheduleResponse {
  created: CreatedScheduleItem[];
  skipped: SkippedScheduleItem[];
}

class DoctorScheduleService {
  async getPersonalSchedule(
    doctorId: string,
    params: ViewDoctorPersonalScheduleRequest
  ): Promise<ApiResponse<ViewDoctorPersonalScheduleResponse>> {
    const response = await apiClient.get<
      ApiResponse<ViewDoctorPersonalScheduleResponse>
    >(`/doctors/${doctorId}/schedule`, { params });

    return response.data;
  }

  async getActiveRooms(
    doctorId: string
  ): Promise<ApiResponse<ClinicRoomItem[]>> {
    const response = await apiClient.get<
    ApiResponse<ClinicRoomItem[]>>(
      `/doctors/${doctorId}/rooms`
    );
    return response.data;
  }

  async createSchedule(
    doctorId: string,
    payload: CreateDoctorScheduleRequest
  ): Promise<ApiResponse<CreateDoctorScheduleResponse>> {
    const response = await apiClient.post<
    ApiResponse < CreateDoctorScheduleResponse >
    > (`/doctors/${doctorId}/schedule`, payload);
    return response.data;
  }
}

export const doctorScheduleService = new DoctorScheduleService();
export default doctorScheduleService;