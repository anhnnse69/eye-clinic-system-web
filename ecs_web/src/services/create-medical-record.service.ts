import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  CreateMedicalRecordRequest,
  CreateMedicalRecordResponse,
} from "@/types"

class CreateMedicalRecordService {
  /**
   * Creates a new medical record for an appointment.
   * Create Medical Record
   * POST /api/v1/doctor-appointment/medical-record/create
   */
  async createMedicalRecord(
    data: CreateMedicalRecordRequest
  ): Promise<ApiResponse<CreateMedicalRecordResponse>> {
    const response = await apiClient.post<
      ApiResponse<CreateMedicalRecordResponse>
    >("/doctor-appointment/medical-record/create", data)
    return response.data
  }
}

export const createMedicalRecordService = new CreateMedicalRecordService()
export default createMedicalRecordService
