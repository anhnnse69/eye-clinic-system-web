import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface UploadResponse {
  url: string;
  publicId: string;
}

class UploadService {
  /**
   * Upload image to Cloudinary via backend API
   */
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/upload/image/${publicId}`
    );
    return response.data;
  }
}

export const uploadService = new UploadService();
export default uploadService;
