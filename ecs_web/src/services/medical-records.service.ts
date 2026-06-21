import { apiClient } from "@/lib/axios"
import type { ApiResponse, GetMedicalRecordsRequest, GetMedicalRecordsItem, GetMedicalRecordsMeta } from "@/types"

export interface GetMedicalRecordsApiResponse extends ApiResponse<GetMedicalRecordsItem[]> {
  meta?: GetMedicalRecordsMeta
}

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

  async getMedicalRecordById(id: string): Promise<ApiResponse<GetMedicalRecordsItem>> {
    const response = await apiClient.get<ApiResponse<GetMedicalRecordsItem>>(
      `/medical-records/${id}`
    )
    return response.data
  }
}

export const medicalRecordsService = new MedicalRecordsService()
export default medicalRecordsService
