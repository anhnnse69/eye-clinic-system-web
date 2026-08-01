"use client"

/**
 * PreliminaryExamination — Bước khám SƠ BỘ trước khi chọn mẫu bệnh án.
 *
 * Flow mới (yêu cầu người dùng 2026-07-20):
 *  1. Doctor mở form khám bệnh từ appointment
 *  2. Điền form sơ bộ: triệu chứng chính, thời gian khởi phát,
 *     mức độ đau, tiền sử nhanh, quan sát ban đầu
 *  3. Đánh dấu nhóm nghi ngờ (trauma / anterior / fundus / glaucoma /
 *     strabismus-ptosis / pediatric)
 *  4. Sau khi xác nhận → chọn mẫu bệnh án tương ứng để khám chi tiết
 *
 * Form này KHÔNG lưu DB — chỉ là bước trung gian để xác định mẫu.
 * Khi bấm "Tiếp tục" sẽ gọi `onComplete(preliminaryData)`.
 */
import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Stethoscope, Eye, Activity, AlertTriangle, Clock,
  ChevronRight, ChevronLeft, Save, Info,
} from "lucide-react"

export type PreliminaryCategory =
  | "MS21_TRAUMA"
  | "MS22_ANTERIOR"
  | "MS23_FUNDUS"
  | "MS24_GLAUCOMA"
  | "MS25_STRABISMUS_PTOSIS"
  | "MS26_PEDIATRIC"

export interface PreliminaryData {
  chiefComplaint: string
  onsetDuration: string
  painLevel: number // 0-10
  affectedEye: "OD" | "OS" | "BOTH" | "NONE"
  quickObservations: string
  suspectedCategory: PreliminaryCategory | null
  urgency: "low" | "medium" | "high" | "emergency"
}

interface Props {
  patientName?: string | null
  onComplete: (data: PreliminaryData) => void
  onBack?: () => void
}

const CATEGORY_OPTIONS: Array<{
  id: PreliminaryCategory
  icon: typeof Eye
  color: string
  border: string
}> = [
  { id: "MS21_TRAUMA",            icon: AlertTriangle, color: "text-rose-700 bg-rose-50",   border: "border-rose-300" },
  { id: "MS22_ANTERIOR",          icon: Eye,           color: "text-teal-700 bg-teal-50",    border: "border-teal-300" },
  { id: "MS23_FUNDUS",            icon: Eye,           color: "text-amber-700 bg-amber-50",  border: "border-amber-300" },
  { id: "MS24_GLAUCOMA",          icon: Activity,      color: "text-indigo-700 bg-indigo-50", border: "border-indigo-300" },
  { id: "MS25_STRABISMUS_PTOSIS", icon: Eye,           color: "text-sky-700 bg-sky-50",      border: "border-sky-300" },
  { id: "MS26_PEDIATRIC",         icon: Eye,           color: "text-violet-700 bg-violet-50", border: "border-violet-300" },
]

export default function PreliminaryExamination({ patientName, onComplete, onBack }: Props) {
  const t = useTranslations("preliminary")
  const tCommon = useTranslations("doctor.common")

  const [data, setData] = useState<PreliminaryData>({
    chiefComplaint: "",
    onsetDuration: "",
    painLevel: 0,
    affectedEye: "NONE",
    quickObservations: "",
    suspectedCategory: null,
    urgency: "low",
  })

  const update = <K extends keyof PreliminaryData>(key: K, value: PreliminaryData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const canContinue =
    data.chiefComplaint.trim().length >= 3 &&
    data.onsetDuration.trim().length >= 1 &&
    data.suspectedCategory !== null

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 print:hidden">
      {/* Header */}
      <header className="mb-6 rounded-lg border border-blue-200 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-600 p-2 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {t("subtitle")}
              {patientName && (
                <span className="ml-1 font-medium text-gray-800">
                  {t("patientLabel")}: <span className="text-blue-700">{patientName}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Step 1: Chief complaint + timing + eye */}
      <section className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
          <h2 className="text-sm font-semibold text-gray-800">{t("step1Title")}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              {t("chiefComplaint")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.chiefComplaint}
              onChange={(e) => update("chiefComplaint", e.target.value)}
              rows={2}
              placeholder={t("chiefComplaintPlaceholder")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                {t("onsetDuration")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.onsetDuration}
                onChange={(e) => update("onsetDuration", e.target.value)}
                placeholder={t("onsetDurationPlaceholder")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">{t("affectedEye")}</label>
              <div className="grid grid-cols-4 gap-2">
                {(["OD", "OS", "BOTH", "NONE"] as const).map((eye) => (
                  <button
                    key={eye}
                    type="button"
                    onClick={() => update("affectedEye", eye)}
                    className={
                      "rounded-md border px-2 py-1.5 text-xs font-bold transition-colors " +
                      (data.affectedEye === eye
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50")
                    }
                  >
                    {t(`eye.${eye}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
              <span>{t("painLevel")}</span>
              <span className="text-[10px] text-gray-500">({data.painLevel}/10)</span>
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={data.painLevel}
              onChange={(e) => update("painLevel", Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-500">
              <span>{t("painNone")}</span>
              <span>{t("painMild")}</span>
              <span>{t("painModerate")}</span>
              <span>{t("painSevere")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Urgency */}
      <section className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
          <h2 className="text-sm font-semibold text-gray-800">{t("step2Title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(["low", "medium", "high", "emergency"] as const).map((u) => {
            const colors: Record<typeof u, string> = {
              low:        "border-emerald-300 bg-emerald-50 text-emerald-700",
              medium:     "border-amber-300 bg-amber-50 text-amber-700",
              high:       "border-orange-300 bg-orange-50 text-orange-700",
              emergency:  "border-rose-300 bg-rose-50 text-rose-700",
            }
            const isActive = data.urgency === u
            return (
              <button
                key={u}
                type="button"
                onClick={() => update("urgency", u)}
                className={
                  "rounded-md border-2 px-3 py-2 text-xs font-bold transition-all " +
                  (isActive ? colors[u] + " ring-2 ring-offset-1 ring-current" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50")
                }
              >
                {t(`urgency.${u}`)}
              </button>
            )
          })}
        </div>
      </section>

      {/* Step 3: Quick observations */}
      <section className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
          <h2 className="text-sm font-semibold text-gray-800">{t("step3Title")}</h2>
        </div>
        <textarea
          value={data.quickObservations}
          onChange={(e) => update("quickObservations", e.target.value)}
          rows={3}
          placeholder={t("observationsPlaceholder")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </section>

      {/* Step 4: Suspected category */}
      <section className="mb-5 rounded-lg border-2 border-indigo-300 bg-indigo-50/30 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-indigo-100 pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">4</span>
          <h2 className="text-sm font-semibold text-gray-800">{t("step4Title")}</h2>
          <Info className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <p className="mb-3 text-xs text-gray-600">{t("step4Desc")}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORY_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = data.suspectedCategory === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update("suspectedCategory", opt.id)}
                className={
                  "flex items-start gap-2 rounded-lg border-2 p-3 text-left transition-all " +
                  (isActive
                    ? `${opt.border} ${opt.color} ring-2 ring-offset-1 ring-current`
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50")
                }
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold">{opt.id.replace("MS", "MS ")}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-gray-600">
                    {t(`categories.${opt.id}`)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" /> {tCommon("back")}
        </button>

        <div className="flex items-center gap-3">
          {!canContinue && (
            <span className="text-xs text-amber-600">
              <Clock className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
              {t("validationHint")}
            </span>
          )}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => onComplete(data)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("continueToTemplate")} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
