/**
 * Medical Record service — MongoDB-backed JSON envelope form.
 *
 * Form data is shipped as a single JSON payload (`formData`); the backend
 * persists it to MongoDB (collection: medical_records) and stores only the
 * resulting ObjectId (`mongoDocumentId`) in the relational DB alongside the
 * MedicalRecord metadata.
 *
 * Endpoints:
 *  - POST /api/v1/doctor-appointment/medical-record/create          — tạo mới
 *  - GET  /api/v1/doctor-appointment/medical-record/{id}/detail    — xem chi tiết
 *  - PUT  /api/v1/doctor-appointment/medical-record/{id}           — cập nhật
 *    (BE fetches JSON from MongoDB via MongoDocumentId and inlines it
 *    into the response as `formData`.)
 */
import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  CreateMedicalRecordRequest,
  CreateMedicalRecordResponse,
  MedicalRecordDetailResponse,
  MedicalRecordFormDataPayload,
  UpdateMedicalRecordResponse,
} from "@/types"

class MedicalRecordService {
  /** POST /api/v1/doctor-appointment/medical-record/create */
  async create(
    payload: CreateMedicalRecordRequest
  ): Promise<ApiResponse<CreateMedicalRecordResponse>> {
    const response = await apiClient.post<
      ApiResponse<CreateMedicalRecordResponse>
    >("/doctor-appointment/medical-record/create", payload)
    return response.data
  }

  /** GET /api/v1/doctor-appointment/medical-record/{id}/detail */
  async getDetail(
    id: string
  ): Promise<ApiResponse<MedicalRecordDetailResponse>> {
    const response = await apiClient.get<
      ApiResponse<MedicalRecordDetailResponse>
    >(`/doctor-appointment/medical-record/${id}/detail`)
    return response.data
  }

  /** GET /api/v1/medical-records/{id} - Get record by ID */
  async getById(id: string): Promise<ApiResponse<MedicalRecordDetailResponse>> {
    const response = await apiClient.get<
      ApiResponse<MedicalRecordDetailResponse>
    >(`/medical-records/${id}`)
    return response.data
  }

  /** PUT /api/v1/doctor-appointment/medical-record/{id} - Update record */
  async update(
    id: string,
    payload: { formData: MedicalRecordFormDataPayload }
  ): Promise<ApiResponse<UpdateMedicalRecordResponse>> {
    const response = await apiClient.put<
      ApiResponse<UpdateMedicalRecordResponse>
    >(`/doctor-appointment/medical-record/${id}`, payload)
    return response.data
  }
}

export const medicalRecordService = new MedicalRecordService()
export default medicalRecordService
