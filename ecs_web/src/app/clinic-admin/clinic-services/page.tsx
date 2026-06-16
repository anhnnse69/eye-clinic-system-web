"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Layers, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
// Đã đồng bộ chuẩn hóa tên biến import instance sang serviceService để tránh lỗi "not defined"
import { serviceService } from "@/services/service.service"
import type { ViewClinicServiceResponse } from "@/services/service.service"

export default function ClinicServiceManagementPage() {
  // State quản lý danh sách dữ liệu dịch vụ và trạng thái tải ứng dụng
  const [servicesList, setServicesList] = useState<ViewClinicServiceResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State lưu trữ thông tin phân trang lấy trực tiếp từ response.meta của Axios/Types chung
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

  // State kiểm soát các tham số bộ lọc tìm kiếm và phân trang đầu vào
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Hiệu ứng trì hoãn tìm kiếm (Debounce 500ms) tối ưu hóa băng thông gọi API khi gõ phím
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1) // Reset về trang đầu khi thay đổi từ khóa tìm kiếm
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm xử lý gọi API kết nối Server lấy danh sách dịch vụ kèm bộ lọc nâng cao
  const loadServicesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Chuyển đổi trạng thái filter string sang kiểu boolean? tương thích với Backend C#
      const isActiveParam = 
        isActiveFilter === "active" ? true : 
        isActiveFilter === "inactive" ? false : undefined

      // FIX CHÍNH XÁC: Gọi đúng instance `serviceService` đã được import từ dòng 14
      const response = await serviceService.getClinicServices({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response.data) {
        setServicesList(response.data)
      }
      
      // Khớp nối đồng bộ dữ liệu Metadata phân trang từ response hệ thống
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
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch])

  // Tự động kích hoạt nạp lại dữ liệu khi bất kỳ bộ lọc tham số nào thay đổi trạng thái
  useEffect(() => {
    loadServicesData()
  }, [loadServicesData])

  // Định dạng hiển thị tiền tệ chuẩn vi-VN VND
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "Miễn phí / Liên hệ"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary shrink-0" />
            Danh mục dịch vụ khám bệnh
          </h2>
          <p className="text-body-md text-on-surface-variant">Quản lý danh sách dịch vụ, bảng giá và thời lượng chuẩn tại phòng khám của bạn</p>
        </div>
        
        <Link 
          href="/clinic-admin/clinic-services/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> Thêm dịch vụ
        </Link>
      </div>

      {/* Thanh công cụ: Ô tìm kiếm văn bản & Bộ lọc trạng thái hoạt động */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        {/* Ô Tìm kiếm input text */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh theo tên dịch vụ y tế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Dropdown Lọc trạng thái hoạt động của dịch vụ */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> Trạng thái:
          </span>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1) // Reset trang về 1 khi thay đổi tiêu chí lọc
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">Tất cả dịch vụ</option>
            <option value="active">Đang mở / Hoạt động</option>
            <option value="inactive">Đang đóng / Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Trạng thái đang tải dữ liệu Skeleton/Pulse */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            Đang nạp danh mục dịch vụ phòng khám từ hệ thống...
          </p>
        </div>
      )}

      {/* Hiển thị lỗi nhận về từ API */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bảng kết quả hiển thị danh sách dịch vụ */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">Tên dịch vụ</th>
                    <th className="p-4">Giá dịch vụ chuẩn</th>
                    <th className="p-4">Thời lượng thực hiện</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {servicesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-on-surface-variant">
                        Không tìm thấy dịch vụ y tế nào phù hợp với bộ lọc điều kiện hiện tại.
                      </td>
                    </tr>
                  ) : (
                    servicesList.map((service) => (
                      <tr key={service.id_service} className="hover:bg-surface-container-low/40 transition-colors">
                        {/* Tên dịch vụ y tế */}
                        <td className="p-4">
                          <p className="font-semibold text-on-surface">{service.serviceName}</p>
                        </td>
                        
                        {/* Bảng giá niêm yết */}
                        <td className="p-4 text-primary font-semibold">
                          <div className="flex items-center gap-1.5 text-label-md">
                            {formatCurrency(service.price)}
                          </div>
                        </td>

                        {/* Thời lượng ước tính */}
                        <td className="p-4 text-on-surface-variant">
                          <div className="flex items-center gap-1.5 text-label-md">
                            <Clock className="h-4 w-4 text-on-surface-variant shrink-0" /> 
                            {service.durationMinutes} phút
                          </div>
                        </td>

                        {/* Nhãn hiển thị trạng thái hoạt động */}
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-label-sm font-semibold border ${
                            service.isActive 
                              ? "bg-success-container text-on-success-container border-success/20" 
                              : "bg-error-container text-on-error-container border-error/20"
                          }`}>
                            {service.isActive ? "Đang hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thanh phân trang Pagination Controls */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                Hiển thị dòng <span className="font-semibold text-on-surface">{Math.min((meta.page - 1) * meta.size + 1, meta.total)}</span> đến{" "}
                <span className="font-semibold text-on-surface">{Math.min(meta.page * meta.size, meta.total)}</span> trên tổng số{" "}
                <span className="font-semibold text-on-surface">{meta.total}</span> dịch vụ phòng khám.
              </div>

              <div className="flex items-center gap-2">
                {/* Giới hạn kích thước trang Dropdown */}
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

                {/* Nút lùi về trang trước */}
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Tổng quan vị trí trang hiện tại */}
                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>

                {/* Nút tiến tới trang kế tiếp */}
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