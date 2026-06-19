"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Layers,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  FileText
} from "lucide-react"
import { medicineService } from "@/services/medicine.service"
import type { GetMedicineCatalogResponse } from "@/services/medicine.service"

export default function MedicineCatalogManagementPage() {
  const [medicineList, setMedicineList] = useState<GetMedicineCatalogResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
  const [searchTerm, setSearchTerm] = useState<string>("") // Sửa lỗi: Khởi tạo giá trị chuỗi rỗng mặc định để tránh lỗi Controlled component
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Debounce tìm kiếm tự động sau 500ms để giảm tần suất gọi API liên tục
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1) // Reset về trang 1 khi bắt đầu gõ tìm kiếm từ khoá mới
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm load danh sách dữ liệu danh mục thuốc từ API phối hợp phân trang & bộ lọc
  const loadMedicineData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const isActiveParam =
        isActiveFilter === "active" ? true :
        isActiveFilter === "inactive" ? false : undefined

      const response = await medicineService.getMedicineCatalog({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response && response.data) {
        setMedicineList(response.data)
      } else {
        setMedicineList([])
      }

      if (response && response.meta) {
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
      // Map mã lỗi định danh từ Backend (C# ApiResponse Fail Codes)
      const errCode = err?.response?.data?.codeMessage
      if (errCode === "APP_MESSAGE_4001") {
        setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!")
      } else if (errCode === "APP_MESSAGE_4020") {
        setError("Không tìm thấy thông tin phòng khám gắn liền với tài khoản quản trị của bạn!")
      } else {
        setError("Không thể kết nối tới máy chủ hệ thống. Vui lòng thử lại sau!")
      }
      setMedicineList([])
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch])

  useEffect(() => {
    loadMedicineData()
  }, [loadMedicineData])

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary shrink-0" />
            Danh mục thuốc phòng khám
          </h2>
          <p className="text-body-md text-on-surface-variant">Quản lý danh sách thuốc, hoạt chất, hàm lượng và đơn vị tính tại phòng khám</p>
        </div>

        <Link
          href="/clinic-admin/medicine-catalog/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> Thêm thuốc mới
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm theo tên thuốc, hoạt chất gốc, nhà sản xuất..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> Trạng thái:
          </span>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">Tất cả thuốc</option>
            <option value="active">Đang sử dụng / Hoạt động</option>
            <option value="inactive">Đang khóa / Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            Đang nạp danh mục thuốc từ hệ thống...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table View */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">Thông tin thuốc</th>
                    <th className="p-4">Hàm lượng / Nồng độ</th>
                    <th className="p-4">Đơn vị / Dạng bào chế</th>
                    <th className="p-4">Nhà sản xuất</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {medicineList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant">
                        Không tìm thấy loại thuốc nào phù hợp với bộ lọc điều kiện hiện tại.
                      </td>
                    </tr>
                  ) : (
                    medicineList.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-on-surface">{medicine.medicineName}</p>
                          {medicine.genericName && (
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <FileText className="h-3 w-3" /> Tên gốc: {medicine.genericName}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-primary font-medium">
                          {medicine.concentration}
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          <span className="font-medium text-on-surface">{medicine.unit}</span>
                          <span className="text-xs block text-on-surface-variant/80">{medicine.dosageForm}</span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-sm">
                          {medicine.manufacturer || "---"}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            medicine.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-neutral-50 text-neutral-600 border border-neutral-200"
                          }`}>
                            {medicine.isActive ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/clinic-admin/medicine-catalog/${medicine.id}`}
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

          {/* Pagination Controls */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                Hiển thị dòng <span className="font-semibold text-on-surface">{Math.min((meta.page - 1) * meta.size + 1, meta.total)}</span> đến{" "}
                <span className="font-semibold text-on-surface">{Math.min(meta.page * meta.size, meta.total)}</span> trên tổng số{" "}
                <span className="font-semibold text-on-surface">{meta.total}</span> loại thuốc.
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