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
} from "lucide-react"

import paraclinicalService, {
  type LabType,
  type LabSide,
  type LabStatus,
  type LabResultSummary,
} from "@/services/paraclinical.service"
import aiSuggestionService, { type AiSuggestResponse } from "@/services/ai-suggestion.service"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

export interface OctClassDetails {
  title: string
  symptoms: string
  diagnosisSuggestion: string
  treatmentSuggestion: string
  severity: "high" | "medium" | "low" | "normal"
}

export type OctClassKey = "CNV" | "DME" | "DRUSEN" | "NORMAL"
export type OctSeverity = OctClassDetails["severity"]

/**
 * Build an OctClassDetails record from a translation function `t` rooted at
 * `doctor.paraclinical.octClass.*`. The `t` instance must be created via
 * `useTranslations("doctor.paraclinical")` so that the keys are relative.
 */
export function getOctClassMap(t: ParaclinicalTranslator): Record<OctClassKey, OctClassDetails> {
  const pick = (cls: OctClassKey, sev: OctSeverity): OctClassDetails => ({
    title: t(`octClass.title.${cls}`),
    symptoms: t(`octClass.symptoms.${cls}`),
    diagnosisSuggestion: t(`octClass.diagnosisSuggestion.${cls}`),
    treatmentSuggestion: t(`octClass.treatmentSuggestion.${cls}`),
    severity: sev,
  })
  return {
    CNV: pick("CNV", "high"),
    DME: pick("DME", "high"),
    DRUSEN: pick("DRUSEN", "medium"),
    NORMAL: pick("NORMAL", "normal"),
  }
}

export function getOctClassVietnamese(t: ParaclinicalTranslator): Record<OctClassKey, string> {
  return {
    CNV: t("octClass.shortLabel.CNV"),
    DME: t("octClass.shortLabel.DME"),
    DRUSEN: t("octClass.shortLabel.DRUSEN"),
    NORMAL: t("octClass.shortLabel.NORMAL"),
  }
}

export interface OctSeverityConfig {
  label: string
  gradient: string
  badge: string
  ring: string
  bar: string
  icon: string
}

