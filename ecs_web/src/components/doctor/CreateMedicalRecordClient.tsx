"use client"

/**
 * CreateMedicalRecordClient — MongoDB-backed JSON envelope form.
 *
 * Renders 6 ophthalmic templates (MS21-26) cho khám ngoại trú.
 *
 * Lưu ý: Theo yêu cầu người dùng (2026-07-20):
 *  - Lược bỏ hoàn toàn phần "Quản lý bệnh nhân nội trú" (admission, bed,
 *    department transfer, total treatment days, discharge, tử vong).
 *  - Lược bỏ phần "ICD Diagnosis Codes" của Bộ Y tế (chẩn đoán sơ bộ đã có
 *    UC 35/36, chẩn đoán xác định sẽ nhập trực tiếp trong subspecialty section).
 *  - Không render "Tổng kết bệnh án" nội trú; chỉ giữ phần "Tổng kết" rút gọn
 *    (chẩn đoán cuối + hướng điều trị tiếp + đơn thuốc).
 *  - Toàn bộ label sử dụng i18n (vi/en) qua namespace `medicalRecord` + `form`.
 */
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Loader2, AlertCircle, CheckCircle2, Printer } from "lucide-react"

import {
  medicalRecordFormDataSchema,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import medicalRecordService from "@/services/medical-record.service"
import { patientProfileService } from "@/services/patient-profile.service"
import { getMessage } from "@/constants/messages"
import {
  MEDICAL_RECORD_TYPES,
  MEDICAL_RECORD_TYPE_LABELS,
  type MedicalRecordType,
  type MedicalRecordFormDataPayload,
} from "@/types"

import UniversalEyeExamSections from "./medical-record-form/UniversalEyeExamSections"
import SubspecialtySections from "./medical-record-form/SubspecialtySections"
import GlaucomaFormSections from "./medical-record-form/GlaucomaFormSections"
import PatientManagementSections from "./medical-record-form/PatientManagementSections"
import DiagnosisDischargeSections from "./medical-record-form/DiagnosisDischargeSections"
import TreatmentProgressTable from "./medical-record-form/TreatmentProgressTable"
import SurgeryForm from "./medical-record-form/SurgeryForm"
import PrescriptionSection from "./medical-record-form/PrescriptionSection"
import PreliminaryExamination, {
  type PreliminaryData,
  type PreliminaryCategory,
} from "./medical-record-form/PreliminaryExamination"
import { getAccentForRecordType } from "./medical-record-form/SectionHeading"
import ParaclinicalPanel from "./ParaclinicalPanel"

interface CreateMedicalRecordClientProps {
  appointmentId: string
  patientProfileId?: string
  initialRecordType?: string
}

/** Subset of patient profile fields surfaced inside the form header. */
type PropsForSections = NonNullable<
  React.ComponentProps<typeof PatientManagementSections>["patientProfile"]
>

function accentButtonClass(recordType: string | undefined): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "bg-rose-600 hover:bg-rose-700"
    case "MS22_ANTERIOR":
      return "bg-teal-600 hover:bg-teal-700"
    case "MS23_FUNDUS":
      return "bg-amber-600 hover:bg-amber-700"
    case "MS24_GLAUCOMA":
      return "bg-indigo-600 hover:bg-indigo-700"
    case "MS25_STRABISMUS_PTOSIS":
      return "bg-sky-600 hover:bg-sky-700"
    case "MS26_PEDIATRIC":
      return "bg-violet-600 hover:bg-violet-700"
    default:
      return "bg-gray-600 hover:bg-gray-700"
  }
}

function accentTextClass(accent: string): string {
  switch (accent) {
    case "rose":
      return "text-rose-700"
    case "teal":
      return "text-teal-700"
    case "amber":
      return "text-amber-700"
    case "indigo":
      return "text-indigo-700"
    case "sky":
      return "text-sky-700"
    case "violet":
      return "text-violet-700"
    case "emerald":
      return "text-emerald-700"
    default:
      return "text-slate-700"
  }
}

