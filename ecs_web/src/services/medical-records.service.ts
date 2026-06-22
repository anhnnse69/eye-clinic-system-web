import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  GetMedicalRecordsRequest,
  GetMedicalRecordsItem,
  GetMedicalRecordsMeta,
  GetMedicalRecordDetailResponse,
} from "@/types"

export interface GetMedicalRecordsApiResponse extends ApiResponse<GetMedicalRecordsItem[]> {
  meta?: GetMedicalRecordsMeta
}

export interface GetMedicalRecordDetailApiResponse extends ApiResponse<GetMedicalRecordDetailResponse> {}

class MedicalRecordsService {
  async getMedicalRecords(
    params?: GetMedicalRecordsRequest
  ): Promise<GetMedicalRecordsApiResponse> {
    const response = await apiClient.get<GetMedicalRecordsApiResponse>(
      "/medical-records",
      { params }
    )
    return response.data
  }

  async getMedicalRecordById(id: string): Promise<GetMedicalRecordDetailApiResponse> {
    const response = await apiClient.get<GetMedicalRecordDetailApiResponse>(
      `/medical-records/${id}`
    )
    return response.data
  }
}

export const medicalRecordsService = new MedicalRecordsService()
export default medicalRecordsService
