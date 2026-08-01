import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Feedback } from "@/types"

interface FeedbackFilters {
  clinicId?: string
  rating?: number
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

interface CreateFeedbackData {
  patientId: string
  clinicId: string
  rating: number
  comment?: string
}

class FeedbackService {
  async list(params?: FeedbackFilters): Promise<PaginatedResponse<Feedback>> {
    const response = await apiClient.get<PaginatedResponse<Feedback>>("/feedback", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.get<ApiResponse<Feedback>>(`/feedback/${id}`)
    return response.data
  }

  async create(data: CreateFeedbackData): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.post<ApiResponse<Feedback>>("/feedback", data)
    return response.data
  }

  async getByClinic(clinicId: string): Promise<ApiResponse<Feedback[]>> {
    const response = await apiClient.get<ApiResponse<Feedback[]>>(`/feedback/clinic/${clinicId}`)
    return response.data
  }

  async getStats(clinicId: string): Promise<ApiResponse<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }>> {
    const response = await apiClient.get<ApiResponse<{
      averageRating: number
      totalReviews: number
      ratingDistribution: Record<number, number>
    }>>(`/feedback/clinic/${clinicId}/stats`)
    return response.data
  }
}

export const feedbackService = new FeedbackService()
export default feedbackService
