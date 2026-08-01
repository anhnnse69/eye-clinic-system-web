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
}

export const patientProfileService =
    new PatientProfileService()