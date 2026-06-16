"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
} from "lucide-react"

import { medicalRecordPatientDemographicsService } from "@/services"
import type { ViewPatientDemographicsResponse } from "@/types"

export default function PatientDemographicsPage({
  params,
}: {
  params: { id: string }
}) {
  const patientProfileId = params.id

  const [data, setData] = useState<ViewPatientDemographicsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [recordType, setRecordType] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await medicalRecordPatientDemographicsService.getPatientDemographics({
        patientProfileId,
        recordType,
        searchTerm: debouncedSearchTerm || undefined,
        pageNumber,
        pageSize,
      })

      if (response.data && response.data.id_PatientProfile) {
        setData(response.data)
      } else {
        setError("Không tìm thấy thông tin bệnh nhân")
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải thông tin bệnh nhân"
      )
    } finally {
      setLoading(false)
    }
  }, [patientProfileId, recordType, debouncedSearchTerm, pageNumber, pageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  const recordTypeOptions = [
    { value: "", label: "Tất cả" },
    { value: "MS21_TRAUMA", label: "Bệnh án mắt (Chấn thương)" },
    { value: "MS22_ANTERIOR", label: "Bệnh án mắt (Bán phần trước)" },
    { value: "MS23_FUNDUS", label: "Bệnh án mắt (Đáy mắt)" },
    { value: "MS24_GLAUCOMA", label: "Bệnh án mắt (Glôcôm)" },
    { value: "MS25_STRABISMUS_PTOSIS", label: "Bệnh án mắt (Lác, sụp mi)" },
    { value: "MS26_PEDIATRIC", label: "Bệnh án mắt (Mắt trẻ em)" },
  ]

  const genderLabel = data?.gender === "MALE" ? "Nam" : data?.gender === "FEMALE" ? "Nữ" : data?.gender || "—"
  const totalPages = data ? Math.ceil(data.totalRecords / pageSize) : 0

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-100">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Hồ sơ bệnh nhân
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thông tin nhân khẩu học và lịch sử bệnh án
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50/50">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-48 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-5 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-100 rounded-xl w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Demographics Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-semibold text-gray-900">
                Thông tin nhân khẩu học
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Họ tên
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <User className="w-4 h-4 text-gray-400" />
                    {data.fullName}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Giới tính
                  </p>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${genderLabel === 'Nam' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>
                    {genderLabel}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ngày sinh
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {data.dob}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Số điện thoại
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {data.phoneNumber || "—"}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    CCCD
                  </p>
                  <p className="text-sm font-mono text-gray-700">
                    {data.identityNumber || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    BHYT
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.bhytNumber || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Nhóm máu
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.bloodType || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Địa chỉ
                  </p>
                  <p className="text-sm text-gray-700">
                    {data.address || "—"}
                  </p>
                </div>
              </div>

              {(data.allergies || data.medicalHistory) && (
                <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {data.allergies && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Dị ứng
                      </p>
                      <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        {data.allergies}
                      </p>
                    </div>
                  )}
                  {data.medicalHistory && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tiền sử bệnh
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                        {data.medicalHistory}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Medical Records Section */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Hồ sơ bệnh án
                </h2>
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  {data.totalRecords}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={recordType ?? ""}
                  onChange={(e) => {
                    setRecordType(e.target.value || undefined)
                    setPageNumber(1)
                  }}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  {recordTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo chẩn đoán, triệu chứng..."
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {data.records.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Không tìm thấy hồ sơ bệnh án
                </h3>
                <p className="text-sm text-gray-500">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-600 min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold">
                      <th className="px-6 py-4 text-left font-semibold">Mã bệnh án</th>
                      <th className="px-6 py-4 text-left font-semibold">Loại</th>
                      <th className="px-6 py-4 text-left font-semibold">Bác sĩ</th>
                      <th className="px-6 py-4 text-left font-semibold">Ngày khám</th>
                      <th className="px-6 py-4 text-left font-semibold">Triệu chứng</th>
                      <th className="px-6 py-4 text-left font-semibold">Chẩn đoán</th>
                      <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-left font-semibold">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.records.map((record) => (
                      <tr
                        key={record.id_MedicalRecord}
                        className="hover:bg-gray-50/80 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {record.id_MedicalRecord}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {record.recordTypeLabel}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-400" />
                            {record.doctorName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {record.appointmentDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={record.chiefComplaint || undefined}>
                          {record.chiefComplaint || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={record.diagnosisMain || undefined}>
                          {record.diagnosisMain || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {record.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                              <Lock className="w-3 h-3" />
                              Đã khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Đang mở
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {record.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm text-gray-500 font-medium">
                  Trang <span className="text-gray-900 font-semibold">{pageNumber}</span> trên <span className="text-gray-900 font-semibold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => p - 1)}
                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    disabled={pageNumber >= totalPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
