import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types"

export interface GetPatientProfilesRequest {
    searchTerm?: string
    pageNumber?: number
    pageSize?: number
}

export interface GetPatientProfileResponse {
    id_patientProfile: string
    fullName: string
    gender: string
    dob: string
    identityNumber?: string
    phoneNumber?: string
    relationship?: string
    createdAt: string
}

class PatientProfileService {
    async getAll(
        params: GetPatientProfilesRequest
    ): Promise<ApiResponse<GetPatientProfileResponse[]>> {
        const response = await apiClient.get<
            ApiResponse<GetPatientProfileResponse[]>
        >("/patient/profiles", {
            params,
        })

        return response.data
    }
}

export const patientProfileService =
    new PatientProfileService()