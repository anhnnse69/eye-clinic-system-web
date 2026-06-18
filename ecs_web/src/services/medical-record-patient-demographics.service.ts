import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  ViewPatientDemographicsResponse,
  ViewPatientDemographicsListResponse,
  ViewPatientDemographicsRequest,
  GetDetailPatientDemographicsResponse,
} from "@/types"

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

  async getPatientDemographicsList(
    params: ViewPatientDemographicsRequest
  ): Promise<ApiResponse<ViewPatientDemographicsListResponse>> {
    const response = await apiClient.get<
      ApiResponse<ViewPatientDemographicsListResponse>
    >("/medical-record/patient-demographics", { params })

    return response.data
  }

  async getPatientDemographicsDetail(
    patientId: string
  ): Promise<ApiResponse<GetDetailPatientDemographicsResponse>> {
    const response = await apiClient.get<
      ApiResponse<GetDetailPatientDemographicsResponse>
    >(`/medical-record/demographics/${patientId}`)

    return response.data
  }
}

export const medicalRecordPatientDemographicsService =
  new MedicalRecordPatientDemographicsService()
export default medicalRecordPatientDemographicsService
