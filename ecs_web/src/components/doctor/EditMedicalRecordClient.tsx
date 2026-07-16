"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Printer,
  FileText,
} from "lucide-react"

import {
  medicalRecordFormDataSchema,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import medicalRecordService from "@/services/medical-record.service"
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
import HanhChinhQuanLyNBSections from "./medical-record-form/HanhChinhQuanLyNBSections"
import ChanDoanTinhTrangRaVienSections from "./medical-record-form/ChanDoanTinhTrangRaVienSections"
import TongKetBenhAnSections from "./medical-record-form/TongKetBenhAnSections"
import TheoDoiDieuTriTable from "./medical-record-form/TheoDoiDieuTriTable"
import PhieuPhauThuatForm from "./medical-record-form/PhieuPhauThuatForm"
import { getAccentForRecordType } from "./medical-record-form/SectionHeading"
import ParaclinicalPanel from "./ParaclinicalPanel"

interface EditMedicalRecordClientProps {
  recordId: string
  appointmentId?: string
}

/**
 * EditMedicalRecordClient — Unified form editing.
 * Uses the same single-page layout as CreateMedicalRecordClient.
 * Loads formData from MongoDB and populates the form.
 */
export default function EditMedicalRecordClient({
  recordId,
  appointmentId,
}: EditMedicalRecordClientProps) {
  const router = useRouter()

  const [recordType, setRecordType] = useState<MedicalRecordType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ recordId: string } | null>(null)
  const [initialData, setInitialData] = useState<MedicalRecordFormDataPayload | null>(null)

  // Load existing record data
  useEffect(() => {
    const fetchRecord = async () => {
      setLoadingRecord(true)
      setLoadError(null)
      try {
        const response = await medicalRecordService.getById(recordId)
        if (!response?.data?.isSuccess || !response.data.medicalRecord) {
          setLoadError("Không tìm thấy hồ sơ bệnh án")
          return
        }

        const record = response.data.medicalRecord
        const formData = record.formData as MedicalRecordFormDataPayload | null

        if (formData) {
          setInitialData(formData)
        } else {
          // Legacy record without formData - show error
          setLoadError("Hồ sơ bệnh án không có dữ liệu form (phiên bản cũ)")
          return
        }

        setRecordType(record.recordType as MedicalRecordType)
      } catch (err) {
        console.error("Error fetching record:", err)
        setLoadError("Không thể tải hồ sơ bệnh án để chỉnh sửa")
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [recordId])

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

  // Update default values when initialData loads
  useEffect(() => {
    if (initialData) {
      methods.reset(initialData)
    }
  }, [initialData, methods])

  // ─── Submit handler ─────────────────────────────────────────────────
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
      const response = await medicalRecordService.update(recordId, {
        formData: values,
      })

      if (!response?.data?.isSuccess) {
        setServerError(getMessage(response?.codeMessage) ?? "Cập nhật bệnh án thất bại")
        setSubmitting(false)
        return
      }

      setSuccessInfo({ recordId })
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Lỗi không xác định khi gọi BE"
      )
    } finally {
      setSubmitting(false)
    }
  })

  // ─── Loading State ─────────────────────────────────────────────────
  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Đang tải dữ liệu</h3>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{loadError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Success State ─────────────────────────────────────────────────
  if (successInfo) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Đã cập nhật bệnh án thành công
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Medical Record ID:{" "}
            <code className="rounded bg-white px-2 py-0.5">{successInfo.recordId}</code>
          </p>
        </div>

        <ParaclinicalPanel recordId={successInfo.recordId} />

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/doctor/medical-records")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Về danh sách
          </button>
          <button
            type="button"
            onClick={() => router.push(`/doctor/medical-records/${successInfo.recordId}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    )
  }

  // ─── Record Type Selection (should not happen in edit, but fallback) ───
  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800">Không xác định được loại bệnh án</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
      </div>
    )
  }

  // ─── Main Edit Form ─────────────────────────────────────────────────
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8"
        aria-label={`Chỉnh sửa ${MEDICAL_RECORD_TYPE_LABELS[recordType]}`}
      >
        {/* Header */}
        <header className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${accentText(recordType)}`}>
                {recordType.replace("MS", "MS ")}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {MEDICAL_RECORD_TYPE_LABELS[recordType]}
              </h1>
              <p className="mt-1 text-xs text-gray-600">Chỉnh sửa bệnh án</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 print:hidden"
                title="In bệnh án ra PDF/A4"
              >
                <Printer className="h-4 w-4" />
                In bệnh án (A4)
              </button>
            </div>
          </div>
        </header>

        {/* Mini TOC */}
        <nav
          aria-label="Mục lục bệnh án"
          className="sticky top-2 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur print:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Mục lục:</span>
            <a href="#hanh-chinh" className="hover:text-indigo-600">
              Hành chính
            </a>
            <a href="#benh-an" className="hover:text-indigo-600">
              Bệnh Án
            </a>
            <a href="#kham-benh" className="hover:text-indigo-600">
              Khám bệnh
            </a>
            <a href="#chan-doan" className="hover:text-indigo-600">
              Chẩn đoán
            </a>
            <a href="#tong-ket" className="hover:text-indigo-600">
              Tổng kết
            </a>
          </div>
        </nav>

        {/* I. HÀNH CHÍNH */}
        <section id="hanh-chinh">
          <HanhChinhQuanLyNBSections recordType={recordType} />
        </section>

        {/* A. BỆNH ÁN */}
        <div id="benh-an">
          {recordType === "MS24_GLAUCOMA" ? (
            <GlaucomaFormSections />
          ) : (
            <SubspecialtySections recordType={recordType} />
          )}
        </div>

        {/* III. KHÁM BỆNH */}
        <div id="kham-benh">
          <UniversalEyeExamSections />
        </div>

        {/* IV. CHẨN ĐOÁN MÃ ICD */}
        <section id="chan-doan">
          <ChanDoanTinhTrangRaVienSections />
        </section>

        {/* MS22: Theo dõi điều trị */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TheoDoiDieuTriTable />
          </section>
        )}

        {/* MS22: Phiếu Phẫu thuật */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <PhieuPhauThuatForm />
          </section>
        )}

        {/* V. TỔNG KẾT BỆNH ÁN */}
        <section id="tong-ket">
          <TongKetBenhAnSections recordType={recordType} />
        </section>

        {/* Error Banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-lg ${accentButton(recordType)} px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

function accentText(recordType: string): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "text-rose-700"
    case "MS22_ANTERIOR":
      return "text-teal-700"
    case "MS23_FUNDUS":
      return "text-amber-700"
    case "MS24_GLAUCOMA":
      return "text-indigo-700"
    case "MS25_STRABISMUS_PTOSIS":
      return "text-sky-700"
    case "MS26_PEDIATRIC":
      return "text-violet-700"
    default:
      return "text-gray-700"
  }
}

function accentButton(recordType: string): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "bg-rose-600"
    case "MS22_ANTERIOR":
      return "bg-teal-600"
    case "MS23_FUNDUS":
      return "bg-amber-600"
    case "MS24_GLAUCOMA":
      return "bg-indigo-600"
    case "MS25_STRABISMUS_PTOSIS":
      return "bg-sky-600"
    case "MS26_PEDIATRIC":
      return "bg-violet-600"
    default:
      return "bg-gray-600"
  }
}
