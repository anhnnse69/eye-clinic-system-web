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

// ── Doctor (dùng cho lễ tân chọn doctor trước khi tạo lịch) ──

export interface DoctorOptionItem {
  doctorId: string;
  fullName: string;
  specialty?: string;
  avatarUrl?: string;
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

// ── Edit Schedule ──

export interface EditDoctorScheduleRequest {
  workDate?: string;
  roomId?: string;
  note?: string;
}

export interface EditDoctorScheduleResponse {
  scheduleId: string;
  workDate: string;
  shiftType: ShiftType;
  roomName: string;
  note?: string;
  updatedAt: string;
}

export interface BlockUnblockSlotRequest {
  block: boolean;
}

export interface DeleteDoctorScheduleResponse {
  scheduleId: string;
  deletedAt: string;
}

export interface ShiftRangeItem {
  shiftType: ShiftType;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
}

// ── Batch Create Schedule ──

export interface DoctorRoomAssignment {
  doctorId: string;
  roomId: string;
}

export interface BatchCreateDoctorScheduleRequest {
  assignments: DoctorRoomAssignment[];
  workDates: string[];
  shiftTypes: string[];
}

export interface DoctorBatchResult {
  doctorId: string;
  doctorName: string;
  created: CreatedScheduleItem[];
  skipped: SkippedScheduleItem[];
}

export interface BatchCreateDoctorScheduleResponse {
  results: DoctorBatchResult[];
  totalCreated: number;
  totalSkipped: number;
}

class DoctorScheduleService {
  // ── Doctor xem lịch của chính mình ──
  async getPersonalSchedule(
    doctorId: string,
    params: ViewDoctorPersonalScheduleRequest
  ): Promise<ApiResponse<ViewDoctorPersonalScheduleResponse>> {
    const response = await apiClient.get<
      ApiResponse<ViewDoctorPersonalScheduleResponse>
    >(`/doctors/${doctorId}/schedule`, { params });

    return response.data;
  }

  // ── Lễ tân: danh sách phòng active của clinic mình ──
  async getActiveRoomsForReceptionist(): Promise<ApiResponse<ClinicRoomItem[]>> {
    const response = await apiClient.get<ApiResponse<ClinicRoomItem[]>>(
      `/receptionist/rooms`
    );
    return response.data;
  }

  // ── Lễ tân: danh sách doctor để chọn trước khi tạo lịch ──
  async getActiveDoctors(): Promise<ApiResponse<DoctorOptionItem[]>> {
    const response = await apiClient.get<ApiResponse<DoctorOptionItem[]>>(
      `/receptionist/doctors`
    );
    return response.data;
  }

  async getShiftRanges(): Promise<ApiResponse<ShiftRangeItem[]>> {
    const response = await apiClient.get<ApiResponse<ShiftRangeItem[]>>(
      `/receptionist/clinic/shift-ranges`
    );
    return response.data;
  }

  // ── Lễ tân: tạo lịch trực cho doctor đã chọn ──
  async createSchedule(
    doctorId: string,
    payload: CreateDoctorScheduleRequest
  ): Promise<ApiResponse<CreateDoctorScheduleResponse>> {
    const response = await apiClient.post<
      ApiResponse<CreateDoctorScheduleResponse>
    >(`/receptionist/doctors/${doctorId}/schedule`, payload);
    return response.data;
  }

    // ── Lễ tân: tạo lịch trực hàng loạt cho nhiều bác sĩ ──
  async batchCreateSchedule(
    payload: BatchCreateDoctorScheduleRequest
  ): Promise<ApiResponse<BatchCreateDoctorScheduleResponse>> {
    const response = await apiClient.post<
      ApiResponse<BatchCreateDoctorScheduleResponse>
    >(`/receptionist/doctors/schedule/batch`, payload);
    return response.data;
  }

  async editSchedule(
    doctorId: string,
    scheduleId: string,
    payload: EditDoctorScheduleRequest
  ): Promise<ApiResponse<EditDoctorScheduleResponse>> {
    const response = await apiClient.put<ApiResponse<EditDoctorScheduleResponse>>(
      `/receptionist/doctors/${doctorId}/schedule/${scheduleId}`,
      payload
    );
    return response.data;
  }

  async deleteSchedule(
    doctorId: string,
    scheduleId: string
  ): Promise<ApiResponse<DeleteDoctorScheduleResponse>> {
    const response = await apiClient.delete<ApiResponse<DeleteDoctorScheduleResponse>>(
      `/receptionist/doctors/${doctorId}/schedule/${scheduleId}`
    );
    return response.data;
  }

  // ── Doctor: chỉ còn quyền khóa/mở slot của chính mình ──
  async toggleSlotBlockForReceptionist(
    doctorId: string,
    slotId: string,
    block: boolean
  ): Promise<ApiResponse<string>> {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/receptionist/doctors/${doctorId}/schedule/slots/${slotId}/block`,
      { block }
    );
    return response.data;
  }
}

export const doctorScheduleService = new DoctorScheduleService();
export default doctorScheduleService;