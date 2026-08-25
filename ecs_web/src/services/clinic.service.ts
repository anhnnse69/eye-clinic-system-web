import { apiClient } from "@/lib/axios";
import type {
  ApiResponse,
  Clinic,
  ClinicManagementItem,
  MetaResponse,
} from "@/types";

export interface GetClinicsParams {
  searchTerm?: string
  status?: string
  pageNumber?: number
  pageSize?: number
}


export interface UpdateClinicRequest {
  name: string
  address: string
  phone: string
  email: string | null
  logoUrl: string | null
  description: string | null
  openTime?: string | null
  closeTime?: string | null
}


export interface GetClinicByIdDetail {
  name: string
  address: string
  phone: string
  email: string
  logoUrl: string
  description: string
  isActive: boolean
  ratingAvg: number
  reviewCount: number
  openTime: string
  closeTime: string
}

export interface GetClinicLookupResponse {
  id: string
  name: string
}

class ClinicsService {
  /**
   * Lấy danh sách các phòng khám (Master list)
   */
  async getClinics(
    params?: GetClinicsParams,
  ): Promise<ApiResponse<ClinicManagementItem[]>> {
    const response = await apiClient.get<ApiResponse<ClinicManagementItem[]>>(
      "/system-admin/clinics",
      {
        params: {
          searchTerm: params?.searchTerm,
          status: params?.status,
          pageNumber: params?.pageNumber || 1,
          pageSize: params?.pageSize || 10,
        },
      },
    );
    return response.data;
  }

  async get(id: string): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.get<ApiResponse<Clinic>>(`/clinics/${id}`);
    return response.data;
  }

  async create(data: Partial<Clinic>): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.post<ApiResponse<Clinic>>(
      "/clinics",
      data,
    );
    return response.data;
  }

  async update(
    id: string,
    data: Partial<Clinic>,
  ): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.patch<ApiResponse<Clinic>>(
      `/clinics/${id}`,
      data,
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/clinics/${id}`,
    );
    return response.data;
  }

  async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<ApiResponse<Clinic>> {
    const response = await apiClient.patch<ApiResponse<Clinic>>(
      `/clinics/${id}`,
      { isActive },
    );
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<Partial<Clinic>>> {
    const response = await apiClient.get<ApiResponse<Partial<Clinic>>>(
      "/clinic-admin/clinic/profile",
    );
    return response.data;
  }


  async deleteClinic(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/system-admin/clinics/${id}`
    )
    return response.data
  }

  /**
   * Bổ sung hàm Vô hiệu hóa  (Nếu có endpoint tương ứng xử lý trên UI)
   */
  async toggleClinicStatus(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.put<ApiResponse<boolean>>(
      `/system-admin/clinics/${id}/toggle-status`,
    );
    return response.data;
  }

  async updateProfile(data: Partial<Clinic>): Promise<ApiResponse<boolean>> {
    const response = await apiClient.put<ApiResponse<boolean>>(
      "/clinic-admin/clinic/profile",
      data,
    );

    return response.data;
  }


  async getClinicById(id: string): Promise<ApiResponse<GetClinicByIdDetail>> {
    const response = await apiClient.get<ApiResponse<GetClinicByIdDetail>>(
      `/system-admin/clinics/${id}`
    );
    return response.data;
  }


  async updateClinic(id: string, data: UpdateClinicRequest): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/system-admin/clinics/${id}`,
      data
    );
    return response.data;
  }

  async getClinicLookup(): Promise<ApiResponse<GetClinicLookupResponse[]>> {
    const response = await apiClient.get<ApiResponse<GetClinicLookupResponse[]>>(
      "/system-admin/clinics/lookup"
    )
    return response.data
  }

  async requestPublishClinic(clinicId: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/clinic-admin/clinics/${clinicId}/request-publish`,
      { clinicId }
    );
    return response.data;
  }

  async approveClinicPublication(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/system-admin/clinics/${id}/approve-publication`
    );
    return response.data;
  }
}

export const clinicsService = new ClinicsService();
export default clinicsService;
