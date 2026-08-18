import { apiClient, ApiError } from "@/lib/axios"
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


export interface CreatePatientProfileRequest {
    fullName: string
    gender: number
    dob: string
    identityNumber?: string
    address?: string
    phoneNumber?: string
    bhytNumber?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    relationship: string
}


export interface CreatePatientProfileResponse {
    patientProfileId: string
    userPatientId: string
    fullName: string
    assignedRelationship: string
}

export interface GetPatientProfileDetailResponse {
    patientProfileId: string
    fullName: string
    gender: number
    dob: string
    identityNumber?: string
    address?: string
    phoneNumber?: string
    bhytNumber?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    relationship: string
    createdAt: string
    updatedAt: string
}

export interface UpdatePatientProfileRequest {
    fullName: string
    gender: number
    dob: string
    identityNumber?: string
    address?: string
    phoneNumber?: string
    bhytNumber?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    relationship: string
}

export interface UpdatePatientProfileResponse {
    patientProfileId: string
    fullName: string
    relationship: string
    updatedAt: string
}

export interface SeparateProfileRequest {
    childPatientProfileId: string
    newEmail: string
    newPhone: string
}

export interface SeparateProfileResponse {
    newUserId: string
    newPatientProfileId: string
    message: string
}

export interface CheckSelfProfileResponse {
    hasSelfProfile: boolean
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
    async create(
        data: CreatePatientProfileRequest
    ): Promise<ApiResponse<CreatePatientProfileResponse>> {
        const response = await apiClient.post<
            ApiResponse<CreatePatientProfileResponse>
        >("/patient-profiles/create", data)

        return response.data
    }

    async getById(
        patientProfileId: string
    ): Promise<ApiResponse<GetPatientProfileDetailResponse>> {
        const response = await apiClient.get<
            ApiResponse<GetPatientProfileDetailResponse>
        >(`/patient-profiles/${patientProfileId}`)

        return response.data
    }

    async update(
        patientProfileId: string,
        data: UpdatePatientProfileRequest
    ): Promise<ApiResponse<UpdatePatientProfileResponse>> {
        const response = await apiClient.put<
            ApiResponse<UpdatePatientProfileResponse>
        >(
            `/patient-profiles/${patientProfileId}/edit`,
            data
        )

        return response.data
    }

    async separate(
        patientProfileId: string,
        newEmail: string,
        newPhone: string
    ): Promise<ApiResponse<SeparateProfileResponse>> {
        const routeCandidates = [
            `/patient/profiles/${patientProfileId}/separate`,
            `/patient-profiles/${patientProfileId}/separate`,
        ]

        let lastError: unknown = null

        for (const url of routeCandidates) {
            try {
                const response = await apiClient.post<
                    ApiResponse<SeparateProfileResponse>
                >(url, {
                    childPatientProfileId: patientProfileId,
                    newEmail,
                    newPhone,
                })

                return response.data
            } catch (error) {
                if (!(error instanceof ApiError) || error.statusCode !== 404) {
                    throw error
                }

                lastError = error
            }
        }

        throw lastError ?? new Error("Failed to separate patient profile")
    }

    async checkSelfProfile(): Promise<ApiResponse<CheckSelfProfileResponse>> {
        const response = await apiClient.get<
            ApiResponse<CheckSelfProfileResponse>
        >("/patient/profiles/check-self-profile")

        return response.data
    }
}

export const patientProfileService =
    new PatientProfileService()