export default function CreateMedicalRecordClient({
  appointmentId,
  patientProfileId,
  initialRecordType,
}: CreateMedicalRecordClientProps) {
  const router = useRouter()
  const t = useTranslations("medicalRecord")
  const tForm = useTranslations("form")
  const tCommon = useTranslations("common")

  const initialType = useMemo<MedicalRecordType | undefined>(() => {
    if (initialRecordType && (MEDICAL_RECORD_TYPES as readonly string[]).includes(initialRecordType)) {
      return initialRecordType as MedicalRecordType
    }
    return undefined
  }, [initialRecordType])

  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>(initialType)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ recordId: string; mongoDocumentId?: string } | null>(null)

  // ── Step flow: preliminary → template → form ───────────────────────
  const [step, setStep] = useState<"preliminary" | "template">(initialType ? "template" : "preliminary")
  const [preliminary, setPreliminary] = useState<PreliminaryData | null>(null)

  // ── Patient profile (fetched lazily so header info is real) ─────────
  const [patientProfile, setPatientProfile] = useState<PropsForSections | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!patientProfileId) {
      setPatientProfile(null)
      return
    }
    ;(async () => {
      try {
        const res = await patientProfileService.getById(patientProfileId)
        if (cancelled) return
        const d = (res as unknown as { data?: Record<string, unknown> }).data ?? {}
        setPatientProfile({
          fullName:
            (d.fullName as string | null) ??
            (d.full_name as string | null) ??
            (d.name as string | null) ??
            null,
          gender: (d.gender as string | null) ?? null,
          dob: (d.dob as string | null) ?? (d.dateOfBirth as string | null) ?? null,
          phoneNumber:
            (d.phoneNumber as string | null) ?? (d.phone as string | null) ?? null,
          address: (d.address as string | null) ?? null,
          identityNumber:
            (d.identityNumber as string | null) ??
            (d.identity_number as string | null) ??
            (d.citizenId as string | null) ??
            null,
          bhytNumber:
            (d.bhytNumber as string | null) ?? (d.bhyt_number as string | null) ?? null,
          bhytExpiryDate:
            (d.bhytExpiryDate as string | null) ??
            (d.bhyt_expiry as string | null) ??
            null,
          bloodType: (d.bloodType as string | null) ?? null,
          allergies: (d.allergies as string | null) ?? null,
          medicalHistory: (d.medicalHistory as string | null) ?? null,
        })
      } catch {
        if (!cancelled) setPatientProfile(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [patientProfileId])

  // ── Preliminary data feeds into form defaults ───────────────────────
  // Map preliminary → form defaults (chief complaint, etc.)
  useEffect(() => {
    if (!preliminary) return
    methods.reset({
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: preliminary.chiefComplaint,
        benhSu: preliminary.onsetDuration
          ? `${preliminary.onsetDuration}${preliminary.affectedEye !== "NONE" ? ` — ${preliminary.affectedEye}` : ""}${preliminary.painLevel > 0 ? ` — Pain ${preliminary.painLevel}/10` : ""}\n${preliminary.quickObservations}`
          : preliminary.quickObservations,
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: "",
        tienSuGiaDinh: "",
      },
      khamBenh: {
        khamToanThan: {},
      },
    } as MedicalRecordFormDataPayload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preliminary])

  const handlePreliminaryComplete = (data: PreliminaryData) => {
    setPreliminary(data)
    // Auto-select template based on suspected category (but allow user to change)
    if (data.suspectedCategory) {
      setRecordType(data.suspectedCategory)
    }
    setStep("template")
  }

  const methods = useForm<MedicalRecordFormDataPayload>({
    resolver: zodResolver(medicalRecordFormDataSchema) as unknown as Resolver<MedicalRecordFormDataPayload>,
    mode: "onBlur",
    defaultValues: {
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: "",
        benhSu: "",
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: "",
        tienSuGiaDinh: "",
      },
      khamBenh: {
        khamToanThan: {},
      },
    },
  })

  // ─── Step 0: Preliminary examination ────────────────────────────────
  if (step === "preliminary") {
    return (
      <PreliminaryExamination
        patientName={patientProfile?.fullName ?? null}
        onComplete={handlePreliminaryComplete}
        onBack={() => router.back()}
      />
    )
  }

  // ─── Chọn loại bệnh án ─────────────────────────────────────────────
  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("selectTemplate")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{t("selectTemplateDesc")}</p>
          {preliminary && (
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <strong>{tForm("patientInfoFromProfile") || "Preliminary"}:</strong>{" "}
              {preliminary.chiefComplaint}
              {preliminary.suspectedCategory && (
                <span className="ml-2 inline-block rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  → {preliminary.suspectedCategory.replace("MS", "MS ")}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {MEDICAL_RECORD_TYPES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setRecordType(rt)}
              className="group flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:shadow"
            >
              <span className="text-sm font-semibold text-indigo-600">
                {rt.replace("MS", "MS ")}
              </span>
              <span className="mt-1 text-sm text-gray-700">
                {MEDICAL_RECORD_TYPE_LABELS[rt]}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← {tCommon("back")}
        </button>
      </div>
    )
  }

  // ─── Success banner + Paraclinical Panel ──────────────────────────
  if (successInfo) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            {t("savedSuccess")}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Medical Record ID:{" "}
            <code className="rounded bg-white px-2 py-0.5">{successInfo.recordId}</code>
          </p>
          {successInfo.mongoDocumentId && (
            <p className="mt-1 text-xs text-gray-600">
              MongoDB Document ID:{" "}
              <code className="rounded bg-white px-2 py-0.5">{successInfo.mongoDocumentId}</code>
            </p>
          )}
        </div>

        <ParaclinicalPanel recordId={successInfo.recordId} />

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/doctor/records")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("backToList")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/doctor/records/${successInfo.recordId}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t("viewDetail")}
          </button>
        </div>
      </div>
    )
  }

  // ─── Submit handler ─────────────────────────────────────────────────
  const onSubmit = methods.handleSubmit(async (values) => {
    setServerError(null)

    const ok = validateFormDataForRecordType(recordType, values as never)
    if (!ok.ok) {
      setServerError(ok.reason)
      return
    }

    setSubmitting(true)
    try {
      if (!patientProfileId) {
        setServerError(
          "Thiếu patientProfileId — vui lòng mở form từ trang bệnh nhân hoặc truyền ?patientProfileId=...",
        )
        setSubmitting(false)
        return
      }

      const response = await medicalRecordService.create({
        appointmentId,
        patientId: patientProfileId,
        recordType,
        notes: "",
        formData: values,
      })

      if (!response?.data?.isSuccess) {
        setServerError(getMessage(response?.codeMessage) ?? "Tạo bệnh án thất bại")
        setSubmitting(false)
        return
      }

      setSuccessInfo({
        recordId: response.data.medicalRecordId,
        mongoDocumentId: response.data.mongoDocumentId,
      })
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Lỗi không xác định khi gọi BE",
      )
    } finally {
      setSubmitting(false)
    }
  })

  const accent = getAccentForRecordType(recordType)

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8"
        aria-label={MEDICAL_RECORD_TYPE_LABELS[recordType]}
      >
        {/* Header — printable */}
        <header className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${accentTextClass(accent)}`}>
                {recordType.replace("MS", "MS ")}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {MEDICAL_RECORD_TYPE_LABELS[recordType]}
              </h1>
              <p className="mt-1 hidden text-xs text-gray-600 print:block">
                <strong>
                  {t("formTemplate")} — MS {recordType.replace("MS", "")}/BV-01
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 print:hidden"
              title={t("printA4")}
            >
              <Printer className="h-4 w-4" />
              {t("printA4")}
            </button>
          </div>
        </header>

        {/* Mini TOC */}
        <nav
          aria-label="Mục lục bệnh án"
          className="sticky top-2 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur print:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">{t("toc")}</span>
            <a href="#patient-info" className="hover:text-indigo-600">
              {t("sections.patientInfo")}
            </a>
            <a href="#benh-an" className="hover:text-indigo-600">
              {t("sections.reason")}
            </a>
            <a href="#kham-benh" className="hover:text-indigo-600">
              {t("sections.exam")}
            </a>
            <a href="#diagnosis" className="hover:text-indigo-600">
              {t("sections.diagnosis")}
            </a>
            <a href="#tong-ket" className="hover:text-indigo-600">
              {t("sections.summary")}
            </a>
            <a href="#don-thuoc" className="hover:text-indigo-600">
              {t("sections.treatment")}
            </a>
          </div>
        </nav>

        {/* I. ADMINISTRATION (Hành chính tối giản cho ngoại trú) */}
        <section id="patient-info">
          <PatientManagementSections recordType={recordType} patientProfile={patientProfile ?? undefined} />
        </section>

        {/* A. BỆNH ÁN — Lý do / Bệnh sử / Tiền sử (theo SubspecialtySections) */}
        <div id="benh-an">
          {recordType === "MS24_GLAUCOMA" ? (
            <GlaucomaFormSections />
          ) : (
            <SubspecialtySections recordType={recordType} />
          )}
        </div>

        {/* III. KHÁM BỆNH — shared universal layout for all recordTypes */}
        <div id="kham-benh">
          <UniversalEyeExamSections />
        </div>

        {/* IV. CHẨN ĐOÁN (rút gọn cho ngoại trú) */}
        <section id="diagnosis">
          <DiagnosisDischargeSections />
        </section>

        {/* MS22 Bán phần trước — bảng "Theo dõi điều trị" */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TreatmentProgressTable />
          </section>
        )}

        {/* MS22 Bán phần trước — Phiếu Phẫu thuật / Thủ thuật */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <SurgeryForm />
          </section>
        )}

        {/* V. ĐƠN THUỐC */}
        <section id="don-thuoc">
          <PrescriptionSection />
        </section>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-lg ${accentButtonClass(recordType)} px-5 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("savingToMongo")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> {t("completeAndSave")}
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
