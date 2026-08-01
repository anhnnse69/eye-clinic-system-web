"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2, Search, Filter, ChevronLeft, ChevronRight,
  MapPin, Phone, Mail, AlertCircle, Loader2, Edit2, Ban, X
} from "lucide-react"
import { clinicsService } from "@/services"
import { handleApiError } from "@/lib/axios"
import type { ClinicManagementItem, MetaResponse } from "@/types"

export default function ClinicsListPage() {
  const router = useRouter()

  const [clinics, setClinics] = useState<ClinicManagementItem[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [pagination, setPagination] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPublicationCount, setPendingPublicationCount] = useState<number>(0)

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [selectedClinicName, setSelectedClinicName] = useState<string>("")
  const [deleting, setDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchClinics()
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

  useEffect(() => {
    fetchPendingPublicationCount()
  }, [])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clinicsService.getClinics({
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      const resData = response?.data || (response as any)?.Data
      const resMeta = response?.meta || (response as any)?.Meta

      if (resData && Array.isArray(resData)) {
        setClinics(resData as ClinicManagementItem[])
        if (resMeta) {
          setPagination(resMeta as MetaResponse)
        }
      } else {
        setClinics([])
      }
    } catch (err) {
      setError("Không thể tải danh sách phòng khám. Vui lòng kiểm tra lại kết nối hệ thống.")
      console.error("Error fetching clinics:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingPublicationCount = async () => {
    try {
      const response = await clinicsService.getClinics({
        status: "ACTIVE",
        pageNumber: 1,
        pageSize: 100,
      })

      const resData = response?.data || (response as any)?.Data

      if (resData && Array.isArray(resData)) {
        const pendingCount = resData.filter((clinic: any) => {
          const isPublished = clinic.isPublished ?? clinic.IsPublished
          const isPublicationRequested = clinic.isPublicationRequested ?? clinic.IsPublicationRequested

          return isPublicationRequested === true && isPublished === false
        }).length

        setPendingPublicationCount(pendingCount)
      } else {
        setPendingPublicationCount(0)
      }
    } catch (err) {
      console.error("Error fetching pending publication count:", err)
    }
  }

  const handleOpenDeleteModal = (id: string, name: string) => {
    setSelectedClinicId(id)
    setSelectedClinicName(name)
    setDeleteError(null)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedClinicId(null)
    setSelectedClinicName("")
    setDeleteError(null)
    setDeleting(false)
  }

  const handleConfirmDelete = async () => {
    if (!selectedClinicId) return

    try {
      setDeleting(true)
      setDeleteError(null)

      await clinicsService.deleteClinic(selectedClinicId)

      handleCloseDeleteModal()
      await fetchClinics()
      await fetchPendingPublicationCount()
    } catch (err) {
      const apiErrorMessage = handleApiError(err)
      setDeleteError(`Vô hiệu hóa thất bại: ${apiErrorMessage}`)
      console.error("Error deleting clinic:", err)
    } finally {
      setDeleting(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
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

  const resolveDisplayState = (isPublished: boolean, rawStatus: string): {
    key: "UNPUBLISHED" | "ACTIVE" | "INACTIVE"
    label: string
    dotClass: string
    wrapperClass: string
  } => {
    const stateMap = {
      UNPUBLISHED: {
        key: "UNPUBLISHED" as const,
        label: "Chưa công khai",
        dotClass: "bg-slate-400",
        wrapperClass: "text-slate-600 bg-slate-100 border-slate-200",
      },
      ACTIVE: {
        key: "ACTIVE" as const,
        label: "Đang hoạt động",
        dotClass: "bg-green-600",
        wrapperClass: "text-green-700 bg-green-50 border-green-200",
      },
      INACTIVE: {
        key: "INACTIVE" as const,
        label: "Ngưng hoạt động",
        dotClass: "bg-amber-500",
        wrapperClass: "text-amber-700 bg-amber-50 border-amber-200",
      },
    }

    const resolutionKey = !isPublished ? "UNPUBLISHED" : rawStatus

    return stateMap[resolutionKey as keyof typeof stateMap] ?? stateMap.INACTIVE
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách phòng khám</h2>
          <nav className="flex text-sm text-slate-500 gap-1 mt-1">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="text-slate-800">Danh sách phòng khám</span>
          </nav>
        </div>

        <button
          onClick={() => router.push("/system-admin/clinics/pending-publications")}
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 self-start sm:self-center cursor-pointer"
        >
          <Building2 className="h-4 w-4" />
          <span>Yêu cầu duyệt công khai</span>

          {pendingPublicationCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-md border-2 border-white">
              {pendingPublicationCount > 99 ? "99+" : pendingPublicationCount}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Tìm kiếm phòng khám</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập mã cơ sở hoặc tên phòng khám..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Trạng thái hoạt động</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </div>

          <button
            onClick={fetchClinics}
            disabled={loading}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-0.5">Lỗi hệ thống</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Đang xử lý dữ liệu hệ thống...</p>
        </div>
      )}

      {!loading && clinics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <Building2 className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy phòng khám</h3>
          <p className="text-sm text-slate-500">Hiện tại không có dữ liệu phòng khám nào khớp với bộ lọc.</p>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[70px]">STT</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng khám / Địa chỉ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[160px]">Trạng thái</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[260px] whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clinics.map((clinic, index) => {
                  const id = clinic.id_clinic || (clinic as any).Id_clinic;
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const name = clinic.clinicName || (clinic as any).ClinicName;
                  const address = clinic.address || (clinic as any).Address;
                  const email = clinic.contactEmail || (clinic as any).ContactEmail;
                  const phone = clinic.contactPhone || (clinic as any).ContactPhone;
                  const rawStatus = (clinic.status || (clinic as any).Status || "").toUpperCase();
                  const isPublished = clinic.isPublished ?? (clinic as any).IsPublished;

                  const displayState = resolveDisplayState(isPublished, rawStatus);

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-600 text-sm text-center">{stt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 mt-0.5">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm text-slate-800">{name}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                              {address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {phone}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border ${displayState.wrapperClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${displayState.dotClass}`}></span>
                          <span>{displayState.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4 w-full">
                          {displayState.key !== "UNPUBLISHED" && (
                            <button
                              onClick={() => {
                                if (displayState.key === "ACTIVE") {
                                  router.push(`/system-admin/clinics/edit/${id}`)
                                } else {
                                  router.push(`/system-admin/clinics/edit/${id}?mode=view`)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4 shrink-0" />
                              <span>Chỉnh sửa</span>
                            </button>
                          )}

                          {displayState.key === "ACTIVE" && (
                            <button
                              onClick={() => handleOpenDeleteModal(id, name)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 px-2.5 py-1.5 hover:bg-red-50 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                            >
                              <Ban className="h-4 w-4 shrink-0" />
                              <span>Vô hiệu hóa</span>
                            </button>
                          )}

                          {displayState.key === "UNPUBLISHED" && (
                            <span className="text-xs text-slate-400 italic">Chưa có thao tác</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Hiển thị {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} phòng khám
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrevious || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {pagination.page}
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl animate-scaleIn overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-full">
                    <Ban className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Xác nhận vô hiệu hóa</h3>
                </div>
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={deleting}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-base leading-relaxed">
                Bạn có chắc chắn muốn vô hiệu hóa phòng khám <strong className="text-gray-900">{selectedClinicName}</strong>?
              </p>

              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold">Cảnh báo:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Phòng khám sẽ ngừng hoạt động trên hệ thống</li>
                      <li>Các dữ liệu liên quan vẫn được lưu trữ để tham khảo</li>
                    </ul>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[140px] cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Ban className="h-5 w-5" />
                    Xác nhận vô hiệu hóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}