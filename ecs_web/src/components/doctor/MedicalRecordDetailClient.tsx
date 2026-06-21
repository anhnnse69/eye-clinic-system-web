// components/doctor/MedicalRecordDetailClient.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Loader2, Calendar, User, FileText } from "lucide-react"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordsItem } from "@/types"
import { RECORD_TYPE_LABELS, type RecordType } from "@/types"

interface MedicalRecordDetailClientProps {
  recordId: string
  appointmentId?: string
}

export default function MedicalRecordDetailClient({
  recordId,
  appointmentId,
}: MedicalRecordDetailClientProps) {
  const [record, setRecord] = useState<GetMedicalRecordsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await medicalRecordsService.getMedicalRecordById(recordId)
        if (response.data) {
          setRecord(response.data)
        }
      } catch (err) {
        console.error("Error fetching record:", err)
        setError("Không thể tải chi tiết hồ sơ bệnh án")
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [recordId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Đang tải dữ liệu
          </h3>
          <p className="text-sm text-gray-500">
            Vui lòng chờ trong giây lát...
          </p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Đã xảy ra lỗi
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || "Không thể tải chi tiết hồ sơ bệnh án. Vui lòng thử lại sau."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all shadow-lg shadow-gray-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Thử lại
            </button>

            <Link
              href="/doctor/records"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/doctor/records"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách hồ sơ
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết hồ sơ bệnh án</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Patient Info */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông tin bệnh nhân
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ tên</p>
                <p className="font-medium text-gray-900">{record.patientFullName}</p>
              </div>
              {record.patientDob && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                  <p className="font-medium text-gray-900">{record.patientDob}</p>
                </div>
              )}
              {record.patientPhone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-medium text-gray-900">{record.patientPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Thông tin lịch hẹn
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mã lịch hẹn</p>
                <p className="font-mono text-sm text-gray-900">{record.appointmentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày khám</p>
                <p className="font-medium text-gray-900">
                  {new Date(record.appointmentDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Bác sĩ</p>
                <p className="font-medium text-gray-900">{record.doctorFullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Loại hồ sơ</p>
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg">
                  {RECORD_TYPE_LABELS[record.recordType as RecordType] || record.recordType}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Thông tin y tế
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Triệu chứng</p>
                <p className="text-gray-900">{record.chiefComplaint || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Chẩn đoán</p>
                <p className="text-gray-900">{record.diagnosisMain || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Kế hoạch điều trị</p>
                <p className="text-gray-900">{record.treatmentPlan || "—"}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="p-6 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {record.isLocked ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600">
                    Đã khóa
                  </span>
                ) : record.canEdit ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700">
                    Có thể chỉnh sửa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700">
                    Chỉ xem
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Tạo lúc: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
