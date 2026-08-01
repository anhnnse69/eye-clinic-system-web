import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  GetMedicalRecordsRequest,
  GetMedicalRecordsItem,
  GetMedicalRecordsMeta,
  GetMedicalRecordDetailResponse,
  UpdateMedicalRecordRequest,
  UpdateMedicalRecordResponse,
} from "@/types"

export interface GetMedicalRecordsApiResponse extends ApiResponse<GetMedicalRecordsItem[]> {
  meta?: GetMedicalRecordsMeta
}

export interface GetMedicalRecordDetailApiResponse extends ApiResponse<GetMedicalRecordDetailResponse> {}

export interface UpdateMedicalRecordApiResponse extends ApiResponse<UpdateMedicalRecordResponse> {}

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

  async updateMedicalRecord(
    id: string,
    data: UpdateMedicalRecordRequest
  ): Promise<UpdateMedicalRecordApiResponse> {
    const response = await apiClient.put<UpdateMedicalRecordApiResponse>(
      `/medical-records/${id}`,
      data
    )
    return response.data
  }
}

export const medicalRecordsService = new MedicalRecordsService()
export default medicalRecordsService
