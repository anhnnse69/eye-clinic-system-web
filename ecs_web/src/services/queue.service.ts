import type { ApiResponse, QueueListResponse } from "@/types"

export interface GetQueueListParams {
  date?: string // Format: yyyy-MM-dd, defaults to today
}

class QueueService {
  async getQueueList(params: GetQueueListParams): Promise<ApiResponse<QueueListResponse>> {
    const { date } = params
    
    // Build query string
    const queryParams = new URLSearchParams()
    if (date) {
      queryParams.append("date", date)
    }

    const queryString = queryParams.toString()
    const url = `/api/doctor/queue${queryString ? `?${queryString}` : ""}`

    // Gọi proxy API trực tiếp bằng fetch
    // Proxy sẽ lấy token từ cookie và gọi backend
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // Để gửi cookie
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw {
        response: {
          data: {
            codeMessage: data.codeMessage || "APP_MESSAGE_5000",
          },
          status: response.status,
        },
      }
    }

    return data
  }
}

export const queueService = new QueueService()
export default queueService
