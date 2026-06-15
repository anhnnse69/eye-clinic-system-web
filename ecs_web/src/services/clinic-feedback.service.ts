import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface GetClinicFeedbacksRequest {
  searchTerm?: string
  ratingDoctor?: number
  ratingClinic?: number
  feedbackDate?: string
  pageNumber: number
  pageSize: number
}

export interface GetClinicFeedbackResponse {
  id_feedback: string
  patientName: string
  doctorName: string
  ratingDoctor: number
  ratingClinic: number
  comment: string
  isPublic: boolean
  appointmentDate: string
  feedbackDate: string
}

class ClinicFeedbackService {
  async getAll(
    params: GetClinicFeedbacksRequest
  ): Promise<ApiResponse<GetClinicFeedbackResponse[]>> {

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== ""
      )
    )

    const response =
      await apiClient.get<
        ApiResponse<GetClinicFeedbackResponse[]>
      >(
        "/clinic-admin/feedbacks",
        {
          params: cleanParams
        }
      )

    return response.data
  }

  async delete(
    feedbackId: string
  ): Promise<ApiResponse<boolean>> {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/clinic-admin/feedbacks/${feedbackId}`
    )

    return response.data
  }
}

export const clinicFeedbackService =
  new ClinicFeedbackService()