export function getOctSeverityConfig(t: ParaclinicalTranslator): Record<OctSeverity, OctSeverityConfig> {
  return {
    high: {
      label: t("severity.high"),
      gradient: "from-rose-50 via-pink-50 to-red-50",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      ring: "ring-rose-300",
      bar: "bg-gradient-to-r from-rose-500 to-pink-600",
      icon: "text-rose-600",
    },
    medium: {
      label: t("severity.medium"),
      gradient: "from-amber-50 via-orange-50 to-yellow-50",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      ring: "ring-amber-300",
      bar: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: "text-amber-600",
    },
    low: {
      label: t("severity.low"),
      gradient: "from-sky-50 via-blue-50 to-cyan-50",
      badge: "bg-sky-100 text-sky-800 border-sky-300",
      ring: "ring-sky-300",
      bar: "bg-gradient-to-r from-sky-500 to-cyan-500",
      icon: "text-sky-600",
    },
    normal: {
      label: t("severity.normal"),
      gradient: "from-emerald-50 via-green-50 to-teal-50",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      ring: "ring-emerald-300",
      bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
      icon: "text-emerald-600",
    },
  }
}

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
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    VISUAL_FIELD: {
      label: t("labTypes.VISUAL_FIELD"),
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    ULTRASOUND: {
      label: t("labTypes.ULTRASOUND"),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    GENERAL_LAB: {
      label: t("labTypes.GENERAL_LAB"),
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
  }
}

export function getStatusConfig(t: ParaclinicalTranslator): Record<string, { label: string; badge: string }> {
  return {
    COMPLETED: { label: t("statusOptions.COMPLETED"), badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    IN_PROGRESS: { label: t("statusOptions.IN_PROGRESS"), badge: "bg-amber-100 text-amber-800 border-amber-200" },
    REQUESTED: { label: t("statusOptions.REQUESTED"), badge: "bg-blue-100 text-blue-800 border-blue-200" },
    CANCELLED: { label: t("statusOptions.CANCELLED"), badge: "bg-gray-100 text-gray-700 border-gray-200" },
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
  const [showAi, setShowAi] = useState(false)

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
    <div className="rounded-xl border border-indigo-200 bg-white shadow-xs overflow-hidden">
      {/* Header nút mở rộng/thu gọn */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-indigo-50/50 bg-linear-to-r from-indigo-50/60 to-white"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-indigo-950">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Microscope className="h-4 w-4" />
          </div>
          {t("panelTitle")}
          <span className="rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            {t("requestCount", { count: results.length })}
          </span>
        </span>
        <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
          {open ? t("collapse") : t("expand")}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-indigo-100 p-5 bg-slate-50/40">
          {/* Controls Bar: Filter, Search, Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[160px]">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LabType | "")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800 focus:border-indigo-500 focus:outline-none"
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
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchResultPlaceholder")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
                {loading ? t("panel.loading") : tCommon("refresh") || t("panel.refreshFallback")}
              </button>

              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> {t("panel.createNew")}
              </button>
            </div>
          </div>

          {/* Action toggle buttons: AI Analysis */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" /> {t("panel.listTitle")}
            </span>
            <button
              type="button"
              onClick={() => setShowAi((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs"
            >
              <Brain className="h-3.5 w-3.5 text-purple-200" /> {t("btnAiOct")}
              {showAi ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {showAi && (
            <AiSuggestionForm
              recordId={recordId}
              onCompleted={refresh}
              t={t}
            />
          )}

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
                    className="group relative rounded-xl border border-gray-200/90 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md flex flex-col justify-between"
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
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-700 rounded-md">
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
                            <Activity className="h-3.5 w-3.5 text-indigo-500" />
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
                          <div className="mt-2 rounded-lg bg-gray-50 p-2 text-[11px] text-gray-700 border border-gray-100">
                            <span className="font-semibold text-gray-900">{t("panel.conclusionPrefix")} </span>
                            <span className="line-clamp-2">{item.clinicalConclusion}</span>
                          </div>
                        )}

                        {item.imageUrl && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50/50 p-1.5 border border-blue-100">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-[11px] font-medium text-blue-700 truncate flex-1">{t("panel.hasImage")}</span>
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
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-50/80 via-white to-purple-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
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
              <FileText className="h-4 w-4 text-indigo-600" /> {t("detail.clinicalConclusionTitle")}
            </h4>
            <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 text-gray-800 leading-relaxed font-medium">
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
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
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

          <div>
            <label className={labelClass}>{t("update.imageUrlLabel")}</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

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

          <div>
            <label className={labelClass}>{t("update.measurementsLabel")}</label>
            <textarea
              rows={4}
              value={measurementsJson}
              onChange={(e) => setMeasurementsJson(e.target.value)}
              className={`${inputClass} font-mono text-[11px]`}
            />
          </div>

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
        <Plus className="h-4 w-4 text-indigo-600" /> {t("create.title")}
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
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("create.saveBtn")}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// AI SUGGESTION FORM (Retinal OCT AI Diagnosis)
// ─────────────────────────────────────────────────────────────────
function AiSuggestionForm({
  recordId,
  onCompleted,
  t,
}: {
  recordId: string
  onCompleted: () => void | Promise<void>
  t: ParaclinicalTranslator
}) {
  const formContext = useFormContext()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AiSuggestResponse | null>(null)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProbabilities, setShowProbabilities] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const OCT_CLASS_MAP = useMemo(() => getOctClassMap(t), [t])
  const OCT_SEVERITY_CONFIG = useMemo(() => getOctSeverityConfig(t), [t])
  const OCT_CLASS_VIETNAMESE = useMemo(() => getOctClassVietnamese(t), [t])

  function handleFileChange(f: File | null) {
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
    setResult(null)
    setApplied(false)
    setError(null)
  }

  function handlePickFile() {
    // Reset value so selecting the SAME file again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = ""
    fileInputRef.current?.click()
  }

  async function handleAnalyze() {
    if (!file) {
      setError(t("ai.errorNoFile"))
      return
    }
    if (!recordId) {
      setError(t("ai.errorNoRecordId"))
      return
    }
    setSubmitting(true)
    setError(null)
    setResult(null)
    setApplied(false)
    try {
      const resp = await aiSuggestionService.suggest({
        file,
        recordId,
        labResultId: undefined,
      })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? t("ai.errorAnalyzeFailed"))
        return
      }
      setResult(resp.data)
      try {
        await onCompleted()
      } catch (refreshErr) {
        // Refresh failure (e.g. 400 APP_MESSAGE_4028) is non-fatal for the
        // AI result itself — the prediction is already valid. We surface a
        // soft warning so the doctor knows the list will not be reloaded.
        console.warn("Refresh after AI suggestion failed:", refreshErr)
        setError(
          (prev) =>
            prev ??
            t("ai.errorRefreshAfterAi")
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ai.errorAiUnreachable"))
    } finally {
      setSubmitting(false)
    }
  }

  const clsKey = (result?.predictedClass || "") as string
  const details = (OCT_CLASS_MAP as Record<string, OctClassDetails | undefined>)[clsKey]

  function applyToMedicalRecord() {
    if (!details || !formContext) return
    const { setValue } = formContext

    setValue("chanDoanVaRaVien.chanDoanChinh", details.diagnosisSuggestion)
    setValue("chanDoanVaRaVien.huongDieuTri", details.treatmentSuggestion)

    const currentBenhSu = formContext.getValues("benhAn.benhSu")
    if (!currentBenhSu) {
      setValue("benhAn.benhSu", `${t("ai.symptomsAppliedPrefix")} ${details.symptoms}`)
    }

    setApplied(true)
  }

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <div className="p-1.5 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 text-white shadow-sm">
          <Brain className="h-4 w-4" />
        </div>
        <h4 className="text-xs font-bold text-purple-950">
          {t("ai.title")}
        </h4>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        {t.rich("ai.description", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
        {/* File picker + preview */}
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/30 px-3 py-2.5 hover:bg-purple-50/60 hover:border-purple-400 transition cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <div className="shrink-0 p-1.5 rounded-md bg-purple-100 text-purple-700">
                <Upload className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {file ? file.name : t("ai.chooseFile")}
                </p>
                <p className="text-[10px] text-gray-500">
                  {file
                    ? t("ai.fileSizeFormat", { kb: (file.size / 1024).toFixed(1), type: file.type || "image" })
                    : t("ai.fileTypesHint")}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/bmp"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              onClick={(e) => {
                // Clear value upfront so selecting the same file twice still
                // fires onChange. Otherwise the browser dedupes the event and
                // the user sees stale "result" state on the UI.
                ;(e.target as HTMLInputElement).value = ""
              }}
              className="hidden"
            />
            {file && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleFileChange(null)
                }}
                className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition"
                aria-label={t("ai.removeFile")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          {previewUrl && !result && (
            <div className="relative rounded-lg overflow-hidden border border-purple-200 bg-black/5 group animate-in fade-in slide-in-from-top-2 duration-300">
              <img
                src={previewUrl}
                alt="OCT preview"
                className="max-h-40 w-full object-contain mx-auto"
              />
              <div className="absolute top-2 left-2 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                <Eye className="h-2.5 w-2.5" /> {t("ai.previewBadge")}
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || submitting}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-purple-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg md:self-center md:min-w-[160px]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="flex flex-col items-start leading-tight">
                <span>{t("ai.submitting")}</span>
                <span className="text-[9px] font-medium opacity-80">{t("ai.submittingHint")}</span>
              </span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>{t("ai.submit")}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {submitting && (
        <div className="space-y-3 rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 p-5 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Brain className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-900">{t("ai.progressTitle")}</p>
              <p className="text-[10px] text-purple-700 mt-0.5">{t("ai.progressSubtitle")}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-purple-700 font-medium">
              <span>{t("ai.progressProcessing")}</span>
              <span>{t("ai.progressEta")}</span>
            </div>
          </div>
        </div>
      )}

      {result && details && (() => {
        const sev = OCT_SEVERITY_CONFIG[details.severity]
        const confidencePct = (result.confidence ?? 0) * 100
        const sortedProbs = result.allProbabilities
          ? Object.entries(result.allProbabilities).sort(([, a], [, b]) => b - a)
          : []
        return (
          <div className={`relative overflow-hidden rounded-2xl border-2 ${sev.ring} bg-linear-to-br ${sev.gradient} shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }} />
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            <div className="relative p-5 space-y-4">
              {/* Header: title + severity badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${sev.badge} shadow-sm`}>
                      {details.severity === "high" && <ShieldAlert className="h-4 w-4" />}
                      {details.severity === "medium" && <AlertTriangle className="h-4 w-4" />}
                      {details.severity === "low" && <Lightbulb className="h-4 w-4" />}
                      {details.severity === "normal" && <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sev.badge}`}>
                      {clsKey}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    {details.title}
                  </h3>
                  <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${sev.icon}`}>
                    {sev.label}
                  </p>
                </div>

                {/* Confidence ring */}
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200/60" />
                    <circle
                      cx="40" cy="40" r="32"
                      stroke={`url(#confGradient-${result.taskId})`}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(confidencePct / 100) * 201} 201`}
                      className={`${sev.icon} transition-all duration-1000 ease-out`}
                    />
                    <defs>
                      <linearGradient id={`confGradient-${result.taskId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={sev.icon.replace("text-", "stop-")} stopColor="currentColor" />
                        <stop offset="100%" className={sev.icon.replace("text-", "stop-")} stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-gray-900 leading-none">{confidencePct.toFixed(1)}%</span>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{t("ai.confidenceLabel")}</span>
                  </div>
                </div>
              </div>

              {/* Content cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="group rounded-xl bg-white/70 backdrop-blur p-3 shadow-xs border border-white/60 hover:shadow-sm hover:bg-white/90 transition">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded-md bg-orange-100 text-orange-600">
                      <Activity className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">{t("ai.cardSymptoms")}</p>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">{details.symptoms}</p>
                </div>

                <div className="group rounded-xl bg-white/70 backdrop-blur p-3 shadow-xs border border-white/60 hover:shadow-sm hover:bg-white/90 transition">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded-md bg-blue-100 text-blue-600">
                      <Stethoscope className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{t("ai.cardDiagnosis")}</p>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-900 leading-relaxed">{details.diagnosisSuggestion}</p>
                </div>

                <div className="group rounded-xl bg-white/70 backdrop-blur p-3 shadow-xs border border-white/60 hover:shadow-sm hover:bg-white/90 transition">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-600">
                      <Pill className="h-3 w-3" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t("ai.cardTreatment")}</p>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">{details.treatmentSuggestion}</p>
                </div>
              </div>

              {/* Probability bars */}
              {sortedProbs.length > 0 && (
                <div className="rounded-xl bg-white/80 backdrop-blur p-4 shadow-xs border border-white/60">
                  <button
                    type="button"
                    onClick={() => setShowProbabilities((v) => !v)}
                    className="flex items-center justify-between w-full text-left mb-2 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-indigo-100 text-indigo-600">
                        <BarChart3 className="h-3 w-3" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">{t("ai.probabilityTitle")}</p>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${showProbabilities ? "rotate-180" : ""}`} />
                  </button>

                  {showProbabilities && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      {sortedProbs.map(([cls, p], idx) => {
                        const pct = p * 100
                        const isTop = idx === 0
                        const labelKey = cls as OctClassKey
                        const clsLabel = OCT_CLASS_VIETNAMESE[labelKey] ?? cls
                        return (
                          <div key={cls} className="flex items-center gap-2.5">
                            <span className={`shrink-0 w-32 text-[11px] truncate ${isTop ? "font-bold text-gray-900" : "text-gray-600"}`}>
                              {clsLabel}
                            </span>
                            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${isTop ? sev.bar : "bg-gray-300"} ${isTop ? "shadow-sm" : ""}`}
                                style={{ width: `${Math.max(pct, 1)}%` }}
                              />
                              {isTop && pct > 25 && (
                                <div className="absolute inset-0 flex items-center pl-2">
                                  <span className="text-[9px] font-bold text-white drop-shadow">
                                    {t("ai.topRank", { rank: 1 })}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className={`shrink-0 w-12 text-right text-[11px] font-mono ${isTop ? "font-bold text-gray-900" : "text-gray-500"}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Footer: meta + apply */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/40">
                <div className="flex items-center gap-3 text-[10px] text-gray-600">
                  {result.processingTimeMs != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.processingTimeMs}ms</span>
                    </span>
                  )}
                  {result.modelVersion && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span className="font-mono">{result.modelVersion}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{t("ai.taskLabel", { id: result.taskId.slice(0, 8) })}</span>
                  </span>
                </div>

                {formContext && (
                  <button
                    type="button"
                    onClick={applyToMedicalRecord}
                    disabled={applied}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition shadow-sm ${
                      applied
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default"
                        : "bg-linear-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-md"
                    }`}
                  >
                    {applied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t("ai.appliedBtn")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> {t("ai.applyBtn")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}