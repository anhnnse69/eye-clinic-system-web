"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  Microscope,
  Search,
  User,
  Calendar,
  FileText,
  Loader2,
  ChevronDown,
  Filter,
  CheckCircle2,
  Phone,
  Tag,
  Clock,
  X,
  Sparkles,
} from "lucide-react"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordsItem } from "@/types"
import ParaclinicalPanel from "@/components/doctor/ParaclinicalPanel"

interface ParaclinicalPageClientProps {
  initialRecordId?: string
}

const formatShortId = (id?: string) => {
  if (!id) return ""
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}...${id.slice(-4)}`
}

export default function ParaclinicalPageClient({
  initialRecordId,
}: ParaclinicalPageClientProps) {
  const t = useTranslations("doctor.paraclinical")

  const [records, setRecords] = useState<GetMedicalRecordsItem[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialRecordId || "")
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [searchPatient, setSearchPatient] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load medical records with search term filter (supports 1000+ records via pagination & search)
  const loadMedicalRecords = useCallback(async () => {
    setLoadingRecords(true)
    try {
      const resp = await medicalRecordsService.getMedicalRecords({
        pageNumber: 1,
        pageSize: 100, // Load top 100 or search results dynamically
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
  }, [searchPatient])

  // Focus search input when combobox opens
  useEffect(() => {
    if (comboboxOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [comboboxOpen])

  const selectedRecord = records.find((r) => r.id === selectedRecordId)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Page Title & Banner — Rich High-Contrast Static Dark Indigo Background */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden"
        style={{
          backgroundColor: "#1e1b4b",
          backgroundImage: "linear-gradient(135deg, #2e1065 0%, #1e1b4b 60%, #0f172a 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              <Microscope className="h-4 w-4 text-amber-300" /> {t("eyecareBadge")}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl drop-shadow-xs">
              {t("pageTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-3xl leading-relaxed">
              {t("pageDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Patient / Medical Record Selector Bar (Trigger for Search Modal) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" /> Tra Cứu & Chọn Hồ Sơ Bệnh Nhân (Hỗ trợ 1.000+ hồ sơ)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Nhấn vào ô bên dưới để mở cửa sổ tra cứu thông minh theo tên, SĐT, loại mẫu MS21-MS26 hoặc mã hồ sơ.
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 self-start sm:self-auto">
            Tổng cộng: {records.length} hồ sơ khả dụng
          </span>
        </div>

        {/* Trigger Button to Open Search Modal */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700">
            Hồ sơ bệnh nhân đang xem cận lâm sàng:
          </label>
          <button
            type="button"
            onClick={() => setComboboxOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-indigo-300 bg-linear-to-r from-indigo-50/60 to-white px-4 py-3 text-left shadow-2xs hover:border-indigo-500 hover:bg-indigo-50/90 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs">
                {selectedRecord?.patientFullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-indigo-950 truncate">
                  {selectedRecord ? selectedRecord.patientFullName : "Bấm vào đây để chọn hồ sơ bệnh nhân..."}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {selectedRecord ? (
                    <>Mẫu: <strong className="text-indigo-800">{selectedRecord.recordType}</strong> · SĐT: {selectedRecord.patientPhone || "—"} · Ngày tạo: {new Date(selectedRecord.createdAt).toLocaleDateString()}</>
                  ) : (
                    "Tra cứu trong kho 1.000+ hồ sơ bệnh án nhãn khoa..."
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
                <Search className="h-3.5 w-3.5" /> Mở tra cứu (1.000+)
              </span>
              <ChevronDown className="h-4 w-4 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Quick Recent Patient Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-gray-500 mr-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Hồ sơ vừa xem gần đây:
            </span>
            {records.slice(0, 5).map((r) => {
              const isSelected = r.id === selectedRecordId
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRecordId(r.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
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
      </div>

      {/* ─── Backdrop Blur Overlay & Search Modal Dropdown (UX/UI Optimized) ─── */}
      {comboboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop Overlay with blur effect */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setComboboxOpen(false)}
          />

          {/* Elevated High-Contrast Modal Card */}
          <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-indigo-100 space-y-4 my-8 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-base">
                <Search className="h-5 w-5 text-indigo-600" />
                <span>Tra Cứu Hồ Sơ Bệnh Nhận (Kho 1.000+ Ca Khám)</span>
              </div>
              <button
                type="button"
                onClick={() => setComboboxOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Real-time Search Box inside Modal */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                placeholder="🔍 Nhập tên bệnh nhân, số điện thoại, loại mẫu MS21-MS26 hoặc mã hồ sơ..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-10 py-3 text-xs text-gray-900 font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
              />
              {searchPatient && (
                <button
                  type="button"
                  onClick={() => setSearchPatient("")}
                  className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {loadingRecords ? (
                <div className="flex flex-col items-center justify-center py-12 text-xs text-gray-500 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span>Đang tìm kiếm trong kho 1.000+ hồ sơ bệnh án...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500">
                  <User className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  Không tìm thấy hồ sơ bệnh án nào khớp với từ khóa "{searchPatient}".
                </div>
              ) : (
                records.map((r) => {
                  const isSelected = r.id === selectedRecordId
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecordId(r.id)
                        setComboboxOpen(false)
                      }}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/90 font-semibold" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xs ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {r.patientFullName?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            {r.patientFullName}
                            {r.patientPhone && (
                              <span className="font-normal text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {r.patientPhone}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-indigo-800 font-bold">
                              Mẫu: {r.recordType}
                            </span>
                            <span>Mã hồ sơ: <code className="font-mono text-gray-700">{formatShortId(r.id)}</code></span>
                            <span>Ngày tạo: {new Date(r.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đang chọn
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-indigo-600 hover:underline">
                          Chọn xem ➔
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span>Hiển thị top {records.length} hồ sơ phù hợp nhất</span>
              <button
                type="button"
                onClick={() => setComboboxOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Patient Info Banner */}
      {selectedRecord && (
        <div className="rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/80 to-purple-50/50 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {selectedRecord.patientFullName?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <p className="font-bold text-sm text-indigo-950">{selectedRecord.patientFullName}</p>
              <p className="text-gray-600 text-[11px] mt-0.5">
                {t("recordCode")} <code className="font-mono text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-100" title={selectedRecord.id}>{formatShortId(selectedRecord.id)}</code> · {t("createdDate")} {new Date(selectedRecord.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white px-3 py-1 font-semibold text-indigo-800 border border-indigo-200 shadow-2xs">
              {t("recordTypeLabel")} {selectedRecord.recordType}
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
          <p className="font-semibold text-sm text-gray-700">{t("pleaseSelectRecord")}</p>
        </div>
      )}
    </div>
  )
}

