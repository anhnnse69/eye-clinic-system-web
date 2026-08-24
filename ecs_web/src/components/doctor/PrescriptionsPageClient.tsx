"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import {
  Pill,
  Search,
  User,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  Eye,
  Stethoscope,
  ExternalLink,
  Printer,
  Sparkles,
  Filter,
  Glasses,
  ClipboardList,
  ChevronDown,
  Phone,
  Clock,
  X,
  Plus,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordsItem, GetMedicalRecordDetailResponse } from "@/types"
import CreatePrescriptionModal from "./medical-record-form/CreatePrescriptionModal"

interface PrescriptionsPageClientProps {
  initialRecordId?: string
}

const formatShortId = (id?: string) => {
  if (!id) return ""
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}...${id.slice(-4)}`
}

export default function PrescriptionsPageClient({
  initialRecordId,
}: PrescriptionsPageClientProps) {
  const t = useTranslations("doctor.prescriptions")
  const [records, setRecords] = useState<GetMedicalRecordsItem[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialRecordId || "")
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [searchPatient, setSearchPatient] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"medications" | "glasses" | "all">("all")
  const [recordDetail, setRecordDetail] = useState<GetMedicalRecordDetailResponse | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. Load list of medical records (supports 1000+ records via pagination & search)
  const loadMedicalRecords = useCallback(async () => {
    setLoadingRecords(true)
    try {
      const resp = await medicalRecordsService.getMedicalRecords({
        pageNumber: 1,
        pageSize: 100,
        searchTerm: searchPatient.trim() || undefined,
      })
      const items = resp.data ?? []
      setRecords(items)

      if (items.length > 0) {
        if (!selectedRecordId || !items.some((r) => r.id === selectedRecordId)) {
          setSelectedRecordId(items[0].id)
        }
      } else {
        setSelectedRecordId("")
        setRecordDetail(null)
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

  const fetchRecordDetail = useCallback(async (recId: string) => {
    if (!recId) return
    setLoadingDetail(true)
    try {
      const res = await medicalRecordsService.getMedicalRecordById(recId)
      if (res.data) {
        setRecordDetail(res.data)
      }
    } catch (err) {
      console.error("Error loading medical record detail for prescription view:", err)
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  // 2. Load detail of selected medical record
  useEffect(() => {
    if (!selectedRecordId) {
      setRecordDetail(null)
      return
    }
    fetchRecordDetail(selectedRecordId)
  }, [selectedRecordId, fetchRecordDetail])

  const selectedRecord = records.find((r) => r.id === selectedRecordId)

  // Normalize medication prescriptions (from top-level or formData)
  const normalizedMedPrescriptions = useMemo(() => {
    if (!recordDetail) return []
    if (recordDetail.prescriptions && recordDetail.prescriptions.length > 0) {
      return recordDetail.prescriptions
    }
    const formRx = recordDetail.formData?.prescription || recordDetail.formData?.keDonThuoc
    if (formRx) {
      const rawItems = formRx.drugs || formRx.danhSachThuoc || formRx.items || []
      if (rawItems.length > 0) {
        return [
          {
            id: "rx_form",
            createdAt: formRx.createdAt || recordDetail.createdAt,
            notes: formRx.notes || formRx.danhDao || "",
            doctorName: recordDetail.doctorFullName,
            items: rawItems.map((it: any, idx: number) => ({
              id: String(idx + 1),
              medicineName: it.medicineName || it.tenThuoc || "",
              dosage: it.dosage || it.hamLuong || "",
              quantity: String(it.quantity || it.soLuong || "1"),
              frequency: it.frequency || it.tanSuat || "",
              instruction: it.instruction || it.cachDung || "",
            })),
          },
        ]
      }
    }
    return []
  }, [recordDetail])

  // Normalize glasses prescriptions (from top-level or formData)
  const normalizedGlassesPrescriptions = useMemo(() => {
    if (!recordDetail) return []
    if (recordDetail.glassesPrescriptions && recordDetail.glassesPrescriptions.length > 0) {
      return recordDetail.glassesPrescriptions
    }
    const formGp = recordDetail.formData?.glassesPrescription
    if (formGp && Object.values(formGp).some((v: any) => v !== null && v !== undefined && String(v).trim() !== "")) {
      return [
        {
          id: "gp_form",
          createdAt: formGp.createdAt || recordDetail.createdAt,
          sphOd: formGp.sphOd,
          cylOd: formGp.cylOd,
          axisOd: formGp.axisOd,
          addOd: formGp.addOd,
          sphOs: formGp.sphOs,
          cylOs: formGp.cylOs,
          axisOs: formGp.axisOs,
          addOs: formGp.addOs,
          pd: formGp.pd,
          lensType: formGp.lensType,
          notes: formGp.notes,
        },
      ]
    }
    return []
  }, [recordDetail])

  // Calculate prescription metrics
  const medPrescriptionsCount = normalizedMedPrescriptions.length
  const glassesPrescriptionsCount = normalizedGlassesPrescriptions.length
  const totalMedItems = normalizedMedPrescriptions.reduce((acc, p) => acc + (p.items?.length || 0), 0)

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Page Title Banner — Solid Clean Emerald Green */}
      <div className="rounded-2xl bg-emerald-800 p-6 sm:p-8 text-white shadow-xl border border-emerald-700 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-xs">
              <Pill className="h-4 w-4 text-emerald-300" /> {t("eyecareBadge")}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl drop-shadow-xs">
              {t("pageTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              {t("pageDescription")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {selectedRecordId && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 text-emerald-600" /> Kê / Sửa Đơn Kính & Thuốc
                </button>
                <Link
                  href={`/doctor/records/${selectedRecordId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/30 active:scale-95 border border-white/20"
                >
                  <ExternalLink className="h-4 w-4" /> {t("viewOriginalRecord")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Patient / Medical Record Selector Bar (Trigger for Search Modal) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" /> Tra Cứu & Chọn Hồ Sơ Bệnh Nhân (Hỗ trợ 1.000+ hồ sơ)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Nhấn vào ô bên dưới để mở cửa sổ tra cứu thông minh theo tên, SĐT, loại mẫu MS21-MS26 hoặc mã hồ sơ.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 self-start sm:self-auto">
            Tổng cộng: {records.length} hồ sơ khả dụng
          </span>
        </div>

        {/* Trigger Button to Open Search Modal */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700">
            Hồ sơ bệnh nhân đang xem đơn thuốc & đơn kính:
          </label>
          <button
            type="button"
            onClick={() => setComboboxOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-300 bg-linear-to-r from-emerald-50/60 to-white px-4 py-3 text-left shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/90 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-xs">
                {selectedRecord?.patientFullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-950 truncate">
                  {selectedRecord ? selectedRecord.patientFullName : "Bấm vào đây để chọn hồ sơ bệnh nhân..."}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {selectedRecord ? (
                    <>Mẫu: <strong className="text-emerald-800">{selectedRecord.recordType}</strong> · SĐT: {selectedRecord.patientPhone || "—"} · Ngày tạo: {new Date(selectedRecord.createdAt).toLocaleDateString()}</>
                  ) : (
                    "Tra cứu trong kho 1.000+ hồ sơ bệnh án nhãn khoa..."
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Search className="h-3.5 w-3.5" /> Mở tra cứu (1.000+)
              </span>
              <ChevronDown className="h-4 w-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
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
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  <User className="h-3 w-3" />
                  {r.patientFullName}
                  {isSelected && <CheckCircle2 className="h-3 w-3 ml-0.5 text-emerald-200" />}
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
          <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100 space-y-4 my-8 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                <Search className="h-5 w-5 text-emerald-600" />
                <span>Tra Cứu Hồ Sơ Bệnh Nhân Đơn Thuốc & Kính (Kho 1.000+ Ca Khám)</span>
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
                className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-10 py-3 text-xs text-gray-900 font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
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
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
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
                        isSelected ? "bg-emerald-50/90 font-semibold" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xs ${
                          isSelected ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
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
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-emerald-800 font-bold">
                              Mẫu: {r.recordType}
                            </span>
                            <span>Mã hồ sơ: <code className="font-mono text-gray-700">{formatShortId(r.id)}</code></span>
                            <span>Ngày tạo: {new Date(r.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đang chọn
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 hover:underline">
                          Chọn xem ➔
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Patient Banner & Prescriptions Summary Stats */}
      {selectedRecord && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-100 bg-linear-to-r from-emerald-50/80 via-teal-50/60 to-indigo-50/50 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {selectedRecord.patientFullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-950">{selectedRecord.patientFullName}</p>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {t("recordCode")} <code className="font-mono text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-100" title={selectedRecord.id}>{formatShortId(selectedRecord.id)}</code> · {t("createdDate")} {new Date(selectedRecord.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="rounded-lg bg-white px-3 py-1.5 border border-emerald-200 shadow-2xs text-center">
                <span className="block text-[10px] text-gray-500 font-medium">{t("medicationCountLabel")}</span>
                <span className="text-xs font-bold text-emerald-700">{t("medicationCount", { count: medPrescriptionsCount, items: totalMedItems })}</span>
              </div>

              <div className="rounded-lg bg-white px-3 py-1.5 border border-indigo-200 shadow-2xs text-center">
                <span className="block text-[10px] text-gray-500 font-medium">{t("glassesCountLabel")}</span>
                <span className="text-xs font-bold text-indigo-700">{t("glassesCount", { count: glassesPrescriptionsCount })}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (All / Thuốc / Đơn kính) */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ClipboardList className="h-4 w-4" /> {t("tabAll", { count: medPrescriptionsCount + glassesPrescriptionsCount })}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("medications")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "medications"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Pill className="h-4 w-4" /> {t("tabMedications", { count: medPrescriptionsCount })}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("glasses")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "glasses"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Glasses className="h-4 w-4" /> {t("tabGlasses", { count: glassesPrescriptionsCount })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Prescription Content */}
      {loadingDetail ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="font-semibold text-gray-700">{t("loadingDetail")}</p>
        </div>
      ) : !selectedRecordId ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 space-y-2">
          <Pill className="mx-auto h-12 w-12 text-gray-300" />
          <p className="font-semibold text-sm text-gray-700">{t("pleaseSelectRecord")}</p>
        </div>
      ) : recordDetail ? (
        <div className="space-y-6">
          {/* SECTION 1: Đơn thuốc (Medication Prescriptions) */}
          {(activeTab === "all" || activeTab === "medications") && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-600" /> {t("medListTitle", { count: medPrescriptionsCount })}
                </h3>
              </div>

              {normalizedMedPrescriptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
                  {t("noMedPrescriptions")}
                </div>
              ) : (
                <div className="space-y-4">
                  {normalizedMedPrescriptions.map((rx, idx) => (
                    <div key={rx.id || idx} className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-emerald-50/70 px-4 py-3 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                            <Stethoscope className="h-3.5 w-3.5 text-emerald-700" /> {t("prescribedBy", { name: rx.doctorName || t("doctorDefault") })}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {t("prescribedDate")} {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : new Date().toLocaleDateString()} {rx.notes ? `· ${t("notes")} ${rx.notes}` : ""}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                          {t("medItemsCount", { count: rx.items?.length || 0 })}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-bold">{t("thStt")}</th>
                              <th className="px-4 py-2.5 text-left font-bold">{t("thMedicineName")}</th>
                              <th className="px-4 py-2.5 text-left font-bold">{t("thDosage")}</th>
                              <th className="px-4 py-2.5 text-left font-bold">{t("thFrequency")}</th>
                              <th className="px-4 py-2.5 text-center font-bold">{t("thQuantity")}</th>
                              <th className="px-4 py-2.5 text-left font-bold">{t("thInstruction")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {rx.items?.map((item: any, itemIdx: number) => (
                              <tr key={item.id || itemIdx} className="hover:bg-gray-50/50">
                                <td className="px-4 py-2.5 text-gray-400 font-mono text-[11px]">{itemIdx + 1}</td>
                                <td className="px-4 py-2.5 font-bold text-gray-900">{item.medicineName}</td>
                                <td className="px-4 py-2.5 text-gray-700 font-medium">{item.dosage}</td>
                                <td className="px-4 py-2.5 text-gray-700">{item.frequency || "—"}</td>
                                <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{item.quantity}</td>
                                <td className="px-4 py-2.5 text-gray-600 italic">{item.instruction || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Đơn kính (Glasses Prescriptions) */}
          {(activeTab === "all" || activeTab === "glasses") && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Glasses className="h-4 w-4 text-indigo-600" /> {t("glassesListTitle", { count: glassesPrescriptionsCount })}
                </h3>
              </div>

              {normalizedGlassesPrescriptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
                  {t("noGlassesPrescriptions")}
                </div>
              ) : (
                <div className="space-y-4">
                  {normalizedGlassesPrescriptions.map((rx, idx) => (
                    <div key={rx.id || idx} className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-indigo-50/70 px-4 py-3 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-indigo-950">
                            {t("measuredDate")} {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {rx.lensType ? `${t("lensType")} ${rx.lensType}` : ""} {rx.notes ? `· ${t("notes")} ${rx.notes}` : ""}
                          </p>
                        </div>
                        {rx.pd !== undefined && rx.pd !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs">
                            {t("pdLabel", { pd: rx.pd })}
                          </span>
                        )}
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* OD (Right Eye) */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                            <span className="font-bold text-blue-900 flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 text-blue-600" /> {t("eyeOD")}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center pt-1">
                            <div className="rounded-lg bg-white p-2 border border-blue-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("sph")}</span>
                              <span className="font-bold text-gray-900">{rx.sphOd ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-blue-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("cyl")}</span>
                              <span className="font-bold text-gray-900">{rx.cylOd ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-blue-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("axis")}</span>
                              <span className="font-bold text-gray-900">{rx.axisOd ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-blue-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("add")}</span>
                              <span className="font-bold text-gray-900">{rx.addOd ?? "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* OS (Left Eye) */}
                        <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                            <span className="font-bold text-purple-900 flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 text-purple-600" /> {t("eyeOS")}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center pt-1">
                            <div className="rounded-lg bg-white p-2 border border-purple-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("sph")}</span>
                              <span className="font-bold text-gray-900">{rx.sphOs ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-purple-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("cyl")}</span>
                              <span className="font-bold text-gray-900">{rx.cylOs ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-purple-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("axis")}</span>
                              <span className="font-bold text-gray-900">{rx.axisOs ?? "—"}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-purple-100">
                              <span className="block text-[10px] text-gray-500 font-medium">{t("add")}</span>
                              <span className="font-bold text-gray-900">{rx.addOs ?? "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Modal Kê / Sửa Đơn Kính & Thuốc */}
      {showCreateModal && selectedRecordId && (
        <CreatePrescriptionModal
          recordId={selectedRecordId}
          patientName={selectedRecord?.patientFullName}
          initialFormData={recordDetail?.formData}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchRecordDetail(selectedRecordId)
          }}
        />
      )}
    </div>
  )
}
