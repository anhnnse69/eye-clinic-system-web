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

export interface ViewClinicRoomsRequest {
  pageNumber: number;
  pageSize: number;
  isActive?: boolean;
  searchTerm?: string;
  roomType?: string; 
}

export interface ViewClinicRoomResponse {
  id_room: string;
  roomName: string;
  roomType: string;
  isActive: boolean;
}

export interface CreateRoomRequest {
    roomName: string
    roomType?: string
}

export interface CreateRoomResponse {
    id: string
    clinicId: string
    roomName: string
    roomType?: string
    isActive: boolean
}

export interface EditRoomRequest {
  roomId: string
  roomName: string
  roomType: string
}

export interface EditRoomResponse {
  id: string
  clinicId: string
  roomName: string
  roomType: string
  isActive: boolean
}

export interface DeleteRoomRequest {
  roomId: string
  isActive: boolean // Dùng làm switch toggle khóa/mở khóa phòng bệnh
}

export interface DeleteRoomResponse {
  id: string
  clinicId: string
  roomName: string
  roomType: string
  isActive: boolean
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

  async getClinicRooms(params: ViewClinicRoomsRequest): Promise<ApiResponse<ViewClinicRoomResponse[]>> {
    const response = await apiClient.get<ApiResponse<ViewClinicRoomResponse[]>>(
      "/clinic-admin/rooms",
      {
        params: {
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          isActive: params.isActive,
          searchTerm: params.searchTerm,
          roomType: params.roomType,
        },
      }
    );
    return response.data;
  }
  
  async createRoom(data: CreateRoomRequest): Promise<ApiResponse<CreateRoomResponse>> {
    const response = await apiClient.post<ApiResponse<CreateRoomResponse>>(
      "/clinic-admin/rooms",
      data
    );
    return response.data;
  }

  async editClinicRoom(data: EditRoomRequest): Promise<ApiResponse<EditRoomResponse>> {
  const response = await apiClient.put<ApiResponse<EditRoomResponse>>("/clinic-admin/rooms/edit", data);
  return response.data;
}

async toggleRoomStatus(data: DeleteRoomRequest): Promise<ApiResponse<DeleteRoomResponse>> {
  const response = await apiClient.patch<ApiResponse<DeleteRoomResponse>>(
    `/clinic-admin/rooms/${data.roomId}/status`,
    data
  );
  return response.data;
}
}

export const roomService = new RoomService()
export default roomService
