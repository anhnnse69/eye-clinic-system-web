// import { apiClient } from "@/lib/axios";
// import type {
//   ApiResponse,
//   DoctorScheduleMatrixRow,
//   GetAvailableSlotsParams,
//   SpecialtyCategoryResponse,
// } from "@/types";

// class ReceptionistService {

//   async getAvailableSlots(
//     params: GetAvailableSlotsParams
//   ): Promise<ApiResponse<DoctorScheduleMatrixRow[]>> {

//     // Khởi tạo object params chỉ giữ lại những gì có giá trị thực
//     const queryParams: Record<string, any> = {
//       CurrentUserId: params.currentUserId
//     };

//     // Chỉ truyền WorkDate nếu có giá trị
//     if (params.workDate) {
//       queryParams.WorkDate = params.workDate;
//     }

//     // Chỉ truyền SearchDoctor nếu người dùng có gõ chữ tìm kiếm
//     if (params.searchDoctor && params.searchDoctor.trim() !== "") {
//       queryParams.SearchDoctor = params.searchDoctor.trim();
//     }

//     // CHỈ truyền ShiftType lên nếu nó khác chuỗi rỗng ""
//     if (params.shiftType && params.shiftType !== "") {
//       queryParams.ShiftType = params.shiftType;
//     }

//     // CHỈ truyền SpecialtyId lên nếu nó không phải là "All" và không rỗng
//     if (params.specialtyId && params.specialtyId !== "All" && params.specialtyId !== "") {
//       queryParams.SpecialtyId = params.specialtyId;
//     }

//     return (
//       await apiClient.get<ApiResponse<DoctorScheduleMatrixRow[]>>(
//         "/receptionist/scheduler",
//         { params: queryParams }
//       )
//     ).data;
//   }

//   /**
//    * Lấy danh sách chuyên khoa hoạt động để phục vụ bộ lọc Dropdown động
//    */
//   async getActiveSpecialties(): Promise<ApiResponse<SpecialtyCategoryResponse[]>> {
//     // Endpoint giả định dựa trên cấu trúc Response SpecialtyCategoryResponse bạn đã cung cấp
//     return (
//       await apiClient.get<ApiResponse<SpecialtyCategoryResponse[]>>(
//         "/specialties" // Hãy điều chỉnh endpoint này khớp với router backend chuyên khoa của bạn nếu cần
//       )
//     ).data;
//   }
// }

// export const receptionistService = new ReceptionistService();
// export default receptionistService;
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

class ReceptionistService {
  /**
   * Lấy danh sách hồ sơ bệnh nhân kèm bộ lọc và phân trang từ server
   */
  async getPatients(params: GetPatientsParams): Promise<ApiResponse<PatientProfileItem[]>> {
    const queryParams: Record<string, any> = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    };

    // Khớp chính xác với Query Parameters trên API của bạn
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
}

export const receptionistService = new ReceptionistService();
export default receptionistService;