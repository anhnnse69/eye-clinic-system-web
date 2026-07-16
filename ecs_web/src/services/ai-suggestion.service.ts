/**
 * AI Suggestion service — uploads an OCT image to the FastAPI VGG16 classifier
 * via the .NET backend proxy (which polls until completion and persists the
 * result in MongoDB).
 */
import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface AiSuggestResponse {
  suggestionId: string
  taskId: string
  status: string
  predictedClass?: string | null
  confidence?: number | null
  allProbabilities?: Record<string, number> | null
  modelVersion?: string | null
  errorCode?: string | null
  errorMessage?: string | null
  createdAt: string
  completedAt?: string | null
  processingTimeMs?: number | null
  isSuccess: boolean
}

class AiSuggestionService {
  /**
   * Multipart upload: image (file) + optional recordId/labResultId/mimeType.
   * Returns 200 with prediction when the backend polling loop completes.
   * May take up to ~60s depending on the AI service queue depth.
   */
  async suggest(opts: {
    file: File
    recordId?: string
    labResultId?: string
  }): Promise<ApiResponse<AiSuggestResponse>> {
    const form = new FormData()
    form.append("image", opts.file)
    if (opts.recordId) form.append("recordId", opts.recordId)
    if (opts.labResultId) form.append("labResultId", opts.labResultId)
    form.append("mimeType", opts.file.type || "image/jpeg")

    const { data } = await apiClient.post<ApiResponse<AiSuggestResponse>>(
      "/doctor-appointment/paraclinical/ai/suggest",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120_000,
      }
    )
    return data
  }
}

export const aiSuggestionService = new AiSuggestionService()
export default aiSuggestionService