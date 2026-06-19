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

// RecordType enum mapping from string to number
const RECORD_TYPE_MAP: Record<string, number> = {
  MS21_TRAUMA: 0,
  MS22_ANTERIOR: 1,
  MS23_FUNDUS: 2,
  MS24_GLAUCOMA: 3,
  MS25_STRABISMUS_PTOSIS: 4,
  MS26_PEDIATRIC: 5,
}

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

  async createPatientDemographics(
    request: CreatePatientDemographicsRequest
  ): Promise<ApiResponse<CreatePatientDemographicsResponse>> {
    // Call /api/v1/patient/demographics endpoint (not /medical-record/demographics)
    const response = await apiClient.post<ApiResponse<CreatePatientDemographicsResponse>>(
      "/patient/demographics",
      request // Send request body directly, not wrapped in { request }
    )
    return response.data
  }
}

export const medicalRecordPatientDemographicsService =
  new MedicalRecordPatientDemographicsService()
export default medicalRecordPatientDemographicsService
