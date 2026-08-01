import { apiClient } from "@/lib/axios"
import type { ApiResponse, QueueListResponse } from "@/types"

export interface GetQueueListParams {
  date?: string // Format: yyyy-MM-dd, defaults to today
}

class QueueService {
  /**
   * Gets the queue list for the current authenticated doctor.
   * GET /api/v1/doctors/me/queue
   */
  async getQueueList(params: GetQueueListParams): Promise<ApiResponse<QueueListResponse>> {
    const { date } = params

    const queryParams = new URLSearchParams()
    if (date) {
      queryParams.append("date", date)
    }

    const queryString = queryParams.toString()
    const url = `/doctors/me/queue${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.get<ApiResponse<QueueListResponse>>(url)
    return response.data
  }
}

export const queueService = new QueueService()
export default queueService
