import { apiClient } from "@/lib/axios";
import type {
  ApiResponse,
  DoctorScheduleMatrixRow,
  GetAvailableSlotsParams,
  SpecialtyCategoryResponse,
} from "@/types";

class ReceptionistService {

  async getAvailableSlots(
    params: GetAvailableSlotsParams
  ): Promise<ApiResponse<DoctorScheduleMatrixRow[]>> {
    
    // Khởi tạo object params chỉ giữ lại những gì có giá trị thực
    const queryParams: Record<string, any> = {
      CurrentUserId: params.currentUserId
    };

    // Chỉ truyền WorkDate nếu có giá trị
    if (params.workDate) {
      queryParams.WorkDate = params.workDate;
    }
    
    // Chỉ truyền SearchDoctor nếu người dùng có gõ chữ tìm kiếm
    if (params.searchDoctor && params.searchDoctor.trim() !== "") {
      queryParams.SearchDoctor = params.searchDoctor.trim();
    }
    
    // CHỈ truyền ShiftType lên nếu nó khác chuỗi rỗng ""
    if (params.shiftType && params.shiftType !== "") {
      queryParams.ShiftType = params.shiftType;
    }
    
    // CHỈ truyền SpecialtyId lên nếu nó không phải là "All" và không rỗng
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

  /**
   * Lấy danh sách chuyên khoa hoạt động để phục vụ bộ lọc Dropdown động
   */
  async getActiveSpecialties(): Promise<ApiResponse<SpecialtyCategoryResponse[]>> {
    // Endpoint giả định dựa trên cấu trúc Response SpecialtyCategoryResponse bạn đã cung cấp
    return (
      await apiClient.get<ApiResponse<SpecialtyCategoryResponse[]>>(
        "/specialties" // Hãy điều chỉnh endpoint này khớp với router backend chuyên khoa của bạn nếu cần
      )
    ).data;
  }
}

export const receptionistService = new ReceptionistService();
export default receptionistService;