import { apiClient } from "@/lib/axios"
import type { ApiResponse, PreliminaryDiagnosisRequest, PreliminaryDiagnosisResponse } from "@/types"

class PreliminaryDiagnosisService {
  async submit(request: PreliminaryDiagnosisRequest): Promise<ApiResponse<PreliminaryDiagnosisResponse>> {
    const response = await apiClient.post<ApiResponse<PreliminaryDiagnosisResponse>>(
      "/doctor-appointment/preliminary-diagnosis",
      request
    )
    return response.data
  }
}

export const preliminaryDiagnosisService = new PreliminaryDiagnosisService()
export default preliminaryDiagnosisService
