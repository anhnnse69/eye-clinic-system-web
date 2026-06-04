import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, MedicalRecord } from "@/types"

interface RecordFilters {
  doctorId?: string
  patientId?: string
  clinicId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

interface CreateRecordData {
  patientId: string
  doctorId: string
  appointmentId?: string
  diagnosis: string
  prescription?: string
  notes?: string
  attachments?: string[]
}

interface UpdateRecordData {
  diagnosis?: string
  prescription?: string
  notes?: string
  attachments?: string[]
}

class RecordService {
  async list(params?: RecordFilters): Promise<PaginatedResponse<MedicalRecord>> {
    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>("/records", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<MedicalRecord>> {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/records/${id}`)
    return response.data
  }

  async create(data: CreateRecordData): Promise<ApiResponse<MedicalRecord>> {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>("/records", data)
    return response.data
  }

  async update(id: string, data: UpdateRecordData): Promise<ApiResponse<MedicalRecord>> {
    const response = await apiClient.patch<ApiResponse<MedicalRecord>>(`/records/${id}`, data)
    return response.data
  }

  async getByPatient(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(`/records/patient/${patientId}`)
    return response.data
  }

  async getByDoctor(doctorId: string, date?: string): Promise<ApiResponse<MedicalRecord[]>> {
    const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(`/records/doctor/${doctorId}`, {
      params: { date },
    })
    return response.data
  }
}

export const recordService = new RecordService()
export default recordService
