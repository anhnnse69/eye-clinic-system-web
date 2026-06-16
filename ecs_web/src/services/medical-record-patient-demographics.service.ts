import { apiClient } from "@/lib/axios"
import type { ApiResponse, ViewPatientDemographicsResponse, ViewPatientDemographicsRequest } from "@/types"

class MedicalRecordPatientDemographicsService {
  async getPatientDemographics(
    params: ViewPatientDemographicsRequest
  ): Promise<ApiResponse<ViewPatientDemographicsResponse>> {
    const response = await apiClient.get<ApiResponse<ViewPatientDemographicsResponse>>(
      "/medical-record/patient-demographics",
      { params }
    )

    return response.data
  }
}

export const medicalRecordPatientDemographicsService =
  new MedicalRecordPatientDemographicsService()
export default medicalRecordPatientDemographicsService
