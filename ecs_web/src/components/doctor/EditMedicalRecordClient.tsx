"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, FormProvider, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileEdit,
  ClipboardList,
  Pill,
} from "lucide-react"

import { medicalRecordService } from "@/services/medical-record.service"
import { recordApprovalService } from "@/services/record-approval.service"
import {
  medicalRecordFormDataSchema,
  type MedicalRecordFormData as MedicalRecordFormDataPayload,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import type { MedicalRecordType } from "@/types"

import UniversalEyeExamSections from "./medical-record-form/UniversalEyeExamSections"
import ParaclinicalPanel from "./ParaclinicalPanel"
import SummaryDiagnosisModal from "./medical-record-form/SummaryDiagnosisModal"
import CreatePrescriptionModal from "./medical-record-form/CreatePrescriptionModal"

interface EditMedicalRecordClientProps {
  recordId: string
  appointmentId?: string
}

export default function EditMedicalRecordClient({
  recordId,
}: EditMedicalRecordClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")
  const tEdit = useTranslations("medicalRecordEdit")
  const getMessage = useTranslations("messages")

  const [loadingRecord, setLoadingRecord] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [recordType, setRecordType] = useState<MedicalRecordType | null>(null)
  const [initialData, setInitialData] = useState<MedicalRecordFormDataPayload | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ recordId: string } | null>(null)

  // Quick Action Modals
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  useEffect(() => {
    async function fetchRecord() {
      try {
        setLoadingRecord(true)
        setLoadError(null)
        const response = await medicalRecordService.getById(recordId)
        if (!response.data) {
          setLoadError(tEdit("loadErrorNotFound"))
          return
        }

        const record = response.data

        const checkRes = await recordApprovalService.checkPermission(recordId).catch(() => ({ data: false }))
        const isApprovedByAdmin = checkRes.data === true

        if (record.isLocked || (record.canEdit === false && !isApprovedByAdmin)) {
          setLoadError(
            record.editRestrictionReason || tEdit("loadErrorLocked"),
          )
          return
        }

        const formData = record.formData as MedicalRecordFormDataPayload | null

        if (formData) {
          setInitialData(formData)
        } else {
          setLoadError(tEdit("loadErrorLegacy"))
          return
        }

        setRecordType(record.recordType as MedicalRecordType)
      } catch (err) {
        console.error("Error fetching record:", err)
        setLoadError(tEdit("loadErrorGeneric"))
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [recordId, tEdit])

  const methods = useForm<MedicalRecordFormDataPayload>({
    resolver: zodResolver(medicalRecordFormDataSchema) as unknown as Resolver<MedicalRecordFormDataPayload>,
    mode: "onBlur",
    defaultValues: initialData ?? {
      schemaVersion: "1.1",
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

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData)
    }
  }, [initialData, methods])

  const formatSystemErrorMessage = (rawError?: string | null, fallback = tEdit("saveErrorGeneric")): string => {
    if (!rawError) return fallback
    if (
      rawError.includes("500") ||
      rawError.includes("status code 500") ||
      rawError.toLowerCase().includes("request failed") ||
      rawError.includes("Internal Server Error")
    ) {
      return tEdit("saveErrorSystem")
    }
    return getMessage(rawError) ?? rawError
  }

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!recordType) return

    setServerError(null)

    const ok = validateFormDataForRecordType(recordType, values as never)
    if (!ok.ok) {
      setServerError(ok.reason)
      return
    }

    setSubmitting(true)
    try {
      let reason = "Đã được Clinic Admin phê duyệt điều chỉnh dữ liệu lâm sàng"
      let permissionDoc = "GP-APPROVED/QĐ-CA"

      if (typeof window !== "undefined") {
        const savedDetailsRaw = localStorage.getItem(`med_rec_details_${recordId}`)
        if (savedDetailsRaw) {
          try {
            const parsed = JSON.parse(savedDetailsRaw)
            if (parsed.reason) reason = parsed.reason
            if (parsed.permissionDoc) permissionDoc = parsed.permissionDoc
          } catch {
            // ignore
          }
        }
      }

      const mergedValues = {
        ...initialData,
        ...values,
        benhAn: {
          ...(initialData?.benhAn || {}),
          ...(values?.benhAn || {}),
        },
        khamBenh: {
          ...(initialData?.khamBenh || {}),
          ...(values?.khamBenh || {}),
        },
      }

      const response = await medicalRecordService.update(recordId, {
        formData: mergedValues as any,
        editReason: reason,
        editPermissionDocument: permissionDoc,
      })

      if (!response?.data?.isSuccess) {
        setServerError(formatSystemErrorMessage(response?.codeMessage))
        setSubmitting(false)
        return
      }

      // Reset approval state in MongoDB so permission is revoked for future edits
      await recordApprovalService.resetApproval(recordId).catch(() => {})

      setSuccessInfo({ recordId })
    } catch (err) {
      setServerError(
        formatSystemErrorMessage(err instanceof Error ? err.message : null)
      )
    } finally {
      setSubmitting(false)
    }
  })

  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-[#00658D] border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[#00658D]/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#00658D] animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{tEdit("loadingTitle")}</h3>
          <p className="text-sm text-gray-500">{tEdit("loadingHint")}</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tEdit("errorTitle")}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{loadError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {tEdit("back")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (successInfo) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 w-full">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-sm w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-4 shadow-2xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hồ Sơ Bệnh Án Đã Được Cập Nhật Thành Công
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
            Hệ thống đã lưu lại toàn bộ diễn biến lâm sàng, tổng kết chẩn đoán và đơn thuốc/đơn kính đã được chỉnh sửa theo đúng quy chuẩn EMR.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thành công lên hệ thống EMR</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push("/doctor/records")}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
          >
            {tEdit("backToList")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/doctor/records/${successInfo.recordId}`)}
            className="rounded-xl bg-[#00658D] px-6 py-3 text-xs font-bold text-white hover:bg-[#005273] active:bg-[#003d54] transition-colors shadow-2xs cursor-pointer"
          >
            {tEdit("viewDetail")}
          </button>
        </div>
      </div>
    )
  }

  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          {tEdit("recordTypeMissing")}
        </div>
      </div>
    )
  }

  const renderFormContent = () => {
    return <UniversalEyeExamSections recordType={recordType} />
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (appointmentId) {
                  router.push(`/doctor/records/${recordId}?appointmentId=${appointmentId}`)
                } else {
                  router.push(`/doctor/records/${recordId}`)
                }
              }}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
              title="Quay lại chi tiết"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00658D]/10 text-[#00658D] border border-[#00658D]/20">
                  <FileEdit className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ lâm sàng
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {tEdit("title")}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 ${accentButton(recordType)}`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tEdit("saving")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu cập nhật cận lâm sàng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Server Error Message Banner */}
        {serverError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{serverError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="font-bold text-red-800 hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 6 Specialized Form Content */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
          {renderFormContent()}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {tEdit("back")}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 ${accentButton(recordType)}`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tEdit("saving")}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu thay đổi hồ sơ bệnh án</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal: Summary Diagnosis & Discharge */}
      {showSummaryModal && (
        <SummaryDiagnosisModal
          recordId={recordId}
          initialData={methods.getValues() as any}
          onClose={() => setShowSummaryModal(false)}
          onSuccess={() => {
            setShowSummaryModal(false)
          }}
        />
      )}

      {/* Modal: Create & Update Prescription / Eyeglasses */}
      {showPrescriptionModal && (
        <CreatePrescriptionModal
          recordId={recordId}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            setShowPrescriptionModal(false)
          }}
        />
      )}
    </FormProvider>
  )
}

function accentButton(recordType: string): string {
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
      return "bg-gray-800 hover:bg-gray-900"
  }
}
