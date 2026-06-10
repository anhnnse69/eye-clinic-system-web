"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Search, Filter, ChevronLeft, ChevronRight, 
  Eye, Building2, Calendar, AlertCircle, Loader2
} from "lucide-react"
import { clinicApplicationsService } from "@/services"

interface BackendClinicApplication {
  id_clinic_registration: string
  clinicName: string
  contactEmail: string
  contactPhone: string
  submissionDate: string
  status: string
}

interface BackendMetaResponse {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function ClinicApplicationsPage() {
  const router = useRouter()
  
  const [applications, setApplications] = useState<BackendClinicApplication[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("") // State hỗ trợ hoãn gọi API chống giật lag
  const [statusFilter, setStatusFilter] = useState<string>("") // Mặc định "" là Tất cả trạng thái
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [pagination, setPagination] = useState<BackendMetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Giúp debounce: Đợi người dùng gõ xong 400ms mới cập nhật debouncedSearchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // 2. Kích hoạt fetch dữ liệu dựa trên debouncedSearchTerm thay vì searchTerm gốc
  useEffect(() => {
    fetchApplications()
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clinicApplicationsService.getApplications({
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter || undefined, // Gửi trạng thái lên Backend API
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      console.log("=== API RESPONSE RAW ===", response);

      const resData = response?.data || (response as any)?.Data;
      const resMeta = response?.meta || (response as any)?.Meta;

      if (resData && Array.isArray(resData)) {
        setApplications(resData as BackendClinicApplication[])
        if (resMeta) {
          setPagination(resMeta as BackendMetaResponse)
        }
      } else {
        setApplications([])
      }
    } catch (err) {
      setError("Không thể tải danh sách đơn đăng ký. Vui lòng kiểm tra lại kết nối hệ thống.")
      console.error("Error fetching applications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/system-admin/applications/${id}`)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Trở về trang 1 khi gõ tìm kiếm mới
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Trở về trang 1 khi đổi bộ lọc trạng thái
  }

  const handlePreviousPage = () => {
    if (pagination?.hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đơn đăng ký phòng khám</h2>
          <nav className="flex text-sm text-slate-500 gap-1 mt-1">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="text-slate-800">Đơn đăng ký phòng khám</span>
          </nav>
        </div>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ô Tìm kiếm */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Tìm kiếm đơn đăng ký</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Nhập mã đơn hoặc tên phòng khám..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Ô lọc Trạng thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Trạng thái duyệt</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã chấp thuận</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>

          {/* Nút Làm mới */}
          <button 
            onClick={fetchApplications}
            disabled={loading}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full"
          >
            <Filter className="h-4 w-4" />
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      {/* Thông báo Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-0.5">Lỗi</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Hiệu ứng Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Đang tải danh sách đơn đăng ký...</p>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <FileText className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Không có đơn đăng ký phòng khám</h3>
          <p className="text-sm text-slate-500"> Hiện tại không có đơn đăng ký nào khớp với bộ lọc hoặc cơ sở dữ liệu trống.</p>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Phòng khám / Liên hệ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Ngày gửi</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => {
                  const id = app.id_clinic_registration || (app as any).Id_clinic_registration;
                  const name = app.clinicName || (app as any).ClinicName;
                  const email = app.contactEmail || (app as any).ContactEmail;
                  const phone = app.contactPhone || (app as any).ContactPhone;
                  const date = app.submissionDate || (app as any).SubmissionDate;
                  const status = (app.status || (app as any).Status || "").toUpperCase();

                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(id)}>
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-sm">{id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800">{name}</span>
                            <span className="text-xs text-slate-500">{phone} • {email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {status === "PENDING" && (
                          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Chờ duyệt</span>
                          </div>
                        )}
                        {status === "APPROVED" && (
                          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            <span>Đã duyệt</span>
                          </div>
                        )}
                        {status === "REJECTED" && (
                          <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            <span>Từ chối</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleViewDetails(id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-medium direct-btn">
                          <Eye className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pagination && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Hiển thị {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} đơn đăng ký
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrevious || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {pagination.page}
                </button>
                <button 
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}