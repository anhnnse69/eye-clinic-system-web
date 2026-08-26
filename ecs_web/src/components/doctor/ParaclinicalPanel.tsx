"use client"

/**
 * ParaclinicalPanel — List & Details of Paraclinical results & AI Diagnosis
 * (OCT, Visual Field, Ultrasound).
 *
 * Main features:
 *  1. List view of paraclinical requests rendered as visual cards.
 *  2. Detail modal with full image, clinical conclusion & measurements.
 *  3. Update modal for doctors / technicians to edit results.
 *  4. AI OCT analysis (4 classes: CNV, DME, DRUSEN, NORMAL).
 *  5. Create new paraclinical request slip.
 *
 * All user-facing strings are sourced from `doctor.paraclinical.*` via the
 * `useTranslations("doctor.paraclinical")` hook; date/time formatting is
 * driven by `useLocale()`.
 */
import { useState, useEffect, useRef, useMemo, type ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslations, useLocale } from "next-intl"
import {
  Loader2,
  Upload,
  Microscope,
  Eye,
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
  Edit3,
  Search,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Calendar,
  Clock,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Pill,
  Target,
  Award,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Settings,
} from "lucide-react"

import paraclinicalService, {
  type LabType,
  type LabSide,
  type LabStatus,
  type LabResultSummary,
} from "@/services/paraclinical.service"
import { uploadService } from "@/services/upload.service"

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-[#00658D] focus:outline-none focus:ring-1 focus:ring-[#00658D]"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

export interface LabTypeBadgeConfig {
  label: string
  bg: string
  text: string
  border: string
}

/**
 * Returns the badge styling config for each LabType. `t` must be rooted at
 * `doctor.paraclinical`.
 */
export function getLabTypeConfig(t: ParaclinicalTranslator): Record<string, LabTypeBadgeConfig> {
  return {
    OCT: {
      label: t("labTypes.OCT"),
      bg: "bg-[#00658D]/10",
      text: "text-[#00658D]",
      border: "border-[#00658D]/20",
    },
    VISUAL_FIELD: {
      label: t("labTypes.VISUAL_FIELD"),
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
    },
    ULTRASOUND: {
      label: t("labTypes.ULTRASOUND"),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200/80",
    },
    GENERAL_LAB: {
      label: t("labTypes.GENERAL_LAB"),
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200/80",
    },
  }
}

export function getStatusConfig(t: ParaclinicalTranslator): Record<string, { label: string; badge: string }> {
  return {
    COMPLETED: { label: t("statusOptions.COMPLETED"), badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
    IN_PROGRESS: { label: t("statusOptions.IN_PROGRESS"), badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
    REQUESTED: { label: t("statusOptions.REQUESTED"), badge: "bg-[#00658D]/10 text-[#00658D] border-[#00658D]/20" },
    CANCELLED: { label: t("statusOptions.CANCELLED"), badge: "bg-slate-100 text-slate-600 border-slate-200" },
  }
}

/**
 * Localized side labels keyed by `LabSide` (OD / OS / BOTH).
 * Accepts any string (or null/undefined) since the backend serializes side
 * as a plain string for LabResultSummary.
 */
export function getSideLabel(
  t: ParaclinicalTranslator,
  side: string | null | undefined
): string {
  if (side === "OD") return t("sides.OD")
  if (side === "OS") return t("sides.OS")
  if (side === "BOTH") return t("sides.BOTH")
  return t("sideBoth")
}

// ── Labeled mapping for eye measurement keys ─────────────────────
const GuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function getMeasurementLabels(t: ParaclinicalTranslator): Record<string, string> {
  return {
    rnflAverageOd: t("measurements.rnflAverageOd"),
    rnflAverageOs: t("measurements.rnflAverageOs"),
    cmtOd: t("measurements.cmtOd"),
    cmtOs: t("measurements.cmtOs"),
    cupDiscRatioOd: t("measurements.cupDiscRatioOd"),
    cupDiscRatioOs: t("measurements.cupDiscRatioOs"),
    mdValue: t("measurements.mdValue"),
    psdValue: t("measurements.psdValue"),
    vfiPercent: t("measurements.vfiPercent"),
    axialLengthOd: t("measurements.axialLengthOd"),
    axialLengthOs: t("measurements.axialLengthOs"),
    acdOd: t("measurements.acdOd"),
    acdOs: t("measurements.acdOs"),
    lensThickness: t("measurements.lensThickness"),
  }
}

interface ParaclinicalPanelProps {
  recordId: string
  initialResults?: LabResultSummary[]
  defaultOpen?: boolean
  /**
   * Khi false: panel vẫn render nhưng không gọi API list paraclinical,
   * không hiển thị banner lỗi. Dùng cho các trang create (chưa có recordId
   * thật) hoặc khi caller muốn ẩn phần danh sách + AI.
   */
  enabled?: boolean
}

export default function ParaclinicalPanel({
  recordId,
  initialResults = [],
  defaultOpen = true,
  enabled = true,
}: ParaclinicalPanelProps) {
  const tCommon = useTranslations("common")
  const t = useTranslations("doctor.paraclinical")
  const locale = useLocale()
  const [open, setOpen] = useState(defaultOpen)
  const [results, setResults] = useState<LabResultSummary[]>(initialResults)
  const [filterType, setFilterType] = useState<LabType | "">("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Selected item for Detail Modal & Update Modal
  const [selectedDetail, setSelectedDetail] = useState<LabResultSummary | null>(null)
  const [selectedUpdate, setSelectedUpdate] = useState<LabResultSummary | null>(null)

  const LAB_TYPES: { value: LabType; label: string }[] = [
    { value: "OCT", label: t("labTypes.OCT") },
    { value: "VISUAL_FIELD", label: t("labTypes.VISUAL_FIELD") },
    { value: "ULTRASOUND", label: t("labTypes.ULTRASOUND") },
    { value: "GENERAL_LAB", label: t("labTypes.GENERAL_LAB") },
  ]

  const LAB_TYPE_CONFIG = useMemo(() => getLabTypeConfig(t), [t])
  const STATUS_CONFIG = useMemo(() => getStatusConfig(t), [t])
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US"

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(dateLocale)
  }
  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString(dateLocale)
  }
  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })
  }

  async function refresh() {
    // Disabled panel (e.g. on the create page before a record exists) — do
    // not call the API and do not surface an error banner.
    if (!enabled) {
      setListError(null)
      setLoading(false)
      return
    }
    // The caller may be passing an appointmentId or another surrogate while
    // the actual MedicalRecord has not been created yet. Detect a non-Guid
    // or an empty value and silently skip — these are not real errors.
    if (!recordId || !GuidRegex.test(recordId)) {
      setListError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setListError(null)
    try {
      const resp = await paraclinicalService.list(
        recordId,
        filterType ? { labType: filterType } : undefined
      )
      if (resp?.codeMessage && resp.codeMessage !== "APP_MESSAGE_2000") {
        // APP_MESSAGE_4028 = recordId not found in SQL Server. This is
        // expected when the parent page has not yet created the record
        // (e.g. mid-flow of /doctor/records/create). Log quietly instead
        // of alarming the doctor.
        const isRecordMissing =
          resp.codeMessage === "APP_MESSAGE_4028" || resp.codeMessage === "APP_MESSAGE_4019"
        if (isRecordMissing) {
          console.warn(
            "[ParaclinicalPanel] Skipping — MedicalRecord not available yet:",
            resp.codeMessage
          )
          setListError(null)
        } else {
          setListError(t("errors.listLoadFailed", { code: resp.codeMessage }))
        }
      }
      if (resp?.data) setResults(resp.data.results ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      // Same soft handling for thrown errors that wrap 400/4019/4028.
      if (msg.includes("4028") || msg.includes("4019")) {
        console.warn("[ParaclinicalPanel] Skip — record not available:", msg)
        setListError(null)
      } else {
        setListError(
          err instanceof Error
            ? t("errors.loadFailed", { message: err.message })
            : t("errors.loadFailedGeneric")
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enabled && recordId) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, filterType, enabled])

  const filteredResults = results.filter((r) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      r.labType?.toLowerCase().includes(term) ||
      r.machineName?.toLowerCase().includes(term) ||
      r.clinicalConclusion?.toLowerCase().includes(term) ||
      r.scanPattern?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header nút mở rộng/thu gọn */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-slate-50 bg-white border-b border-slate-100"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-gray-900">
          <div className="p-1.5 rounded-lg bg-[#00658D]/10 text-[#00658D]">
            <Microscope className="h-4 w-4" />
          </div>
          {t("panelTitle")}
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            {t("requestCount", { count: results.length })}
          </span>
        </span>
        <span className="text-xs font-semibold text-[#00658D] flex items-center gap-1">
          {open ? t("collapse") : t("expand")}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-5 bg-slate-50/40">
          {/* Controls Bar: Filter, Search, Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[160px]">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LabType | "")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-[#00658D] focus:outline-none"
                >
                  <option value="">{t("filterAllTypes")}</option>
                  {LAB_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value}>
                      {lt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchResultPlaceholder")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#00658D] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                {loading ? t("panel.loading") : tCommon("refresh") || t("panel.refreshFallback")}
              </button>

              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00658D] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#005273] transition-all shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" /> {t("panel.createNew")}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#00658D]" /> {t("panel.listTitle")}
            </span>
          </div>

          {showCreate && (
            <CreateLabRequestForm
              recordId={recordId}
              onCreated={async () => {
                setShowCreate(false)
                await refresh()
              }}
              t={t}
            />
          )}

          {listError && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800">{listError}</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {(() => {
                    const codeStr = "APP_MESSAGE_4028"
                    const text = t("panel.errorHint", { code: codeStr })
                    const idx = text.indexOf(codeStr)
                    if (idx < 0) return text
                    return (
                      <>
                        {text.slice(0, idx)}
                        <code className="font-mono bg-amber-100 px-1 rounded">{codeStr}</code>
                        {text.slice(idx + codeStr.length)}
                      </>
                    )
                  })()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setListError(null)}
                className="shrink-0 rounded p-1 text-amber-500 hover:bg-amber-100 hover:text-amber-700 transition"
                aria-label={t("panel.dismissError")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── PARACLINICAL LIST VIEW ── */}
          {filteredResults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <Microscope className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-xs font-medium text-gray-600 mb-1">{t("panel.emptyTitle")}</p>
              <p className="text-[11px] text-gray-400">{t("panel.emptyHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredResults.map((item) => {
                const typeCfg = LAB_TYPE_CONFIG[item.labType] ?? {
                  label: item.labType,
                  bg: "bg-gray-50",
                  text: "text-gray-700",
                  border: "border-gray-200",
                }
                const statusCfg = STATUS_CONFIG[item.status] ?? {
                  label: item.status,
                  badge: "bg-gray-100 text-gray-700 border-gray-200",
                }

                return (
                  <div
                    key={item.labResultId}
                    className="group relative rounded-xl border border-slate-200/90 bg-white p-4 transition-all hover:border-[#00658D]/40 hover:shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                          >
                            {typeCfg.label}
                          </span>
                          {item.side && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                              {getSideLabel(t, item.side)}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Detail Info */}
                      <div className="space-y-1.5 text-xs">
                        {item.machineName && (
                          <p className="font-semibold text-gray-800 flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-[#00658D]" />
                            {item.machineName} {item.scanPattern ? `(${item.scanPattern})` : ""}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(item.requestedAt)}
                          </span>
                          {item.performedAt && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              {t("panel.completedAt", { time: formatTime(item.performedAt) })}
                            </span>
                          )}
                        </div>

                        {item.clinicalConclusion && (
                          <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] text-gray-700 border border-slate-100">
                            <span className="font-semibold text-gray-900">{t("panel.conclusionPrefix")} </span>
                            <span className="line-clamp-2">{item.clinicalConclusion}</span>
                          </div>
                        )}

                        {item.imageUrl && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#00658D]/5 p-1.5 border border-[#00658D]/20">
                            <ImageIcon className="h-4 w-4 text-[#00658D]" />
                            <span className="text-[11px] font-medium text-[#00658D] truncate flex-1">{t("panel.hasImage")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setSelectedUpdate(item)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" /> {t("btnUpdate")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDetail(item)}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-white bg-[#00658D] hover:bg-[#005273] transition-colors shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t("btnDetail")}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selectedDetail && (
        <ParaclinicalDetailModal
          item={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onUpdateRequested={() => {
            const itemToUpdate = selectedDetail
            setSelectedDetail(null)
            setSelectedUpdate(itemToUpdate)
          }}
          t={t}
          formatDateTime={formatDateTime}
        />
      )}

      {/* ── UPDATE MODAL ── */}
      {selectedUpdate && (
        <UpdateLabResultModal
          item={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
          onUpdated={async () => {
            setSelectedUpdate(null)
            await refresh()
          }}
          t={t}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// DETAIL MODAL COMPONENT (Paraclinical detail view)
// ─────────────────────────────────────────────────────────────────
export type ParaclinicalTranslator = ReturnType<typeof useTranslations>

function ParaclinicalDetailModal({
  item,
  onClose,
  onUpdateRequested,
  t,
  formatDateTime,
}: {
  item: LabResultSummary
  onClose: () => void
  onUpdateRequested: () => void
  t: ParaclinicalTranslator
  formatDateTime: (iso: string) => string
}) {
  const LAB_TYPE_CONFIG = useMemo(() => getLabTypeConfig(t), [t])
  const STATUS_CONFIG = useMemo(() => getStatusConfig(t), [t])
  const MEASUREMENT_LABELS = useMemo(() => getMeasurementLabels(t), [t])
  const typeCfg = LAB_TYPE_CONFIG[item.labType] ?? {
    label: item.labType,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  }
  const statusCfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    badge: "bg-gray-100 text-gray-700 border-gray-200",
  }

  // Parse measurements object
  const measurementsObj =
    item.measurements && typeof item.measurements === "object"
      ? (item.measurements as Record<string, unknown>)
      : {}

  const measurementEntries = Object.entries(measurementsObj)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-sky-50/80 via-white to-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-[#00658D]">
              <Microscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">{typeCfg.label}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                  {getSideLabel(t, item.side)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{t("detail.labCode")} {item.labResultId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.badge}`}>
              {statusCfg.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* General Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium">{t("detail.machineLabel")}</p>
              <p className="font-semibold text-gray-800">{item.machineName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{t("detail.scanPatternLabel")}</p>
              <p className="font-semibold text-gray-800">{item.scanPattern || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{t("detail.requestedAtLabel")}</p>
              <p className="font-semibold text-gray-800">
                {formatDateTime(item.requestedAt)}
              </p>
            </div>
            {item.performedAt && (
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("detail.performedAtLabel")}</p>
                <p className="font-semibold text-emerald-700">
                  {formatDateTime(item.performedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Clinical Conclusion Box */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#00658D]" /> {t("detail.clinicalConclusionTitle")}
            </h4>
            <div className="rounded-xl bg-sky-50/60 p-4 border border-sky-100 text-gray-800 leading-relaxed font-medium">
              {item.clinicalConclusion ? item.clinicalConclusion : <span className="text-gray-400 italic">{t("detail.clinicalConclusionEmpty")}</span>}
            </div>
          </div>

          {/* Image Preview */}
          {item.imageUrl && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-blue-600" /> {t("detail.imageTitle")}
              </h4>
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 group">
                <img
                  src={item.imageUrl}
                  alt={t("detail.imageAlt")}
                  className="max-h-80 w-full object-contain mx-auto"
                />
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {t("detail.openImageFull")}
                </a>
              </div>
            </div>
          )}

          {/* Measurements Grid */}
          {measurementEntries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-600" /> {t("detail.measurementsTitle")}
              </h4>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5">{t("detail.thMeasurement")}</th>
                      <th className="px-4 py-2.5">{t("detail.thValue")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {measurementEntries.map(([key, val]) => (
                      <tr key={key} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-700">
                          {MEASUREMENT_LABELS[key] ?? key}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-indigo-950 font-mono">
                          {val != null ? String(val) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onUpdateRequested}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" /> {t("detail.updateBtn")}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors shadow-2xs"
          >
            {t("detail.closeBtn")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PARACLINICAL IMAGE UPLOADER COMPONENT (Upload image to backend & convert to URL)
// ─────────────────────────────────────────────────────────────────
function ParaclinicalImageUploader({
  imageUrl,
  setImageUrl,
  label = "Hình ảnh kết quả cận lâm sàng (OCT, Thị trường, Siêu âm...)",
}: {
  imageUrl: string
  setImageUrl: (url: string) => void
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processUpload(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await processUpload(file)
  }

  const processUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG, WebP...)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Kích thước tệp quá lớn (tối đa 10MB)")
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const response = await uploadService.uploadImage(file)
      if (response.data?.url) {
        setImageUrl(response.data.url)
      } else {
        setUploadError("Không thể lấy URL hình ảnh sau khi tải lên.")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setUploadError("Lỗi kết nối khi tải ảnh lên server API. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700">{label}</label>

      {imageUrl ? (
        <div className="relative rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-black/5 shadow-xs group">
            <img src={imageUrl} alt="Kết quả cận lâm sàng" className="h-full w-full object-cover" />
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1"
            >
              Xem ảnh <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> Đã tải lên CSDL thành công
              </span>
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Gỡ ảnh
              </button>
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] font-mono text-gray-800 focus:border-indigo-500 focus:outline-none"
              title="URL hình ảnh"
            />
            <p className="text-[11px] text-gray-500">
              Hệ thống đã tự động convert ảnh sang URL. Bạn có thể nhấn "Gỡ ảnh" để chọn tệp mới.
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer rounded-xl border-2 border-dashed border-indigo-300 bg-linear-to-b from-indigo-50/50 via-purple-50/30 to-white p-5 text-center transition-all hover:border-indigo-600 hover:bg-indigo-50/90 shadow-2xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 text-xs font-semibold text-indigo-700 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span>Đang tải tệp ảnh lên CSDL và tự động convert sang URL...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-indigo-950">
                Bấm vào đây để chọn tệp ảnh hoặc Kéo & Thả ảnh kết quả vào đây
              </p>
              <p className="text-[11px] text-gray-500">
                Tự động sử dụng API Upload Backend để chuyển đổi ảnh chụp (OCT, Thị trường, SA...) thành đường dẫn URL an toàn.
              </p>
            </div>
          )}
        </div>
      )}

      {uploadError && <p className="text-xs font-semibold text-red-600 mt-1">{uploadError}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PARACLINICAL MEASUREMENTS BUILDER (Medical Non-Tech Key-Value Table)
// ─────────────────────────────────────────────────────────────────
interface MeasurementPair {
  id: string
  key: string
  value: string
}

function ParaclinicalMeasurementsBuilder({
  initialJson,
  onChangeJson,
  labType = "OCT",
}: {
  initialJson: string
  onChangeJson: (jsonStr: string) => void
  labType?: LabType
}) {
  const [pairs, setPairs] = useState<MeasurementPair[]>(() => {
    try {
      const obj = initialJson.trim() ? JSON.parse(initialJson) : {}
      if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
        const entries = Object.entries(obj)
        if (entries.length > 0) {
          return entries.map(([k, v], idx) => ({
            id: `init-${idx}`,
            key: k,
            value: String(v ?? ""),
          }))
        }
      }
    } catch {
      // ignore
    }
    return [
      { id: "1", key: "Độ dày trung tâm hoàng điểm (CFT)", value: "250 µm" },
      { id: "2", key: "Thể tích võng mạc (Macular Volume)", value: "8.5 mm³" },
    ]
  })

  const [rawMode, setRawMode] = useState(false)
  const [rawText, setRawText] = useState(initialJson)

  const updateJsonFromPairs = (currentPairs: MeasurementPair[]) => {
    const obj: Record<string, string> = {}
    currentPairs.forEach((p) => {
      if (p.key.trim()) {
        obj[p.key.trim()] = p.value
      }
    })
    const jsonStr = JSON.stringify(obj, null, 2)
    setRawText(jsonStr)
    onChangeJson(jsonStr)
  }

  const handlePairChange = (id: string, field: "key" | "value", val: string) => {
    const updated = pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    setPairs(updated)
    updateJsonFromPairs(updated)
  }

  const handleAddPair = () => {
    const newPair = { id: String(Date.now()), key: "", value: "" }
    const updated = [...pairs, newPair]
    setPairs(updated)
    updateJsonFromPairs(updated)
  }

  const handleRemovePair = (id: string) => {
    const updated = pairs.filter((p) => p.id !== id)
    setPairs(updated)
    updateJsonFromPairs(updated)
  }

  const applyPreset = (presetType: "OCT" | "VISUAL_FIELD" | "ULTRASOUND" | "IOP") => {
    let presetPairs: MeasurementPair[] = []
    if (presetType === "OCT") {
      presetPairs = [
        { id: "1", key: "Độ dày trung tâm hoàng điểm (CFT)", value: "250 µm" },
        { id: "2", key: "Thể tích võng mạc (Macular Volume)", value: "8.5 mm³" },
        { id: "3", key: "Độ dày lớp RNFL", value: "98 µm" },
      ]
    } else if (presetType === "VISUAL_FIELD") {
      presetPairs = [
        { id: "1", key: "Chỉ số độ lệch trung bình (MD)", value: "-2.5 dB" },
        { id: "2", key: "Độ lệch chuẩn mẫu (PSD)", value: "1.8 dB" },
        { id: "3", key: "Chỉ số thị trường (VFI)", value: "96%" },
      ]
    } else if (presetType === "ULTRASOUND") {
      presetPairs = [
        { id: "1", key: "Trục nhãn cầu (Axial Length)", value: "23.5 mm" },
        { id: "2", key: "Độ sâu tiền phòng (ACD)", value: "3.2 mm" },
        { id: "3", key: "Độ dày thể thủy tinh (Lens Thickness)", value: "4.1 mm" },
      ]
    } else {
      presetPairs = [
        { id: "1", key: "Nhãn áp Mắt Phải (IOP OD)", value: "16 mmHg" },
        { id: "2", key: "Nhãn áp Mắt Trái (IOP OS)", value: "15 mmHg" },
      ]
    }
    setPairs(presetPairs)
    updateJsonFromPairs(presetPairs)
  }

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
        <div>
          <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-600" /> Bảng Chỉ Số & Thông Số Đo Đạc Y Tế
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Nhập trực tiếp các chỉ số kỹ thuật (Độ dày hoàng điểm, Nhãn áp...) không cần dùng mã JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRawMode(!rawMode)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline self-start sm:self-auto cursor-pointer"
        >
          {rawMode ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>Chuyển sang Bảng nhập bác sĩ</span>
            </>
          ) : (
            <>
              <Settings className="w-3.5 h-3.5" />
              <span>Chế độ nâng cao (JSON)</span>
            </>
          )}
        </button>
      </div>

      {!rawMode ? (
        <div className="space-y-2.5">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-gray-500 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Mẫu chỉ số nhanh:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("OCT")}
              className="rounded-md bg-white px-2.5 py-1 font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-2xs"
            >
              OCT Võng Mạc
            </button>
            <button
              type="button"
              onClick={() => applyPreset("VISUAL_FIELD")}
              className="rounded-md bg-white px-2.5 py-1 font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-2xs"
            >
              Đo Thị Trường
            </button>
            <button
              type="button"
              onClick={() => applyPreset("ULTRASOUND")}
              className="rounded-md bg-white px-2.5 py-1 font-semibold text-teal-700 border border-teal-200 hover:bg-teal-50 shadow-2xs"
            >
              Siêu Âm Mắt
            </button>
            <button
              type="button"
              onClick={() => applyPreset("IOP")}
              className="rounded-md bg-white px-2.5 py-1 font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-2xs"
            >
              Nhãn Áp (IOP)
            </button>
          </div>

          {/* Key-Value Pair Grid */}
          <div className="space-y-2">
            {pairs.map((p, index) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 w-4 text-center">{index + 1}.</span>
                <input
                  type="text"
                  value={p.key}
                  onChange={(e) => handlePairChange(p.id, "key", e.target.value)}
                  placeholder="Tên chỉ số (VD: Độ dày CFT, Nhãn áp...)"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none shadow-2xs"
                />
                <input
                  type="text"
                  value={p.value}
                  onChange={(e) => handlePairChange(p.id, "value", e.target.value)}
                  placeholder="Giá trị (VD: 250 µm, 16 mmHg...)"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePair(p.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Xóa chỉ số này"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPair}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm chỉ số đo đạc mới
          </button>
        </div>
      ) : (
        <div>
          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value)
              onChangeJson(e.target.value)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-[11px] text-gray-900 focus:border-indigo-500 focus:outline-none"
            placeholder='{ "centralFovealThickness": "250 µm" }'
          />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// UPDATE LAB RESULT MODAL (Edit paraclinical result)
// ─────────────────────────────────────────────────────────────────
function UpdateLabResultModal({
  item,
  onClose,
  onUpdated,
  t,
}: {
  item: LabResultSummary
  onClose: () => void
  onUpdated: () => void
  t: ParaclinicalTranslator
}) {
  const STATUS_OPTIONS = useMemo(() => getStatusConfig(t), [t])
  const [status, setStatus] = useState<LabStatus>((item.status as LabStatus) || "COMPLETED")
  const [clinicalConclusion, setClinicalConclusion] = useState(item.clinicalConclusion || "")
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "")
  const [machineName, setMachineName] = useState(item.machineName || "")
  const [scanPattern, setScanPattern] = useState(item.scanPattern || "")
  const [measurementsJson, setMeasurementsJson] = useState(
    item.measurements ? JSON.stringify(item.measurements, null, 2) : "{}"
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSubmitting(true)
    setError(null)

    let parsedMeasurements: Record<string, unknown> = {}
    try {
      if (measurementsJson.trim()) {
        parsedMeasurements = JSON.parse(measurementsJson)
      }
    } catch {
      setError(t("errors.updateMeasurementsInvalidJson"))
      setSubmitting(false)
      return
    }

    try {
      const resp = await paraclinicalService.update({
        labResultId: item.labResultId,
        status,
        clinicalConclusion: clinicalConclusion || undefined,
        imageUrl: imageUrl || undefined,
        machineName: machineName || undefined,
        scanPattern: scanPattern || undefined,
        measurements: parsedMeasurements,
      })

      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? t("errors.updateSaveFailed"))
        return
      }

      onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.updateSystemError"))
    } finally {
      setSubmitting(false)
    }
  }

  const statusKeys: LabStatus[] = ["COMPLETED", "IN_PROGRESS", "REQUESTED", "CANCELLED"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between border-b border-gray-100 bg-amber-50/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-amber-700" />
            <h3 className="text-base font-bold text-amber-950">
              {t("update.titleWithType", { type: item.labType })}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className={labelClass}>{t("update.statusLabel")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LabStatus)}
              className={inputClass}
            >
              {statusKeys.map((key) => (
                <option key={key} value={key}>
                  {STATUS_OPTIONS[key]?.label ?? key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t("update.conclusionLabel")}</label>
            <textarea
              rows={3}
              value={clinicalConclusion}
              onChange={(e) => setClinicalConclusion(e.target.value)}
              className={inputClass}
              placeholder={t("update.conclusionPlaceholder")}
            />
          </div>

          <ParaclinicalImageUploader
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            label={t("update.imageUrlLabel")}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("update.machineLabel")}</label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("update.scanPatternLabel")}</label>
              <input
                type="text"
                value={scanPattern}
                onChange={(e) => setScanPattern(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <ParaclinicalMeasurementsBuilder
            initialJson={measurementsJson}
            onChangeJson={setMeasurementsJson}
          />

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("update.cancelBtn")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// CREATE LAB REQUEST FORM (Create new paraclinical request)
// ─────────────────────────────────────────────────────────────────
export function CreateLabRequestForm({
  recordId,
  onCreated,
  t,
}: {
  recordId: string
  onCreated: () => void
  t: ParaclinicalTranslator
}) {
  const [labType, setLabType] = useState<LabType>("OCT")
  const [side, setSide] = useState<LabSide>("BOTH")
  const [indication, setIndication] = useState("")
  const [machineName, setMachineName] = useState("")
  const [scanPattern, setScanPattern] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [clinicalConclusion, setClinicalConclusion] = useState("")
  const [measurements, setMeasurements] = useState("{}")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const LAB_TYPE_OPTIONS: { value: LabType; label: string }[] = [
    { value: "OCT", label: t("labTypes.OCT") },
    { value: "VISUAL_FIELD", label: t("labTypes.VISUAL_FIELD") },
    { value: "ULTRASOUND", label: t("labTypes.ULTRASOUND") },
    { value: "GENERAL_LAB", label: t("labTypes.GENERAL_LAB") },
  ]

  const SIDE_OPTIONS: { value: LabSide; label: string }[] = [
    { value: "OD", label: t("sides.OD") },
    { value: "OS", label: t("sides.OS") },
    { value: "BOTH", label: t("sides.BOTH") },
  ]

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    let parsedMeasurements: Record<string, unknown> = {}
    try {
      parsedMeasurements = measurements.trim() ? JSON.parse(measurements) : {}
    } catch {
      setError(t("errors.createMeasurementsInvalidJson"))
      setSubmitting(false)
      return
    }

    try {
      const resp = await paraclinicalService.create({
        recordId,
        labType,
        side,
        indication: indication || undefined,
        machineName: machineName || undefined,
        scanPattern: scanPattern || undefined,
        imageUrl: imageUrl || undefined,
        clinicalConclusion: clinicalConclusion || undefined,
        measurements: parsedMeasurements,
      })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? t("errors.createSaveFailed"))
        return
      }
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.createGenericError"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <Plus className="h-4 w-4 text-[#00658D]" /> {t("create.title")}
      </h4>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{t("create.labTypeLabel")}</label>
          <select
            value={labType}
            onChange={(e) => setLabType(e.target.value as LabType)}
            className={inputClass}
          >
            {LAB_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("create.sideLabel")}</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as LabSide)}
            className={inputClass}
          >
            {SIDE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("create.indicationLabel")}</label>
          <input
            type="text"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            className={inputClass}
            placeholder={t("create.indicationPlaceholder")}
          />
        </div>

        <div>
          <label className={labelClass}>{t("create.machineLabel")}</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className={inputClass}
            placeholder={t("create.machinePlaceholder")}
          />
        </div>

        <div>
          <label className={labelClass}>{t("create.scanPatternLabel")}</label>
          <input
            type="text"
            value={scanPattern}
            onChange={(e) => setScanPattern(e.target.value)}
            className={inputClass}
            placeholder={t("create.scanPatternPlaceholder")}
          />
        </div>

        <div className="sm:col-span-2">
          <ParaclinicalImageUploader
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            label="Tải ảnh kết quả cận lâm sàng (Tự động chuyển đổi sang URL):"
          />
        </div>

        <div className="sm:col-span-2">
          <ParaclinicalMeasurementsBuilder
            initialJson={measurements}
            onChangeJson={setMeasurements}
            labType={labType}
          />
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-[#00658D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005273] disabled:opacity-50 transition-colors shadow-2xs"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("create.saveBtn")}
        </button>
      </div>
    </div>
  )
}