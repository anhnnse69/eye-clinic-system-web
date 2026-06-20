import { apiClient } from "@/lib/axios";
import type {
  ApiResponse,
  DoctorScheduleMatrixRow,
  GetAvailableSlotsParams,
  SpecialtyCategoryResponse,
} from "@/types";

// Thêm các kiểu dữ liệu phục vụ riêng cho danh sách bệnh nhân của lễ tân
export interface GetPatientsParams {
  pageNumber: number;
  pageSize: number;
  searchName?: string;
  searchPhone?: string;
}

export interface PatientProfileItem {
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  identityNumber: string | null;
  address: string | null;
  phoneNumber: string | null;
  bhytNumber: string | null;
  bloodType: string | null;
  createdAt: string;
}

// --- THÊM MỚI ĐOẠN ĐỊNH NGHĨA PHỤC VỤ CHO MÀN CHI TIẾT ---
export interface ReceptionistAppointmentLogDto {
  id: string;
  clinicId: string;
  appointmentDate: string; // "yyyy-MM-ddTHH:mm:ss"
  doctorName: string;
  specialtyName: string;
  symptoms: string | null;
  status: "PENDING" | "DEPOSIT_PAID" | "BOOKED" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NOSHOW";
  bookingSource: "MOBILE_APP" | "WEBSITE" | "WALK_IN" | "ONLINE" | "WALKIN"; // Tương thích cả chuỗi text cũ/mới
}

export interface PatientDetailedProfile {
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string; // "yyyy-MM-dd"
  identityNumber: string | null;
  address: string | null;
  phoneNumber: string | null;
  bhytNumber: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  createdAt: string; // "yyyy-MM-ddTHH:mm:ssZ"
  email: string | null;
  avatarUrl: string | null;
  appointments: ReceptionistAppointmentLogDto[];
}

export interface ReceptionistUpdatePatientProfileRequest {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string; // "yyyy-MM-dd"
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  identityNumber: string | null;
  bhytNumber: string | null;
}

export interface ReceptionistUpdatePatientProfileResponse {
  id: string;
  fullName: string;
  updatedAt: string;
}

export interface ReceptionistCreatePatientProfileRequest {
  isHasAccount: boolean;
  selectedUserId: string | null;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string; // định dạng "yyyy-MM-dd"
  phoneNumber: string;
  email: string | null;
  address: string | null;
  identityNumber: string | null;
  bhytNumber: string | null;
}

export interface ReceptionistCreatePatientProfileResponse {
  patientProfileId: string;
  fullName: string;
  linkedUserId: string | null;
  isActiveAccountAutoCreated: boolean;
  generatedPassword: string | null; // <--- THÊM MỚI TRƯỜNG NÀY
  createdAt: string;
}

export interface ReceptionistSearchAccountParams {
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface ReceptionistSearchAccountItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface GetDailyAppointmentsParams {
  pageNumber: number;
  pageSize: number;
  targetDate?: string; // Định dạng "yyyy-MM-dd"
  shiftFilter?: "MORNING" | "AFTERNOON" | "EVENING" | "";
  searchPatient?: string;
  searchDoctor?: string;
}

export interface PatientProfileRowDto {
  id: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string; // "yyyy-MM-dd"
  phoneNumber: string | null;
  bhytNumber: string | null;
}

export interface DoctorProfileRowDto {
  id: string;
  fullName: string;
  clinicRoomName: string;
}

export interface TimeSlotRowDto {
  id: string;
  scheduleId: string;
  startTime: string; // "yyyy-MM-ddTHH:mm:ss"
  endTime: string;
  shiftType: "MORNING" | "AFTERNOON" | "EVENING";
}

export interface QueueInlineRowDto {
  id: string;
  queueNumber: number;
  status: "WAITING" | "CALLING" | "COMPLETED";
  calledAt: string | null;
}

export interface DailyAppointmentItemResponse {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  appointmentDate: string; // "yyyy-MM-dd"
  symptoms: string | null;
  status: "PENDING" | "DEPOSIT_PAID" | "CONFIRMED" | "BOOKED" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NOSHOW";
  depositAmount: number;
  depositPaid: boolean;
  bookingSource: string;
  patient: PatientProfileRowDto;
  doctor: DoctorProfileRowDto;
  slot: TimeSlotRowDto;
  queue: QueueInlineRowDto | null;
}

export interface ReceptionistPayDepositRequest {
  appointmentId: string;
}

export interface ReceptionistPayDepositResponse {
  appointmentId: string;
  depositPaid: boolean;
  updatedAt: string;
}

export interface ReceptionistCheckInRequest {
  appointmentId: string;
}

export interface ReceptionistCheckInResponse {
  appointmentId: string;
  status: string;
  queue: QueueInlineRowDto;
}

class ReceptionistService {
  /**
   * Lấy danh sách hồ sơ bệnh nhân kèm bộ lọc và phân trang từ server
   */
  async getPatients(params: GetPatientsParams): Promise<ApiResponse<PatientProfileItem[]>> {
    const queryParams: Record<string, any> = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    };

