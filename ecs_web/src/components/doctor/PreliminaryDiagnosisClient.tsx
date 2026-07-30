"use client"

/**
 * PatientInitialAssessmentClient
 * ==============================
 * Trang "Khảo sát ban đầu & Chẩn đoán sơ bộ" dựa trên UC 35/36 (Patient Demographics)
 * — dùng chung cho cả 6 mẫu bệnh án.
 *
 * Flow:
 *  1. Hành chính (họ tên, ngày sinh, giới, SĐT, CCCD, địa chỉ, BHYT)
 *  2. Tiền sử y khoa (nhóm máu, dị ứng, bệnh toàn thân, gia đình, lối sống)
 *  3. Tiền sử nhãn khoa (thuốc mắt, phẫu thuật mắt, tiền sử thị lực)
 *  4. Phân loại & Triệu chứng (urgency level, mức độ đau, lý do khám hôm nay)
 *  5. Xem lại & Gửi → sang bước chọn mẫu bệnh án
 *
 * Payload submit vẫn gửi endpoint `/doctor-appointment/preliminary-diagnosis`
 * (mapping sang PreliminaryDiagnosisRequest + một số trường UC 35/36).
 */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { preliminaryDiagnosisService } from "@/services/preliminary-diagnosis.service"
import { medicalRecordPatientDemographicsService } from "@/services"
import {
  TriageUrgencyLevel,
  type PreliminaryDiagnosisRequest,
} from "@/types"

interface PatientInitialAssessmentClientProps {
  doctorId: string
  appointmentId: string
  patientId: string
  patientName: string
}

interface FormState {
  // Step 1 — Admin (UC35)
  fullName: string
  dateOfBirth: string
  gender: "Nam" | "Nữ" | "Khác" | ""
  phoneNumber: string
  identityNumber: string
  address: string
  bhytNumber: string

  // Step 2 — Medical background (UC35/36)
  bloodType: string
  allergies: string
  medicalHistory: string
  familyHistory: string
  lifestyleFactors: string

  // Step 3 — Eye history (UC36 ophthalmology fields)
  currentEyeMedications: string
  previousEyeSurgery: string
  eyeVisionHistory: string

  // Step 4 — Triage & Symptoms (UC preliminary)
  urgencyLevel: TriageUrgencyLevel
  painLevel: number | ""
  chiefComplaint: string
}

const STEP_KEYS = [
  "stepAdmin",
  "stepMedical",
  "stepEye",
  "stepTriage",
] as const

const normalizeGender = (g?: string | null): "Nam" | "Nữ" | "Khác" | "" => {
  if (!g) return ""
  if (g === "Male" || g === "Nam" || g === "MALE") return "Nam"
  if (g === "Female" || g === "Nữ" || g === "FEMALE") return "Nữ"
  if (g === "Other" || g === "Khác" || g === "OTHER") return "Khác"
  return ""
}

