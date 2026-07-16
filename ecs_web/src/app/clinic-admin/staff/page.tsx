"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { useTranslations } from "next-intl"
import { staffService } from "@/services/staff.service"
import type { StaffAccountResponse } from "@/services/staff.service"

// Định nghĩa giao diện MetaResponse đồng bộ chính xác với Backend C#
interface MetaResponse {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function StaffManagementPage() {
  const t = useTranslations("clinicAdmin.staff")
  const tCommon = useTranslations("clinicAdmin.common")

  // State quản lý danh sách dữ liệu và trạng thái ứng dụng
  const [staffList, setStaffList] = useState<StaffAccountResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State lưu trữ thông tin phân trang từ Backend meta
  const [meta, setMeta] = useState<MetaResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  // State kiểm soát các tham số bộ lọc tìm kiếm đầu vào
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Hiệu ứng trì hoãn (Debounce) 500ms đối với thanh tìm kiếm văn bản để tối ưu băng thông API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1) // Reset về trang đầu khi thay đổi từ khóa tìm kiếm
    }, 500)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm xử lý gọi API kết nối Server lấy danh sách nhân viên kèm bộ lọc
  const loadStaffData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Chuyển đổi trạng thái filter string sang kiểu boolean? cho API
      const isActiveParam = 
        isActiveFilter === "active" ? true : 
        isActiveFilter === "inactive" ? false : undefined

      // Gọi service truyền đầy đủ các tham số truy vấn phân trang
      const response = await staffService.getStaffList({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch || undefined
      })

      if (response.data) {
        setStaffList(response.data)
      }
      
      // Khớp nối dữ liệu Metadata phân trang được trả về từ tầng ApiResponse
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage

      if (errCode === "APP_MESSAGE_4001") {
        setError(t("sessionExpired"))
      } else if (errCode === "APP_MESSAGE_4020") {
        setError(t("clinicNotFound"))
      } else {
        setError(t("connectionError"))
      }
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch, t])

  // Kích hoạt nạp dữ liệu khi bất kỳ bộ lọc tham số nào thay đổi trạng thái
  useEffect(() => {
    loadStaffData()
  }, [loadStaffData])

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Tiêu đề & Nút Thêm nhân viên */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">{t("listTitle")}</h2>
          <p className="text-body-md text-on-surface-variant">{t("listSubtitle")}</p>
        </div>
        
        <Link 
          href="/clinic-admin/staff/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> {t("addStaff")}
        </Link>
      </div>

      {/* Thanh công cụ: Bộ lọc trạng thái & Thanh Tìm kiếm nâng cao */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        {/* Ô Tìm kiếm input text */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Dropdown Lọc trạng thái hoạt động */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> {t("status")}:
          </span>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>
      </div>

      {/* Trạng thái đang tải dữ liệu Skeleton/Pulse */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">{t("loadingData")}</p>
        </div>
      )}

      {/* Hiển thị lỗi từ API */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bảng kết quả hiển thị danh sách nhân viên */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">{t("fullName")}</th>
                    <th className="p-4">{t("contactInfo")}</th>
                    <th className="p-4">{t("position")}</th>
                    <th className="p-4">{t("status")}</th>
                    <th className="p-4">{t("joinDate")}</th>
                    <th className="p-4 text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant">
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr key={staff.userId} className="hover:bg-surface-container-low/40 transition-colors">
                        {/* Avatar & Họ và tên */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold shrink-0">
                              {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface">{staff.fullName}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Email & Số điện thoại liên hệ */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
                              <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {staff.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
                              <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {staff.phone || t("notAvailable")}
                            </div>
                          </div>
                        </td>

                        {/* Phân quyền / Chức vụ */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary-container text-on-secondary-container text-label-sm font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
                            {staff.role}
                          </span>
                        </td>

                        {/* Trạng thái hoạt động mã màu đồng bộ */}
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                            staff.isActive 
                              ? "bg-success-container text-on-success-container" 
                              : "bg-error-container text-on-error-container"
                          }`}>
                            {staff.isActive ? t("statusActive") : t("statusInactive")}
                          </span>
                        </td>

                        {/* Ngày tạo tài khoản */}
                        <td className="p-4 text-on-surface-variant">
                          <div className="flex items-center gap-1.5 text-label-md">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(staff.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </td>

                        {/* Thao tác chỉnh sửa thông tin */}
                        <td className="p-4 text-center">
                          <Link
                            href={`/clinic-admin/staff/edit/${staff.userId}`}
                            className="inline-flex items-center justify-center p-2 text-primary hover:bg-surface-container-low rounded-xl transition-colors bg-surface-container-low/40"
                            title={tCommon("edit")}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thanh phân trang Pagination Controls (Dựa theo cấu trúc MetaResponse) */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                {t("showingRows", { 
                  from: Math.min((meta.page - 1) * meta.size + 1, meta.total), 
                  to: Math.min(meta.page * meta.size, meta.total), 
                  total: meta.total 
                })}
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
                  <option value={5}>5 {t("rowsPerPage")}</option>
                  <option value={10}>10 {t("rowsPerPage")}</option>
                  <option value={20}>20 {t("rowsPerPage")}</option>
                  <option value={50}>50 {t("rowsPerPage")}</option>
                </select>

                {/* Nút quay lại trang trước */}
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("previousPage")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Số trang hiển thị trực quan */}
                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>

                {/* Nút chuyển tới trang kế tiếp */}
                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("nextPage")}
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