    if (params.searchName && params.searchName.trim() !== "") {
      queryParams.SearchName = params.searchName.trim();
    }
    if (params.searchPhone && params.searchPhone.trim() !== "") {
      queryParams.SearchPhone = params.searchPhone.trim();
    }

    return (
      await apiClient.get<ApiResponse<PatientProfileItem[]>>("/receptionist/patients", {
        params: queryParams,
      })
    ).data;
  }

  async getPatientDetails(id: string): Promise<ApiResponse<PatientDetailedProfile>> {
    return (
      await apiClient.get<ApiResponse<PatientDetailedProfile>>(`/receptionist/patients/${id}`)
    ).data;
  }

  async getAvailableSlots(
    params: GetAvailableSlotsParams
  ): Promise<ApiResponse<DoctorScheduleMatrixRow[]>> {
    const queryParams: Record<string, any> = {
      CurrentUserId: params.currentUserId
    };

    if (params.workDate) {
      queryParams.WorkDate = params.workDate;
    }
    if (params.searchDoctor && params.searchDoctor.trim() !== "") {
      queryParams.SearchDoctor = params.searchDoctor.trim();
    }
    if (params.shiftType && params.shiftType !== "") {
      queryParams.ShiftType = params.shiftType;
    }
    if (params.specialtyId && params.specialtyId !== "All" && params.specialtyId !== "") {
      queryParams.SpecialtyId = params.specialtyId;
    }

    return (
      await apiClient.get<ApiResponse<DoctorScheduleMatrixRow[]>>(
        "/receptionist/scheduler",
        { params: queryParams }
      )
    ).data;
  }

  async getActiveSpecialties(): Promise<ApiResponse<SpecialtyCategoryResponse[]>> {
    return (
      await apiClient.get<ApiResponse<SpecialtyCategoryResponse[]>>(
        "/specialties"
      )
    ).data;
  }

  async updatePatientProfile(
    id: string, 
    payload: ReceptionistUpdatePatientProfileRequest
  ): Promise<ApiResponse<ReceptionistUpdatePatientProfileResponse>> {
    return (
      await apiClient.put<ApiResponse<ReceptionistUpdatePatientProfileResponse>>(
        `/receptionist/patients/${id}`, 
        payload
      )
    ).data;
  }

  async createPatientProfile(
    payload: ReceptionistCreatePatientProfileRequest
  ): Promise<ApiResponse<ReceptionistCreatePatientProfileResponse>> {
    return (
      await apiClient.post<ApiResponse<ReceptionistCreatePatientProfileResponse>>(
        "/receptionist/patients",
        payload
      )
    ).data;
  }

  async searchAccounts(params: ReceptionistSearchAccountParams): Promise<ApiResponse<ReceptionistSearchAccountItem[]>> {
    const queryParams: Record<string, any> = {};

    if (params.fullName && params.fullName.trim() !== "") {
      queryParams.FullName = params.fullName.trim();
    }
    if (params.phone && params.phone.trim() !== "") {
      queryParams.Phone = params.phone.trim();
    }
    if (params.email && params.email.trim() !== "") {
      queryParams.Email = params.email.trim();
    }

    return (
      await apiClient.get<ApiResponse<ReceptionistSearchAccountItem[]>>(
        "/receptionist/users/search",
        { params: queryParams }
      )
    ).data;
  }

  async getDailyAppointments(params: GetDailyAppointmentsParams): Promise<ApiResponse<DailyAppointmentItemResponse[]>> {
    const queryParams: Record<string, any> = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    };

    if (params.targetDate) {
      queryParams.TargetDate = params.targetDate;
    }
    if (params.shiftFilter) {
      queryParams.ShiftFilter = params.shiftFilter;
    }
    if (params.searchPatient && params.searchPatient.trim() !== "") {
      queryParams.SearchPatient = params.searchPatient.trim();
    }
    if (params.searchDoctor && params.searchDoctor.trim() !== "") {
      queryParams.SearchDoctor = params.searchDoctor.trim();
    }

    return (
      await apiClient.get<ApiResponse<DailyAppointmentItemResponse[]>>("/receptionist/appointments/daily", {
        params: queryParams,
      })
    ).data;
  }

  async handleArrived(payload: ReceptionistCheckInRequest): Promise<ApiResponse<ReceptionistCheckInResponse>> {
    return (
      await apiClient.post<ApiResponse<ReceptionistCheckInResponse>>("/receptionist/appointments/arrive", payload)
    ).data;
  }

  async payDepositAtCounter(payload: ReceptionistPayDepositRequest): Promise<ApiResponse<ReceptionistPayDepositResponse>> {
    return (
      await apiClient.post<ApiResponse<ReceptionistPayDepositResponse>>("/receptionist/appointments/pay-deposit", payload)
    ).data;
  }

  async handleCancel(appointmentId: string): Promise<ApiResponse<any>> {
    return (
      await apiClient.post<ApiResponse<any>>(`/receptionist/appointments/${appointmentId}/cancel`)
    ).data;
  }
}

export const receptionistService = new ReceptionistService();
export default receptionistService;