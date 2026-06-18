import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface FeedbackHistoryItem {
    feedbackId: string;
    appointmentId: string;
    patientName: string;
    doctorName: string;
    clinicName: string;
    ratingDoctor: number;
    ratingClinic: number;
    comment?: string;
    isPublic: boolean;
    appointmentDate: string;
    createdAt: string;
}

export interface ViewMyFeedbackHistoryRequest {
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface PaginationMeta {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
}

export interface ViewMyFeedbackHistoryResponse {
    data: FeedbackHistoryItem[];
    meta: PaginationMeta;
}

class PatientFeedbackService {
    async getMyFeedbackHistory(
        params: ViewMyFeedbackHistoryRequest
    ): Promise<ApiResponse<FeedbackHistoryItem[]>> {
        const response = await apiClient.get<
            ApiResponse<FeedbackHistoryItem[]>
        >("/patient/feedbacks/history", {
            params,
        });

        return response.data;
    }
}

export const patientFeedbackService =
    new PatientFeedbackService();

export default patientFeedbackService;