import { apiClient } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Room, RoomType } from "@/types"

interface RoomFilters {
  clinicId?: string
  type?: RoomType
  isAvailable?: boolean
  page?: number
  pageSize?: number
}

interface CreateRoomData {
  name: string
  type: RoomType
  clinicId: string
  capacity?: number
  floor?: string
  description?: string
}

interface UpdateRoomData {
  name?: string
  type?: RoomType
  capacity?: number
  floor?: string
  description?: string
  isAvailable?: boolean
}

class RoomService {
  async list(params?: RoomFilters): Promise<PaginatedResponse<Room>> {
    const response = await apiClient.get<PaginatedResponse<Room>>("/rooms", { params })
    return response.data
  }

  async get(id: string): Promise<ApiResponse<Room>> {
    const response = await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`)
    return response.data
  }

  async create(data: CreateRoomData): Promise<ApiResponse<Room>> {
    const response = await apiClient.post<ApiResponse<Room>>("/rooms", data)
    return response.data
  }

  async update(id: string, data: UpdateRoomData): Promise<ApiResponse<Room>> {
    const response = await apiClient.patch<ApiResponse<Room>>(`/rooms/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/rooms/${id}`)
    return response.data
  }

  async getByClinic(clinicId: string): Promise<ApiResponse<Room[]>> {
    const response = await apiClient.get<ApiResponse<Room[]>>(`/rooms/clinic/${clinicId}`)
    return response.data
  }

  async getAvailable(clinicId?: string, type?: RoomType): Promise<ApiResponse<Room[]>> {
    const response = await apiClient.get<ApiResponse<Room[]>>("/rooms/available", {
      params: { clinicId, type },
    })
    return response.data
  }
}

export const roomService = new RoomService()
export default roomService
