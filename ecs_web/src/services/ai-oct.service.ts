/**
 * AI OCT Prediction Service — MobileNetV3 4-class Retinal OCT Classifier
 * 
 * Submits base64 OCT image to BE endpoint POST /api/v1/ai/predict-oct
 */

import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export type OctClassCode = "CNV" | "DME" | "DRUSEN" | "NORMAL" | string;

export interface AIOctPredictRequest {
  image_base64: string;
}

export interface AIOctPredictResponse {
  taskId: string;
  status: "COMPLETED" | "LOW_CONFIDENCE" | "FAILED" | string;
  predictedClass: OctClassCode;
  confidence: number;
  probabilities: Record<OctClassCode, number>;
  riskLevel: "HIGH" | "MODERATE" | "LOW" | string;
  isLowConfidence: boolean;
  disclaimer: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
}

interface RawAiOctResponse {
  task_id: string;
  status: string;
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  risk_level: string;
  is_low_confidence: boolean;
  disclaimer: string;
  error_code?: string;
  error_message?: string;
  created_at?: string;
  completed_at?: string;
}

class AIOctService {
  /**
   * Submit Base64 image string to BE for OCT classification
   */
  async predictOctImage(imageBase64: string): Promise<{ success: boolean; data?: AIOctPredictResponse; message?: string }> {
    try {
      const { data } = await apiClient.post<ApiResponse<RawAiOctResponse>>(
        "/ai/predict-oct",
        { image_base64: imageBase64 }
      );

      if (!data.data) {
        return {
          success: false,
          message: data.codeMessage || "Failed to analyze OCT image",
        };
      }

      const raw = data.data;
      const formattedData: AIOctPredictResponse = {
        taskId: raw.task_id,
        status: raw.status,
        predictedClass: raw.predicted_class,
        confidence: raw.confidence,
        probabilities: raw.probabilities || {},
        riskLevel: raw.risk_level,
        isLowConfidence: raw.is_low_confidence || false,
        disclaimer: raw.disclaimer,
        errorCode: raw.error_code,
        errorMessage: raw.error_message,
        createdAt: raw.created_at,
        completedAt: raw.completed_at,
      };

      return {
        success: true,
        data: formattedData,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.codeMessage || err?.message || "Đã xảy ra lỗi khi gọi dịch vụ AI.",
      };
    }
  }

  /**
   * Format confidence score as percentage string
   */
  formatConfidence(confidence: number | null | undefined): string {
    if (confidence === null || confidence === undefined) return "0.0%";
    return `${(confidence * 100).toFixed(1)}%`;
  }
}

export const aiOctService = new AIOctService();
export default aiOctService;
