"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
  Microscope,
  Search,
  User,
  Calendar,
  FileText,
  Loader2,
  ChevronRight,
  Filter,
  CheckCircle2,
} from "lucide-react"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordsItem } from "@/types"
import ParaclinicalPanel from "@/components/doctor/ParaclinicalPanel"

interface ParaclinicalPageClientProps {
  initialRecordId?: string
}

export default function ParaclinicalPageClient({
  initialRecordId,
}: ParaclinicalPageClientProps) {
  const t = useTranslations("common")

  const [records, setRecords] = useState<GetMedicalRecordsItem[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialRecordId || "")
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [searchPatient, setSearchPatient] = useState("")

  const loadMedicalRecords = useCallback(async () => {
    setLoadingRecords(true)
    try {
      const resp = await medicalRecordsService.getMedicalRecords({
        pageNumber: 1,
        pageSize: 50,
        searchTerm: searchPatient.trim() || undefined,
      })
      const items = resp.data ?? []
      setRecords(items)

      // Auto select the first record if none selected or invalid
      if (items.length > 0) {
        if (!selectedRecordId || !items.some((r) => r.id === selectedRecordId)) {
          setSelectedRecordId(items[0].id)
        }
      }
    } catch (err) {
      console.error("Error loading medical records:", err)
    } finally {
      setLoadingRecords(false)
    }
  }, [searchPatient, selectedRecordId])

  useEffect(() => {
    loadMedicalRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedRecord = records.find((r) => r.id === selectedRecordId)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Page Title & Banner */}
      <div className="rounded-2xl bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs">
              <Microscope className="h-4 w-4 text-indigo-300" /> Quản lý cận lâm sàng chuyên khoa Mắt
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Danh sách & Chi tiết Cận lâm sàng
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-3xl leading-relaxed">
              Tra cứu hồ sơ chỉ định cận lâm sàng (Cắt lớp võng mạc OCT, Đo thị trường Visual Field, Siêu âm mắt, Xét nghiệm), xem chi tiết các chỉ số đo đạc và phân tích chẩn đoán AI.
            </p>
          </div>
        </div>
      </div>

      {/* Patient / Medical Record Selector Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" /> Chọn Hồ sơ Bệnh nhân để xem Cận lâm sàng
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Chọn bệnh nhân từ danh sách hoặc tìm kiếm theo tên / số điện thoại.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadMedicalRecords()}
              placeholder="Tìm theo tên bệnh nhân / SĐT..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-xs text-gray-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Records Selection Dropdown & Chips */}
        {loadingRecords ? (
          <div className="flex items-center justify-center py-6 text-xs text-gray-500 gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Đang tải danh sách hồ sơ bệnh án...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
            Không tìm thấy hồ sơ bệnh án nào.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Danh sách Hồ sơ Bệnh án ({records.length})
                </label>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.patientFullName} — {r.recordType?.replace("MS", "Mẫu ") || "Bệnh án"} ({new Date(r.createdAt).toLocaleDateString("vi-VN")}) {r.patientPhone ? `· SĐT: ${r.patientPhone}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Record Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-gray-500 mr-1">Hồ sơ gần đây:</span>
              {records.slice(0, 5).map((r) => {
                const isSelected = r.id === selectedRecordId
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRecordId(r.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <User className="h-3 w-3" />
                    {r.patientFullName}
                    {isSelected && <CheckCircle2 className="h-3 w-3 ml-0.5 text-indigo-200" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Patient Banner */}
      {selectedRecord && (
        <div className="rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/80 to-purple-50/50 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {selectedRecord.patientFullName?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <p className="font-bold text-sm text-indigo-950">{selectedRecord.patientFullName}</p>
              <p className="text-gray-600 text-[11px] mt-0.5">
                Mã bệnh án: <code className="font-mono text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-100">{selectedRecord.id}</code> · Ngày tạo: {new Date(selectedRecord.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white px-3 py-1 font-semibold text-indigo-800 border border-indigo-200 shadow-2xs">
              Loại: {selectedRecord.recordType}
            </span>
          </div>
        </div>
      )}

      {/* Main Paraclinical Panel for selected record */}
      {selectedRecordId ? (
        <ParaclinicalPanel recordId={selectedRecordId} defaultOpen={true} />
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          <Microscope className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-semibold text-sm text-gray-700">Vui lòng chọn một hồ sơ bệnh án để xem danh sách và chi tiết cận lâm sàng.</p>
        </div>
      )}
    </div>
  )
}
