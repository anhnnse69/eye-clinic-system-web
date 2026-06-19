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
}

export const doctorScheduleService = new DoctorScheduleService();
export default doctorScheduleService;