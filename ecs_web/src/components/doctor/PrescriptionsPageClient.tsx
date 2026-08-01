"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"
import { useTranslations } from "next-intl"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordsItem, GetMedicalRecordDetailResponse } from "@/types"

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
  const [activeTab, setActiveTab] = useState<"medications" | "glasses" | "all">("all")
  const [recordDetail, setRecordDetail] = useState<GetMedicalRecordDetailResponse | null>(null)

  // 1. Load list of medical records
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
  }, [])

  // 2. Load detail of selected medical record
  useEffect(() => {
    if (!selectedRecordId) {
      setRecordDetail(null)
      return
    }

    let isMounted = true
    setLoadingDetail(true)
    medicalRecordsService
      .getMedicalRecordById(selectedRecordId)
      .then((res) => {
        if (isMounted && res.data) {
          setRecordDetail(res.data)
        }
      })
      .catch((err) => {
        console.error("Error loading medical record detail for prescription view:", err)
      })
      .finally(() => {
        if (isMounted) setLoadingDetail(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedRecordId])

  const selectedRecord = records.find((r) => r.id === selectedRecordId)

  // Calculate prescription metrics
  const medPrescriptionsCount = recordDetail?.prescriptions?.length || 0
  const glassesPrescriptionsCount = recordDetail?.glassesPrescriptions?.length || 0
  const totalMedItems = recordDetail?.prescriptions?.reduce((acc, p) => acc + (p.items?.length || 0), 0) || 0

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Page Title Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-800 via-teal-800 to-indigo-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs">
              <Pill className="h-4 w-4 text-emerald-300" /> {t("eyecareBadge")}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("pageTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              {t("pageDescription")}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {selectedRecordId && (
              <Link
                href={`/doctor/records/${selectedRecordId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/25 active:scale-95"
              >
                <ExternalLink className="h-4 w-4" /> {t("viewOriginalRecord")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Patient / Medical Record Selector Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" /> {t("selectPatientTitle")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("selectPatientSubtitle")}
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
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-xs text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Records Selector Dropdown & Quick Chips */}
        {loadingRecords ? (
          <div className="flex items-center justify-center py-6 text-xs text-gray-500 gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> {t("loadingRecords")}
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
            {t("noRecordsFound")}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  {t("recordsListLabel", { count: records.length })}
                </label>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.patientFullName} — {r.recordType?.replace("MS", t("samplePrefix")) || t("medicalRecordDefault")} ({new Date(r.createdAt).toLocaleDateString()}) {r.patientPhone ? `· ${t("phoneShort")} ${r.patientPhone}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Record Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-gray-500 mr-1">{t("recentPatients")}</span>
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
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
        )}
      </div>

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

              {!recordDetail.prescriptions || recordDetail.prescriptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
                  {t("noMedPrescriptions")}
                </div>
              ) : (
                <div className="space-y-4">
                  {recordDetail.prescriptions.map((rx, idx) => (
                    <div key={rx.id || idx} className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-emerald-50/70 px-4 py-3 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                            <Stethoscope className="h-3.5 w-3.5 text-emerald-700" /> {t("prescribedBy", { name: rx.doctorName || t("doctorDefault") })}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {t("prescribedDate")} {new Date(rx.createdAt).toLocaleDateString()} {rx.notes ? `· ${t("notes")} ${rx.notes}` : ""}
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
                            {rx.items?.map((item, itemIdx) => (
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

              {!recordDetail.glassesPrescriptions || recordDetail.glassesPrescriptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
                  {t("noGlassesPrescriptions")}
                </div>
              ) : (
                <div className="space-y-4">
                  {recordDetail.glassesPrescriptions.map((rx, idx) => (
                    <div key={rx.id || idx} className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                      <div className="bg-indigo-50/70 px-4 py-3 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-indigo-950">
                            {t("measuredDate")} {new Date(rx.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {rx.lensType ? `${t("lensType")} ${rx.lensType}` : ""} {rx.notes ? `· ${t("notes")} ${rx.notes}` : ""}
                          </p>
                        </div>
                        {rx.pd !== undefined && (
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
    </div>
  )
}
