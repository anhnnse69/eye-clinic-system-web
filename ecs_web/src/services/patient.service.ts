import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Patient } from "@/types"

interface PatientFilters {
  clinicId?: string
  page?: number
  pageSize?: number
  search?: string
  dateOfBirth?: string
}

interface CreatePatientData {
  email: string
  name: string
  phone: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  address?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
}

interface UpdatePatientData {
  name?: string
  phone?: string
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  address?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
}

class PatientService {
  async list(params?: PatientFilters): Promise<PaginatedResponse<Patient>> {
    const response = await apiClient.get<PaginatedResponse<Patient>>("/patients", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Patient>> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`)
    return response.data
  }

  async create(data: CreatePatientData): Promise<ApiResponse<Patient>> {
    const response = await apiClient.post<ApiResponse<Patient>>("/patients", data)
    return response.data
  }

  async update(id: string, data: UpdatePatientData): Promise<ApiResponse<Patient>> {
    const response = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/patients/${id}`)
    return response.data
  }

  async search(query: string): Promise<ApiResponse<Patient[]>> {
    const response = await apiClient.get<ApiResponse<Patient[]>>("/patients/search", {
      params: { q: query },
    })
    return response.data
  }
}

export const patientService = new PatientService()
export default patientService
