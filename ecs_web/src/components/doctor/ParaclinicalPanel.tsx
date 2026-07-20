"use client"

/**
 * ParaclinicalPanel — tabbed UI for OCT / Visual Field / Ultrasound + AI suggestion.
 *
 * Mounted inside MedicalRecord create/edit pages so the doctor can:
 *  - List existing paraclinical requests for this record
 *  - Create a new OCT / VisualField / Ultrasound request with measurements
 *  - Upload an OCT image to get an AI prediction (CNV / DME / DRUSEN / NORMAL)
 */
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  Loader2,
  Upload,
  Microscope,
  Eye,
  Activity,
  Brain,
  ChevronDown,
  ChevronUp
} from "lucide-react"

import paraclinicalService, { type LabType, type LabSide, type LabResultSummary } from "@/services/paraclinical.service"
import aiSuggestionService, { type AiSuggestResponse } from "@/services/ai-suggestion.service"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

interface ParaclinicalPanelProps {
  recordId: string
  /** Optional list seeded by the parent component. */
  initialResults?: LabResultSummary[]
}

export default function ParaclinicalPanel({ recordId, initialResults = [] }: ParaclinicalPanelProps) {
  const t = useTranslations("doctor.paraclinical")
  const tCommon = useTranslations("common")
  const [results, setResults] = useState<LabResultSummary[]>(initialResults)
  const [filter, setFilter] = useState<LabType | "">("")
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showAi, setShowAi] = useState(false)

  const LAB_TYPES: { value: LabType; label: string }[] = [
    { value: "OCT", label: t("labTypes.OCT") },
    { value: "VISUAL_FIELD", label: t("labTypes.VISUAL_FIELD") },
    { value: "ULTRASOUND", label: t("labTypes.ULTRASOUND") },
    { value: "GENERAL_LAB", label: t("labTypes.GENERAL_LAB") }
  ]

  const SIDES: { value: LabSide; label: string }[] = [
    { value: "OD", label: t("sides.OD") },
    { value: "OS", label: t("sides.OS") },
    { value: "BOTH", label: t("sides.BOTH") }
  ]

  async function refresh() {
    setLoading(true)
    try {
      const resp = await paraclinicalService.list(recordId, filter ? { labType: filter } : undefined)
      if (resp?.data) setResults(resp.data.results)
    } catch {
      /* swallow; panel degrades silently */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-indigo-900">{t("title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LabType | "")}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="">{t("filterAll")}</option>
            {LAB_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>{lt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : tCommon("refresh")}
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-xs text-gray-500">{t("noResults")}</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-100 bg-white">
          {results.map((r) => (
            <li key={r.labResultId} className="flex items-start gap-3 px-3 py-2 text-xs">
              <span className="rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
                {r.labType}
              </span>
              {r.side && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">{r.side}</span>
              )}
              <span className="text-gray-600">{r.status}</span>
              {r.machineName && <span className="text-gray-500">· {r.machineName}</span>}
              <span className="ml-auto text-gray-400">{new Date(r.requestedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          <Activity className="h-3 w-3" /> {t("newRequest")}
          {showCreate ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => setShowAi((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md border border-indigo-300 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
        >
          <Brain className="h-3 w-3" /> {t("aiSuggestion")}
          {showAi ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {showCreate && (
        <CreateLabRequestForm
          recordId={recordId}
          onCreated={async () => {
            setShowCreate(false)
            await refresh()
          }}
        />
      )}
      {showAi && (
        <AiSuggestionForm
          recordId={recordId}
          onCompleted={() => {
            /* keep panel open */
          }}
        />
      )}
    </div>
  )
}

// =========================================================
// Sub-form: Create new lab request
// =========================================================
function CreateLabRequestForm({
  recordId,
  onCreated
}: {
  recordId: string
  onCreated: () => void | Promise<void>
}) {
  const t = useTranslations("doctor.paraclinical")
  const tCommon = useTranslations("common")
  const [labType, setLabType] = useState<LabType>("OCT")
  const [side, setSide] = useState<LabSide>("OD")
  const [indication, setIndication] = useState("")
  const [machineName, setMachineName] = useState("")
  const [scanPattern, setScanPattern] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [clinicalConclusion, setClinicalConclusion] = useState("")
  const [measurements, setMeasurements] = useState("{}")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const LAB_TYPES: { value: LabType; label: string }[] = [
    { value: "OCT", label: t("labTypes.OCT") },
    { value: "VISUAL_FIELD", label: t("labTypes.VISUAL_FIELD") },
    { value: "ULTRASOUND", label: t("labTypes.ULTRASOUND") },
    { value: "GENERAL_LAB", label: t("labTypes.GENERAL_LAB") }
  ]

  const SIDES: { value: LabSide; label: string }[] = [
    { value: "OD", label: t("sides.OD") },
    { value: "OS", label: t("sides.OS") },
    { value: "BOTH", label: t("sides.BOTH") }
  ]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    let parsedMeasurements: Record<string, unknown> = {}
    try {
      parsedMeasurements = measurements.trim() ? JSON.parse(measurements) : {}
    } catch {
      setError("Measurements must be valid JSON")
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
        measurements: parsedMeasurements
      })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? tCommon("error"))
        setSubmitting(false)
        return
      }
      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className={labelClass}>Type</label>
          <select value={labType} onChange={(e) => setLabType(e.target.value as LabType)} className={inputClass}>
            {LAB_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>{lt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Eye side</label>
          <select value={side} onChange={(e) => setSide(e.target.value as LabSide)} className={inputClass}>
            {SIDES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Indication (ICD-10 / description)</label>
          <input value={indication} onChange={(e) => setIndication(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Machine name</label>
          <input value={machineName} onChange={(e) => setMachineName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Scan pattern</label>
          <input value={scanPattern} onChange={(e) => setScanPattern(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Image URL (optional)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Measurements (JSON — e.g. rnflAverageOd, cmtOd, axialLengthMm…)</label>
          <textarea
            value={measurements}
            onChange={(e) => setMeasurements(e.target.value)}
            className={`${inputClass} font-mono`}
            rows={3}
          />
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Clinical conclusion</label>
          <textarea
            value={clinicalConclusion}
            onChange={(e) => setClinicalConclusion(e.target.value)}
            className={inputClass}
            rows={2}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
          {submitting ? "..." : t("newRequest")}
        </button>
      </div>
    </form>
  )
}

// =========================================================
// Sub-form: AI suggestion (OCT image upload)
// =========================================================
function AiSuggestionForm({
  recordId,
  onCompleted
}: {
  recordId: string
  onCompleted: () => void
}) {
  const t = useTranslations("doctor.paraclinical")
  const tCommon = useTranslations("common")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AiSuggestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const resp = await aiSuggestionService.suggest({ file, recordId })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? t("aiFailed"))
        return
      }
      setResult(resp.data)
      onCompleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-indigo-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-indigo-600" />
        <p className="text-xs text-gray-700">
          Upload OCT image (JPEG / PNG / BMP, ≤10MB). AI service will classify:{" "}
          <strong>CNV / DME / DRUSEN / NORMAL</strong>.
        </p>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/bmp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="rounded-md border border-indigo-100 bg-indigo-50/50 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3 text-indigo-600" />
            <strong className="text-indigo-800">
              {result.predictedClass
                ? t(`classes.${result.predictedClass}` as any) || result.predictedClass
                : "N/A"}
            </strong>
            <span className="text-gray-500">
              ({(result.confidence ?? 0) * 100 | 0}% {t("aiConfidence")})
            </span>
            <span className="ml-auto text-gray-400">{result.modelVersion}</span>
          </div>
          {result.allProbabilities && (
            <ul className="mt-2 space-y-0.5">
              {Object.entries(result.allProbabilities).map(([cls, p]) => (
                <li key={cls} className="flex items-center justify-between">
                  <span>{t(`classes.${cls}` as any) || cls}</span>
                  <span className="font-mono">{(p * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[10px] text-gray-500">
            Task {result.taskId} · {result.processingTimeMs ?? "?"}ms
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!file || submitting}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Đang gửi tới AI service…
            </>
          ) : (
            <>
              <Upload className="h-3 w-3" /> Phân tích ảnh
            </>
          )}
        </button>
      </div>
    </form>
  )
}