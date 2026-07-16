"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Loader2, Stethoscope, AlertTriangle, Activity, Clock } from "lucide-react"
import { preliminaryDiagnosisService } from "@/services/preliminary-diagnosis.service"
import { TriageUrgencyLevel, PreliminaryDiagnosisRequest } from "@/types"

interface PreliminaryDiagnosisClientProps {
  doctorId: string
  appointmentId: string
  patientId: string
  patientName: string
}

export default function PreliminaryDiagnosisClient({
  appointmentId,
  patientName,
}: PreliminaryDiagnosisClientProps) {
  const t = useTranslations("doctor.preliminaryDiagnosis")
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    appointmentId,
    urgencyLevel: TriageUrgencyLevel.Medium,
    painLevel: "" as number | "",
    quickVisualAssessment: "",
    hasVisionChange: false,
    hasEyeRedness: false,
    hasEyeDischarge: false,
    hasLightSensitivity: false,
    hasEyePain: false,
    hasHeadache: false,
    hasForeignBody: false,
    recommendedAction: "",
    isReferralNeeded: false,
    referralTo: "",
    followUpInstructions: "",
    checkInTime: new Date().toISOString(),
  })

  const update = (updates: Record<string, unknown>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const payload: PreliminaryDiagnosisRequest = {
        appointmentId: form.appointmentId,
        urgencyLevel: form.urgencyLevel,
        painLevel: typeof form.painLevel === "number" ? form.painLevel : null,
        quickVisualAssessment: form.quickVisualAssessment || null,
        hasVisionChange: form.hasVisionChange,
        hasEyeRedness: form.hasEyeRedness,
        hasEyeDischarge: form.hasEyeDischarge,
        hasLightSensitivity: form.hasLightSensitivity,
        hasEyePain: form.hasEyePain,
        hasHeadache: form.hasHeadache,
        hasForeignBody: form.hasForeignBody,
        recommendedAction: form.recommendedAction || null,
        isReferralNeeded: form.isReferralNeeded,
        referralTo: form.isReferralNeeded ? form.referralTo || null : null,
        followUpInstructions: form.followUpInstructions || null,
        checkInTime: form.checkInTime || null,
      }

      const response = await preliminaryDiagnosisService.submit(payload)

      if (response.data?.isSuccess) {
        router.push(
          `/doctor/records/create?appointmentId=${appointmentId}&fromPreliminaryDiagnosis=true`
        )
        return
      }

      setError(response.codeMessage || t("error.saveFailed"))
    } catch {
      setError(t("error.unknown"))
    } finally {
      setSubmitting(false)
    }
  }

  const URGENCY_OPTIONS = [
    { value: TriageUrgencyLevel.Emergency, label: t("emergency"), color: "red", icon: AlertTriangle, description: t("urgencyDescriptions.emergency") },
    { value: TriageUrgencyLevel.High, label: t("high"), color: "orange", icon: Activity, description: t("urgencyDescriptions.high") },
    { value: TriageUrgencyLevel.Medium, label: t("medium"), color: "yellow", icon: Clock, description: t("urgencyDescriptions.medium") },
    { value: TriageUrgencyLevel.Low, label: t("low"), color: "green", icon: Stethoscope, description: t("urgencyDescriptions.low") },
  ]

  const COMMON_ACTIONS = [
    t("commonActions.visualAcuityExam"),
    t("commonActions.iopExam"),
    t("commonActions.fundusExam"),
    t("commonActions.schirmerTest"),
    t("commonActions.corneaExam"),
    t("commonActions.anteriorChamberExam"),
    t("commonActions.lensExam"),
    t("commonActions.octScan"),
    t("commonActions.refractionTest"),
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t("triageAndDiagnosis")}</h1>
              <p className="text-sm text-gray-500">
                {patientName ? `${t("patient")} ${patientName}` : t("classifyingPatient")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Stethoscope className="w-4 h-4" />
            <span>{t("classifyingPatient")}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Urgency Level Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("priority")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {URGENCY_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = form.urgencyLevel === option.value
                const colorClasses: Record<string, string> = {
                  red: isSelected ? "bg-red-50 border-red-500 text-red-700" : "border-gray-200 hover:border-red-300",
                  orange: isSelected ? "bg-orange-50 border-orange-500 text-orange-700" : "border-gray-200 hover:border-orange-300",
                  yellow: isSelected ? "bg-yellow-50 border-yellow-500 text-yellow-700" : "border-gray-200 hover:border-yellow-300",
                  green: isSelected ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 hover:border-green-300",
                }
                return (
                  <button
                    key={option.value}
                    onClick={() => update({ urgencyLevel: option.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${colorClasses[option.color]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-current" : "text-gray-400"}`} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs opacity-70">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Symptom Checklist */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("initialSymptoms")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "hasVisionChange", label: t("visionChange") },
                { key: "hasEyeRedness", label: t("redness") },
                { key: "hasEyeDischarge", label: t("abnormalDischarge") },
                { key: "hasLightSensitivity", label: t("lightSensitivity") },
                { key: "hasEyePain", label: t("eyePain") },
                { key: "hasHeadache", label: t("headache") },
                { key: "hasForeignBody", label: t("foreignBody") },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form[item.key as keyof typeof form] as boolean}
                    onChange={(e) => update({ [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pain Level & Quick Assessment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("quickAssessment")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("painLevelScale")}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={form.painLevel === "" ? 0 : form.painLevel}
                    onChange={(e) => update({ painLevel: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-10 text-center font-medium text-gray-700">
                    {form.painLevel === "" ? "-" : form.painLevel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("quickAssessmentNote")}</label>
                <textarea
                  value={form.quickVisualAssessment}
                  onChange={(e) => update({ quickVisualAssessment: e.target.value })}
                  rows={3}
                  placeholder={t("quickAssessmentPlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("suggestedActions")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("recommendedAction")}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => update({ recommendedAction: action })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        form.recommendedAction === action
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.recommendedAction}
                  onChange={(e) => update({ recommendedAction: e.target.value })}
                  placeholder={t("suggestedActionsPlaceholder")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isReferralNeeded}
                  onChange={(e) => update({ isReferralNeeded: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t("referToSpecialist")}</span>
              </label>

              {form.isReferralNeeded && (
                <input
                  type="text"
                  value={form.referralTo}
                  onChange={(e) => update({ referralTo: e.target.value })}
                  placeholder={t("referToPlaceholder")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              )}
            </div>
          </div>

          {/* Follow-up Instructions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("followUpInstructionsLabel")}</h2>
            <textarea
              value={form.followUpInstructions}
              onChange={(e) => update({ followUpInstructions: e.target.value })}
              rows={2}
              placeholder={t("followUpPlaceholder")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Stethoscope className="w-4 h-4" />
              )}
              {t("confirmAndContinue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
