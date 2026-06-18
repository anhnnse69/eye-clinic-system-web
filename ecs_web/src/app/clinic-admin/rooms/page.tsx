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
  Pencil
} from "lucide-react"
import { roomService } from "@/services/room.service"
import type { ViewClinicRoomResponse } from "@/services/room.service"

export default function ClinicRoomManagementPage() {
  const [roomsList, setRoomsList] = useState<ViewClinicRoomResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Đồng bộ trạng thái lưu trữ cấu trúc Meta phân trang giống hệt trang quản lý dịch vụ mẫu
  const [meta, setMeta] = useState<{
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Cơ chế Debounce xử lý chuỗi nhập liệu tìm kiếm tên phòng
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Triển khai hàm gọi API danh sách phòng khám chuẩn cấu trúc xử lý mã lỗi lỗi hệ thống
  const loadRoomsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const isActiveParam = 
        isActiveFilter === "active" ? true : 
        isActiveFilter === "inactive" ? false : undefined

      const response = await roomService.getClinicRooms({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined,
        roomType: roomTypeFilter === "all" ? undefined : roomTypeFilter
      })

      if (response.data) {
        setRoomsList(response.data)
      }
      
      if (response.meta) {
        setMeta({
          page: response.meta.page,
          size: response.meta.size,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrevious: response.meta.hasPrevious,
        })
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage

      if (errCode === "APP_MESSAGE_4001") {
        setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!")
      } else if (errCode === "APP_MESSAGE_4020") {
        setError("Không tìm thấy thông tin phòng khám gắn liền với tài khoản quản trị của bạn!")
      } else {
        setError("Không thể kết nối tới máy chủ hệ thống. Vui lòng thử lại sau!")
      }
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, roomTypeFilter, debouncedSearch])

  useEffect(() => {
    loadRoomsData()
  }, [loadRoomsData])

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Khối tiêu đề chính */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Home className="h-6 w-6 text-primary shrink-0" />
            Quản lý cơ sở vật chất
          </h2>
          <p className="text-body-md text-on-surface-variant">Danh sách phòng khám và khu vực chức năng tại phòng khám của bạn</p>
        </div>
        
        <Link 
          href="/clinic-admin/rooms/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> Thêm phòng mới
        </Link>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc dữ liệu đa năng */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh theo tên phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
              <Filter className="h-4 w-4" /> Loại:
            </span>
            <select
              value={roomTypeFilter}
              onChange={(e) => {
                setRoomTypeFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full sm:w-44 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
            >
              <option value="all">Tất cả loại phòng</option>
              <option value="General">Phòng khám tổng quát</option>
              <option value="Operation">Phòng phẫu thuật</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
              <Filter className="h-4 w-4" /> Trạng thái:
            </span>
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full sm:w-44 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            Đang nạp danh mục phòng khám từ hệ thống...
          </p>
        </div>
      )}

      {/* Trạng thái thông báo lỗi */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Khối hiển thị dữ liệu và Phân trang */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">Tên phòng</th>
                    <th className="p-4">Loại phòng chức năng</th>
                    <th className="p-4 text-center">Trạng thái hoạt động</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {roomsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-on-surface-variant">
                        Không tìm thấy phòng khám nào phù hợp với bộ lọc điều kiện hiện tại.
                      </td>
                    </tr>
                  ) : (
                    roomsList.map((room) => (
                      <tr key={room.id_room} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold shrink-0">
                              {room.roomName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-on-surface">{room.roomName}</span>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container text-label-sm font-medium">
                            {room.roomType || "Mặc định"}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-semibold inline-block ${
                            room.isActive ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"
                          }`}>
                            {room.isActive ? "Đang hoạt động" : "Tạm dừng"}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          {/* Sửa đổi nút Sửa đồng bộ giao diện và cấu trúc định tuyến URL mới */}
                          <Link
                            href={`/clinic-admin/rooms/edit/${room.id_room}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-xl text-label-sm text-primary font-medium bg-surface-container-lowest hover:bg-primary/5 transition-colors shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Sửa
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thanh điều hướng Phân trang đồng bộ giao diện mẫu */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                Hiển thị dòng <span className="font-semibold text-on-surface">{Math.min((meta.page - 1) * meta.size + 1, meta.total)}</span> đến{" "}
                <span className="font-semibold text-on-surface">{Math.min(meta.page * meta.size, meta.total)}</span> trên tổng số{" "}
                <span className="font-semibold text-on-surface">{meta.total}</span> phòng khám.
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="bg-surface-container-lowest border border-outline-variant text-on-surface px-2 py-1.5 rounded-lg text-label-md focus:outline-none cursor-pointer mr-2 font-medium"
                >
                  <option value={5}>5 dòng / trang</option>
                  <option value={10}>10 dòng / trang</option>
                  <option value={20}>20 dòng / trang</option>
                  <option value={50}>50 dòng / trang</option>
                </select>

                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>

                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title="Trang kế tiếp"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}