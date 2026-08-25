import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface MedicalRecordEditRequestItem {
  id?: string
  recordId: string
  patientName: string
  doctorId: string
  doctorName: string
  reason: string
  permissionDoc: string
  attachedFileName?: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  requestedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  reviewNote?: string | null
}

export interface CreateRecordApprovalRequestPayload {
  recordId: string
  patientName: string
  doctorId: string
  doctorName: string
  reason: string
  permissionDoc: string
  attachedFileName?: string | null
}

class RecordApprovalService {
  /** POST /api/v1/record-approvals - Submit edit request */
  async createRequest(
    payload: CreateRecordApprovalRequestPayload
  ): Promise<ApiResponse<MedicalRecordEditRequestItem>> {
    const response = await apiClient.post<ApiResponse<MedicalRecordEditRequestItem>>(
      "/record-approvals",
      payload
    )
    return response.data
  }

  /** GET /api/v1/record-approvals - List all requests */
  async getRequests(
    status?: string,
    search?: string
  ): Promise<ApiResponse<MedicalRecordEditRequestItem[]>> {
    const params = new URLSearchParams()
    if (status && status !== "ALL") params.append("status", status)
    if (search) params.append("search", search)

    const response = await apiClient.get<ApiResponse<MedicalRecordEditRequestItem[]>>(
      `/record-approvals?${params.toString()}`
    )
    return response.data
  }

  /** GET /api/v1/record-approvals/{recordId} - Get detail by recordId */
  async getByRecordId(
    recordId: string
  ): Promise<ApiResponse<MedicalRecordEditRequestItem>> {
    const response = await apiClient.get<ApiResponse<MedicalRecordEditRequestItem>>(
      `/record-approvals/${recordId}`
    )
    return response.data
  }

  /** POST /api/v1/record-approvals/{recordId}/approve - Approve request */
  async approveRequest(
    recordId: string
  ): Promise<ApiResponse<MedicalRecordEditRequestItem>> {
    const response = await apiClient.post<ApiResponse<MedicalRecordEditRequestItem>>(
      `/record-approvals/${recordId}/approve`
    )
    return response.data
  }

  /** POST /api/v1/record-approvals/{recordId}/reject - Reject request */
  async rejectRequest(
    recordId: string,
    note?: string
  ): Promise<ApiResponse<MedicalRecordEditRequestItem>> {
    const response = await apiClient.post<ApiResponse<MedicalRecordEditRequestItem>>(
      `/record-approvals/${recordId}/reject`,
      { note }
    )
    return response.data
  }

  /** GET /api/v1/record-approvals/check-permission/{recordId} - Check permission */
  async checkPermission(
    recordId: string
  ): Promise<ApiResponse<boolean>> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `/record-approvals/check-permission/${recordId}`
    )
    return response.data
  }

  /** POST /api/v1/record-approvals/{recordId}/reset - Reset approval state after update */
  async resetApproval(
    recordId: string
  ): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/record-approvals/${recordId}/reset`
    )
    return response.data
  }
}

export const recordApprovalService = new RecordApprovalService()
