"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Calendar, 
  Search, 
  User, 
  Clock, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"

import { clinicAppointmentService } from "@/services"
import type { GetClinicAppointmentResponse } from "@/services/clinic-appointment.service"
import { formatCurrency } from "@/lib/utils"
import type { MetaResponse } from "@/types"

export default function ClinicAdminAppointments() {
  const [appointments, setAppointments] = useState<GetClinicAppointmentResponse[]>([])
  const [metadata, setMetadata] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State bộ lọc và phân trang
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [appointmentDate, setAppointmentDate] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize] = useState<number>(10)

  // 1. Xử lý Debounce cho ô tìm kiếm (tránh spam API khi gõ chữ)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1) // Reset về trang 1 khi tìm kiếm thay đổi
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 2. Hàm call API chính xác theo cấu trúc BE
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clinicAppointmentService.getAll({
        searchTerm: debouncedSearchTerm,
        status: status || undefined, // Nếu rỗng thì truyền undefined để hàm cleanParams loại bỏ
        appointmentDate: appointmentDate || undefined,
        pageNumber,
        pageSize
      })

      setAppointments(response.data || [])
      if (response.meta) {
        setMetadata(response.meta)
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách cuộc hẹn"
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, status, appointmentDate, pageNumber, pageSize])

  // 3. Lắng nghe thay đổi của các bộ lọc để tải lại dữ liệu
  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Reset trang về 1 khi thay đổi select hoặc date
  const handleFilterChange = () => {
    setPageNumber(1)
  }

  const getStatusBadgeClass = (statusStr: string) => {
    switch (statusStr?.toUpperCase()) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100"
      case "BOOKED": return "bg-blue-50 text-blue-700 border-blue-100"
      case "ARRIVED": return "bg-indigo-50 text-indigo-700 border-indigo-100"
      case "IN_PROGRESS": return "bg-purple-50 text-purple-700 border-purple-100"
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-100"
      case "NOSHOW": return "bg-gray-50 text-gray-600 border-gray-100"
      default: return "bg-gray-50 text-gray-700 border-gray-100"
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản Lý Lịch Hẹn</h1>
          <p className="text-gray-500 mt-1 text-sm">Xem, tìm kiếm và phân loại danh sách đặt lịch của toàn phòng khám</p>
        </div>
        <button
          onClick={loadAppointments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Thanh bộ lọc dữ liệu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        {/* Tìm kiếm */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên bệnh nhân, tên bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Trạng thái */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 appearance-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý (Pending)</option>
            <option value="BOOKED">Đã đặt lịch (Booked)</option>
            <option value="ARRIVED">Đã đến nơi (Arrived)</option>
            <option value="IN_PROGRESS">Đang khám (In Progress)</option>
            <option value="COMPLETED">Hoàn thành (Completed)</option>
            <option value="CANCELLED">Đã hủy (Cancelled)</option>
            <option value="NOSHOW">Không đến (No Show)</option>
          </select>
        </div>

        {/* Chọn ngày */}
        <div className="relative">
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => { setAppointmentDate(e.target.value); handleFilterChange(); }}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 cursor-pointer"
          />
        </div>
      </div>

      {/* Khu vực hiển thị bảng dữ liệu hoặc lỗi */}
      {error ? (
        <div className="p-8 text-center min-h-[300px] bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
          <div className="text-red-500 font-medium">{error}</div>
          <button
            onClick={loadAppointments}
            className="mt-4 px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-sm"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Bệnh nhân</th>
                  <th className="p-4">Bác sĩ phụ trách</th>
                  <th className="p-4">Thời gian hẹn</th>
                  <th className="p-4">Dịch vụ</th>
                  <th className="p-4">Đặt cọc</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                    </tr>
                  ))
                ) : appointments.length > 0 ? (
                  appointments.map((app) => (
                    <tr key={app.id_appointment} className="hover:bg-gray-50/50 group transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-gray-900">{app.patientName}</div>
                        <div className="text-gray-400 text-xs font-medium mt-0.5">{app.patientPhone}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium text-gray-800">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {app.doctorName}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {app.appointmentDate}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          {app.timeSlot}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {app.serviceName}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{formatCurrency(app.depositAmount)}</div>
                        <div className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${app.depositPaid ? "text-emerald-600" : "text-gray-400"}`}>
                          {app.depositPaid ? "Đã trả" : "Chưa trả"}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">
                      Không tìm thấy lịch hẹn nào trùng khớp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang dưới chân bảng */}
          {metadata && metadata.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Hiển thị trang <span className="font-bold text-gray-800">{metadata.page}</span> / <span className="font-bold text-gray-800">{metadata.totalPages}</span> (Tổng <span className="font-bold text-gray-800">{metadata.total}</span> dòng)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                  disabled={!metadata.hasPrevious || loading}
                  className="p-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setPageNumber(p => p + 1)}
                  disabled={!metadata.hasNext || loading}
                  className="p-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}