"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  User,
  Calendar,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash2,
  CheckCircle2, // Import thêm icon thông báo thành công
} from "lucide-react"

import { clinicFeedbackService } from "@/services"
import type { GetClinicFeedbackResponse } from "@/services/clinic-feedback.service"
import type { MetaResponse } from "@/types"

export default function ClinicFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<GetClinicFeedbackResponse[]>([])
  const [metadata, setMetadata] = useState<MetaResponse | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // State thông báo thành công

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  const [ratingDoctor, setRatingDoctor] = useState("")
  const [ratingClinic, setRatingClinic] = useState("")
  const [feedbackDate, setFeedbackDate] = useState("")

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isFiltering = searchTerm !== "" || ratingDoctor !== "" || ratingClinic !== "" || feedbackDate !== ""

  // Tự động ẩn thông báo thành công sau 3 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadFeedbacks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clinicFeedbackService.getAll({
        searchTerm: debouncedSearchTerm,
        ratingDoctor: ratingDoctor ? Number(ratingDoctor) : undefined,
        ratingClinic: ratingClinic ? Number(ratingClinic) : undefined,
        feedbackDate: feedbackDate || undefined,
        pageNumber,
        pageSize,
      })

      setFeedbacks(response.data || [])
      if (response.meta) {
        setMetadata(response.meta)
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách đánh giá phòng khám"
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, ratingDoctor, ratingClinic, feedbackDate, pageNumber, pageSize])

  useEffect(() => {
    loadFeedbacks()
  }, [loadFeedbacks])

  const handleFilterChange = () => {
    setPageNumber(1)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setRatingDoctor("")
    setRatingClinic("")
    setFeedbackDate("")
    setPageNumber(1)
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")
    if (!confirmed) return

    try {
      setDeletingId(id)
      setError(null)
      setSuccessMessage(null) // Xóa thông báo cũ trước khi thực hiện hành động mới

      await clinicFeedbackService.delete(id)

      setSuccessMessage("Xóa đánh giá thành công!") // Thiết lập thông báo thành công
      await loadFeedbacks()
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Xóa đánh giá thất bại"
      )
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
              }`}
          />
        ))}
        <span className="text-xs font-semibold ml-1 text-gray-600">({rating})</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản Lý Đánh Giá & Phản Hồi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem danh sách, kiểm tra xếp hạng bác sĩ và trải nghiệm dịch vụ phòng khám từ bệnh nhân.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm items-center">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên bệnh nhân, bác sĩ hoặc bình luận..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 transition-shadow"
          />
        </div>

        <div>
          <select
            value={ratingDoctor}
            onChange={(e) => {
              setRatingDoctor(e.target.value)
              handleFilterChange()
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700 transition-shadow"
          >
            <option value="">Đánh giá Bác sĩ (Tất cả)</option>
            {[5, 4, 3, 2, 1].map((item) => (
              <option key={item} value={item}>
                {item} Sao
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={ratingClinic}
            onChange={(e) => {
              setRatingClinic(e.target.value)
              handleFilterChange()
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-700 transition-shadow"
          >
            <option value="">Đánh giá Phòng khám (Tất cả)</option>
            {[5, 4, 3, 2, 1].map((item) => (
              <option key={item} value={item}>
                {item} Sao
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full">
          <input
            type="date"
            value={feedbackDate}
            onChange={(e) => {
              setFeedbackDate(e.target.value)
              handleFilterChange()
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 transition-shadow"
          />

          <button
            onClick={handleResetFilters}
            disabled={!isFiltering}
            title="Xóa tất cả bộ lọc"
            className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-200 ${isFiltering
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100/70 active:scale-95"
              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
              }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thông báo Lỗi */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-200 rounded-xl bg-red-50 transition-all">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {/* Thông báo Thành Công */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 text-sm text-emerald-800 border border-emerald-200 rounded-xl bg-emerald-50 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <div className="font-medium">{successMessage}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500 table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-6 py-4 font-semibold w-[20%]">Bệnh nhân</th>
                <th className="px-6 py-4 font-semibold w-[20%]">Bác sĩ đảm nhiệm</th>
                <th className="px-6 py-4 font-semibold text-center w-[13%]">Đánh giá Bác sĩ</th>
                <th className="px-6 py-4 font-semibold text-center w-[15%]">Đánh giá Phòng khám</th>
                <th className="px-6 py-4 font-semibold w-[22%]">Nội dung bình luận</th>
                <th className="px-6 py-4 font-semibold w-[14%]">Ngày hẹn khám</th>
                <th className="px-6 py-4 font-semibold w-[14%]">Thời gian gửi</th>
                <th className="px-6 py-4 font-semibold w-[10%]">Hành động</th>
              </tr>
            </thead>

            {(loading || feedbacks.length > 0) && (
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={8} className="px-6 py-4.5">
                        <div className="h-5 bg-gray-100 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  feedbacks.map((item) => (
                    <tr key={item.id_feedback} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs flex-shrink-0">
                            <User className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="font-medium text-gray-900 ">{item.patientName}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium ">{item.doctorName}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {renderStars(item.ratingDoctor)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {renderStars(item.ratingClinic)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-normal break-words max-w-[280px]">
                        <div className="text-gray-700 text-sm italic bg-gray-50 p-2.5 rounded-xl border border-gray-100/70 line-clamp-3 hover:line-clamp-none transition-all duration-200">
                          "{item.comment || "Không có nội dung bình luận"}"
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200/50 w-fit whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {item.appointmentDate}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.feedbackDate}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDelete(item.id_feedback)}
                            disabled={deletingId === item.id_feedback}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-all duration-150 ${deletingId === item.id_feedback
                              ? "opacity-60 cursor-not-allowed bg-white text-gray-400 border-gray-200"
                              : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                              }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        {!loading && feedbacks.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-20 px-6 bg-white border-t border-gray-100">
            <div className="p-4 rounded-full bg-gray-50 border border-gray-100/80 shadow-sm mb-4">
              <MessageSquare className="w-10 h-10 text-gray-300 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
              Không tìm thấy đánh giá
            </h3>
          </div>
        )}

        {/* Pagination Section */}
        {metadata && metadata.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Hiển thị trang <span className="font-semibold text-gray-900">{metadata.page}</span> trên tổng số{" "}
              <span className="font-semibold text-gray-900">{metadata.totalPages}</span> trang
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={!metadata.hasPrevious || loading}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="inline-flex items-center justify-center p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={!metadata.hasNext || loading}
                onClick={() => setPageNumber((p) => p + 1)}
                className="inline-flex items-center justify-center p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}