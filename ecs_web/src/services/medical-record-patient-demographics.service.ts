import { apiClient } from "@/lib/axios"
import type {
  ApiResponse,
  ViewPatientDemographicsResponse,
  ViewPatientDemographicsListResponse,
  ViewPatientDemographicsRequest,
  CreatePatientDemographicsRequest,
  CreatePatientDemographicsResponse,
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

  async createPatientDemographics(
    request: CreatePatientDemographicsRequest
  ): Promise<ApiResponse<CreatePatientDemographicsResponse>> {
    const response = await apiClient.post<ApiResponse<CreatePatientDemographicsResponse>>(
      "/medical-record/demographics",
      request
    )
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
