import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface ViewNotificationListResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

export interface ViewNotificationListRequest {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
}

class PatientNotificationService {
  async getNotifications(
    patientUserId: string,
    params: ViewNotificationListRequest
  ): Promise<ApiResponse<ViewNotificationListResponse>> {
    const response = await apiClient.get<ApiResponse<ViewNotificationListResponse>>(
      `/patients/${patientUserId}/notifications`,
      { params }
    );
    return response.data;
  }

  async markAsRead(
    patientUserId: string,
    notificationId: string
  ): Promise<ApiResponse<string>> {
    const response = await apiClient.patch<ApiResponse<string>>(
      `/patients/${patientUserId}/notifications/${notificationId}/read`
    );
    return response.data;
  }
}

export const patientNotificationService = new PatientNotificationService();
export default patientNotificationService;