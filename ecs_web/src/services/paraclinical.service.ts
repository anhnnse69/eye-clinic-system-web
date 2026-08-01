/**
 * Paraclinical / Lab Result service — MongoDB-backed (UC42-44).
 * Doctor-facing endpoints: create/update a paraclinical request (OCT, Visual Field,
 * Ultrasound B-scan, general lab) attached to a medical record.
 * Read-side is shared with patients and clinic staff.
 */
import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export type LabType = "OCT" | "VISUAL_FIELD" | "ULTRASOUND" | "GENERAL_LAB"
export type LabSide = "OD" | "OS" | "BOTH"
export type LabStatus = "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface LabResultSummary {
  labResultId: string
  labType: string
  side?: string | null
  status: string
  machineName?: string | null
  scanPattern?: string | null
  imageUrl?: string | null
  clinicalConclusion?: string | null
  requestedAt: string
  performedAt?: string | null
  updatedAt: string
  measurements?: unknown
  aiPrediction?: unknown
}

export interface GetLabResultsResponse {
  recordId: string
  count: number
  results: LabResultSummary[]
}

export interface CreateLabRequestPayload {
  recordId: string
  labType: LabType
  side?: LabSide | null
  indication?: string
  technicianName?: string
  machineName?: string
  scanPattern?: string
  imageUrl?: string
  clinicalConclusion?: string
  /** Free-form modality-specific measurements. */
  measurements?: Record<string, unknown>
  status?: LabStatus
}

export interface CreateLabRequestResponse {
  labResultId: string
  recordId: string
  labType: string
  side?: string | null
  status: string
  requestedAt: string
  isSuccess: boolean
}

export interface UpdateLabResultPayload {
  labResultId: string
  status?: LabStatus
  clinicalConclusion?: string
  imageUrl?: string
  technicianName?: string
  machineName?: string
  scanPattern?: string
  performedAt?: string
  measurements?: Record<string, unknown>
}

export interface UpdateLabResultResponse {
  labResultId: string
  status: string
  updatedAt: string
  isSuccess: boolean
}

class ParaclinicalService {
  private get doctorBase() { return "/doctor-appointment/paraclinical" }
  private get recordBase() { return "/medical-record/paraclinical" }

  /** POST /api/v1/doctor-appointment/paraclinical/create */
  async create(payload: CreateLabRequestPayload): Promise<ApiResponse<CreateLabRequestResponse>> {
    const { data } = await apiClient.post<ApiResponse<CreateLabRequestResponse>>(
      `${this.doctorBase}/create`, payload)
    return data
  }

  /** GET /api/v1/medical-record/paraclinical?recordId=... */
  async list(
    recordId: string,
    filter?: { labType?: LabType; side?: LabSide }
  ): Promise<ApiResponse<GetLabResultsResponse>> {
    const { data } = await apiClient.get<ApiResponse<GetLabResultsResponse>>(
      this.recordBase, { params: { recordId, ...filter } })
    return data
  }

  /** PUT /api/v1/doctor-appointment/paraclinical/update */
  async update(payload: UpdateLabResultPayload): Promise<ApiResponse<UpdateLabResultResponse>> {
    const { data } = await apiClient.put<ApiResponse<UpdateLabResultResponse>>(
      `${this.doctorBase}/update`, payload)
    return data
  }
}

export const paraclinicalService = new ParaclinicalService()
export default paraclinicalService