import { apiClient } from "@/lib/axios"
import type { ApiResponse, CompleteQueueRequest, CompleteQueueResponse } from "@/types"

class QueueService {
  /**
   * Completes a queue item.
   * POST /api/v1/doctor/queue/complete
   */
  async completeQueue(data: CompleteQueueRequest): Promise<ApiResponse<CompleteQueueResponse>> {
    const response = await apiClient.post<ApiResponse<CompleteQueueResponse>>(
      "/doctor/queue/complete",
      data
    )
    return response.data
  }
}

export const queueCompleteService = new QueueService()
export default queueCompleteService