export default function PatientInitialAssessmentClient({
  appointmentId,
  patientId,
  patientName,
}: PatientInitialAssessmentClientProps) {
  const t = useTranslations("doctor.preliminaryDiagnosis")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    fullName: patientName ?? "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    identityNumber: "",
    address: "",
    bhytNumber: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    familyHistory: "",
    lifestyleFactors: "",
    currentEyeMedications: "",
    previousEyeSurgery: "",
    eyeVisionHistory: "",
    urgencyLevel: TriageUrgencyLevel.Medium,
    painLevel: "",
    chiefComplaint: "",
  })

  // Auto-fill existing patient demographic info if patientId is present
  useEffect(() => {
    if (!patientId) return
    const fetchPatientInfo = async () => {
      setLoadingPatient(true)
      try {
        const response =
          await medicalRecordPatientDemographicsService.getPatientDemographicsDetail(patientId)
        if (response.data) {
          const d = response.data
          setForm((prev) => ({
            ...prev,
            fullName: d.fullName || prev.fullName || "",
            dateOfBirth: d.dob ? d.dob.split("T")[0] : prev.dateOfBirth,
            gender: d.gender ? normalizeGender(d.gender) : prev.gender,
            phoneNumber: d.phoneNumber || prev.phoneNumber,
            identityNumber: d.identityNumber || prev.identityNumber,
            address: d.address || prev.address,
            bhytNumber: d.bhytNumber || prev.bhytNumber,
            bloodType: d.bloodType || prev.bloodType,
            allergies: d.allergies || prev.allergies,
            medicalHistory: d.medicalHistory || prev.medicalHistory,
            familyHistory: d.familyHistory || prev.familyHistory,
            lifestyleFactors: d.lifestyleFactors || prev.lifestyleFactors,
            currentEyeMedications: d.currentEyeMedications || prev.currentEyeMedications,
            previousEyeSurgery: d.previousEyeSurgery || prev.previousEyeSurgery,
            eyeVisionHistory: d.eyeVisionHistory || prev.eyeVisionHistory,
          }))
        }
      } catch (err) {
        console.error("Failed to load patient demographics:", err)
      } finally {
        setLoadingPatient(false)
      }
    }
    fetchPatientInfo()
  }, [patientId])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.chiefComplaint.trim()) {
      setError(t("requiredFields"))
      setStep(STEP_KEYS.indexOf("stepTriage"))
      return
    }

    setSubmitting(true)
    try {
      const payload: PreliminaryDiagnosisRequest & Record<string, unknown> = {
        appointmentId,
        urgencyLevel: form.urgencyLevel,
        painLevel: typeof form.painLevel === "number" ? form.painLevel : null,
        quickVisualAssessment: form.chiefComplaint || null,
        hasVisionChange: false,
        hasEyeRedness: false,
        hasEyeDischarge: false,
        hasLightSensitivity: false,
        hasEyePain: form.painLevel !== "" && Number(form.painLevel) > 3,
        hasHeadache: false,
        hasForeignBody: false,
        recommendedAction: null,
        isReferralNeeded: false,
        referralTo: null,
        followUpInstructions:
          [
            form.allergies && `Dị ứng: ${form.allergies}`,
            form.currentEyeMedications && `Thuốc mắt: ${form.currentEyeMedications}`,
            form.previousEyeSurgery && `PT mắt: ${form.previousEyeSurgery}`,
            form.medicalHistory && `Tiền sử: ${form.medicalHistory}`,
          ]
            .filter(Boolean)
            .join(" | ") || null,
        checkInTime: new Date().toISOString(),

        // UC 35/36 demographics — payload mở rộng (BE tự bỏ qua field lạ)
        patientProfileId: undefined,
        fullName: form.fullName || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        phoneNumber: form.phoneNumber || null,
        identityNumber: form.identityNumber || null,
        bhytNumber: form.bhytNumber || null,
        address: form.address || null,
        bloodType: form.bloodType || null,
        allergies: form.allergies || null,
        medicalHistory: form.medicalHistory || null,
        familyHistory: form.familyHistory || null,
        lifestyleFactors: form.lifestyleFactors || null,
        currentEyeMedications: form.currentEyeMedications || null,
        previousEyeSurgery: form.previousEyeSurgery || null,
        eyeVisionHistory: form.eyeVisionHistory || null,
      }

      const response = await preliminaryDiagnosisService.submit(
        payload as PreliminaryDiagnosisRequest,
      )

      if (response.data?.isSuccess) {
        router.push(
          `/doctor/records/create?appointmentId=${appointmentId}&patientId=${encodeURIComponent(patientName)}&fromInitialAssessment=true`,
        )
        return
      }

      setError(response.codeMessage || t("saveFailed"))
    } catch {
      setError(t("saveFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabels = STEP_KEYS.map((k) => t(k))

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  const labelClass = "mb-1 block text-xs font-medium text-gray-700"

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label={tCommon("back")}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t("pageTitle")}
              </h1>
              <p className="text-sm text-gray-500">
                {patientName
                  ? `${t("patient")}: ${patientName}`
                  : t("pageSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <ol className="mb-6 flex items-center justify-between gap-2">
          {stepLabels.map((label, idx) => {
            const active = idx === step
            const done = idx < step
            return (
              <li
                key={label}
                className="flex flex-1 flex-col items-center text-center"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </span>
                <span className="mt-1 text-[11px] text-gray-600">{label}</span>
              </li>
            )
          })}
        </ol>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {step === 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                {stepLabels[0]}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("fullName")}</label>
                  <input
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("dateOfBirth")}</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("gender")}</label>
                  <select
                    className={inputClass}
                    value={form.gender}
                    onChange={(e) =>
                      update(
                        "gender",
                        e.target.value as FormState["gender"],
                      )
                    }
                  >
                    <option value="">—</option>
                    <option value="Nam">{t("male")}</option>
                    <option value="Nữ">{t("female")}</option>
                    <option value="Khác">{t("other")}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("phone")}</label>
                  <input
                    className={inputClass}
                    value={form.phoneNumber}
                    onChange={(e) => update("phoneNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("identityNumber")}</label>
                  <input
                    className={inputClass}
                    value={form.identityNumber}
                    onChange={(e) => update("identityNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("bhytNumber")}</label>
                  <input
                    className={inputClass}
                    value={form.bhytNumber}
                    onChange={(e) => update("bhytNumber", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t("address")}</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                {stepLabels[1]}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("bloodType")}</label>
                  <select
                    className={inputClass}
                    value={form.bloodType}
                    onChange={(e) => update("bloodType", e.target.value)}
                  >
                    <option value="">—</option>
                    {["A", "B", "AB", "O"].map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("allergies")}</label>
                  <input
                    className={inputClass}
                    value={form.allergies}
                    onChange={(e) => update("allergies", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t("medicalHistory")}</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={form.medicalHistory}
                    onChange={(e) => update("medicalHistory", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t("familyHistory")}</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.familyHistory}
                    onChange={(e) => update("familyHistory", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>{t("lifestyleFactors")}</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.lifestyleFactors}
                    onChange={(e) => update("lifestyleFactors", e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                {stepLabels[2]}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t("currentEyeMedications")}</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.currentEyeMedications}
                    onChange={(e) =>
                      update("currentEyeMedications", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("previousEyeSurgery")}</label>
                  <textarea
                    rows={2}
                    className={inputClass}
                    value={form.previousEyeSurgery}
                    onChange={(e) =>
                      update("previousEyeSurgery", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("eyeVisionHistory")}</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={form.eyeVisionHistory}
                    onChange={(e) => update("eyeVisionHistory", e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">
                {stepLabels[3]}
              </h2>
              <div>
                <label className={labelClass}>{t("urgencyLevel")}</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { v: TriageUrgencyLevel.Emergency, label: t("emergency"), color: "red" },
                    { v: TriageUrgencyLevel.High, label: t("high"), color: "orange" },
                    { v: TriageUrgencyLevel.Medium, label: t("medium"), color: "yellow" },
                    { v: TriageUrgencyLevel.Low, label: t("low"), color: "green" },
                  ].map((opt) => {
                    const active = form.urgencyLevel === opt.v
                    const colors = {
                      red: {
                        active: "border-red-500 bg-red-50 text-red-700",
                        idle: "border-gray-200 text-gray-600 hover:bg-gray-50",
                      },
                      orange: {
                        active: "border-orange-500 bg-orange-50 text-orange-700",
                        idle: "border-gray-200 text-gray-600 hover:bg-gray-50",
                      },
                      yellow: {
                        active: "border-yellow-500 bg-yellow-50 text-yellow-700",
                        idle: "border-gray-200 text-gray-600 hover:bg-gray-50",
                      },
                      green: {
                        active: "border-green-500 bg-green-50 text-green-700",
                        idle: "border-gray-200 text-gray-600 hover:bg-gray-50",
                      },
                    }[opt.color]
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => update("urgencyLevel", opt.v)}
                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                          colors ? (active ? colors.active : colors.idle) : ""
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("painLevel")}</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form.painLevel === "" ? 0 : form.painLevel}
                  onChange={(e) =>
                    update("painLevel", Number(e.target.value) as FormState["painLevel"])
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  {form.painLevel === "" ? "—" : form.painLevel} / 10
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("chiefComplaint")} *</label>
                <textarea
                  rows={3}
                  required
                  placeholder={t("chiefComplaintPlaceholder")}
                  className={inputClass}
                  value={form.chiefComplaint}
                  onChange={(e) => update("chiefComplaint", e.target.value)}
                />
              </div>
            </section>
          )}

          {/* Step nav */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> {t("previous")}
            </button>

            {step < STEP_KEYS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1))}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                {t("next")} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {t("save")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
