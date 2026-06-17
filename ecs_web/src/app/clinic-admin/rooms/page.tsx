"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Home, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Edit2
} from "lucide-react"
import { roomService } from "@/services/room.service"
import type { ViewClinicRoomResponse } from "@/services/room.service"

export default function ClinicRoomManagementPage() {
  const [roomsList, setRoomsList] = useState<ViewClinicRoomResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const [meta, setMeta] = useState({
    page: 1, size: 10, total: 0, totalPages: 1, hasNext: false, hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const loadRoomsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const isActiveParam = isActiveFilter === "active" ? true : isActiveFilter === "inactive" ? false : undefined
      
      const response = await roomService.getClinicRooms({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined,
        roomType: roomTypeFilter === "all" ? undefined : roomTypeFilter
      })

      if (response.data) setRoomsList(response.data)
      if (response.meta) setMeta(response.meta)
    } catch (err: any) {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau!")
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, roomTypeFilter, debouncedSearch])

  useEffect(() => {
    loadRoomsData()
  }, [loadRoomsData])

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Quản lý cơ sở vật chất</h2>
          <p className="text-body-md text-on-surface-variant">Danh sách phòng khám và khu vực chức năng</p>
        </div>
        <Link 
          href="/clinic-admin/rooms/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" /> Thêm phòng mới
        </Link>
      </div>

      {/* Thanh công cụ */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:border-primary outline-none transition-colors"
          />
        </div>
        <select value={roomTypeFilter} onChange={(e) => setRoomTypeFilter(e.target.value)} className="w-full lg:w-48 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md cursor-pointer">
          <option value="all">Tất cả loại phòng</option>
          <option value="General">Phòng khám tổng quát</option>
          <option value="Operation">Phòng phẫu thuật</option>
        </select>
        <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)} className="w-full lg:w-48 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md cursor-pointer">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm dừng</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      {!loading && !error && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                <th className="p-4">Tên phòng</th>
                <th className="p-4">Loại phòng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {roomsList.map((room) => (
                <tr key={room.id_room} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                        {room.roomName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{room.roomName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-label-sm font-medium">
                      {room.roomType}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${room.isActive ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"}`}>
                      {room.isActive ? "Đang hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/clinic-admin/rooms/edit/${room.id_room}`} className="p-2 text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* ... Phần Pagination giữ nguyên cấu trúc cũ của bạn ... */}
    </div>
  )
}