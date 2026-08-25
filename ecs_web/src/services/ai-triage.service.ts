/**
 * AI Triage Service — Integration với AI Symptom Prediction
 * 
 * Gọi BE endpoint POST /api/v1/ai/triage để submit triệu chứng
 * và nhận kết quả dự đoán bệnh từ ML model (19-class classification)
 * 
 * Flow:
 * 1. FE gửi symptom input → BE
 * 2. BE forward sang AI Service /predict-symptoms
 * 3. AI Service trả kết quả (sync, không cần polling)
 * 4. BE map response và trả về FE
 */

import { apiClient } from "@/lib/axios"
import type { 
  ApiResponse, 
  AITriageSymptomInput, 
  AITriageResponse,
  AITriageResult 
} from "@/types"

class AITriageService {
  /**
   * Submit symptoms for AI triage prediction
   * Maps FE symptom input → AI model → BE response
   * 
   * @param input - Symptom input from patient/basic examination
   * @returns AI triage result with predicted disease and differentials
   */
  async submitTriage(input: AITriageSymptomInput): Promise<ApiResponse<AITriageResponse>> {
    const { data } = await apiClient.post<ApiResponse<AITriageResponse>>(
      "/ai/triage",
      input
    )
    return data
  }

  /**
   * Transform raw AI response to UI-friendly format
   * Maps snake_case from AI → camelCase for UI
   */
  transformAiResponse(raw: AITriageResult): AITriageResponse {
    // Get top 3 differential diagnoses (excluding the primary)
    const differentials: AITriageResponse["differentials"] = [];
    
    if (raw.all_probabilities) {
      const sorted = Object.entries(raw.all_probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(1, 4); // Skip first (primary), take next 3
      
      for (const [disease, confidence] of sorted) {
        differentials.push({ disease, confidence });
      }
    }

    return {
      taskId: raw.task_id,
      status: raw.status,
      predictedDisease: raw.predicted_disease,
      confidence: raw.confidence,
      riskLevel: raw.risk_level,
      differentials,
      allProbabilities: raw.all_probabilities,
      disclaimer: raw.disclaimer,
      errorCode: raw.error_code,
      errorMessage: raw.error_message,
      createdAt: raw.created_at,
      completedAt: raw.completed_at,
      isSuccess: raw.status === "COMPLETED" && !raw.error_code,
    };
  }

  /**
   * Get risk level display config for UI
   */
  getRiskLevelConfig(riskLevel: AITriageResponse["riskLevel"]): {
    labelKey: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
  } {
    switch (riskLevel) {
      case "HIGH":
        return {
          labelKey: "HIGH",
          color: "text-rose-700",
          bgColor: "bg-rose-50/80",
          borderColor: "border-rose-200",
          badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
        };
      case "MODERATE":
        return {
          labelKey: "MODERATE",
          color: "text-amber-700",
          bgColor: "bg-amber-50/80",
          borderColor: "border-amber-200",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "LOW":
        return {
          labelKey: "LOW",
          color: "text-emerald-700",
          bgColor: "bg-emerald-50/80",
          borderColor: "border-emerald-200",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      default:
        return {
          labelKey: "LOW",
          color: "text-slate-700",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  }

  /**
   * Format confidence as percentage string
   */
  formatConfidence(confidence: number | null): string {
    if (confidence === null) return "—";
    return `${(confidence * 100).toFixed(1)}%`;
  }
}

export const aiTriageService = new AITriageService();
export default aiTriageService;
