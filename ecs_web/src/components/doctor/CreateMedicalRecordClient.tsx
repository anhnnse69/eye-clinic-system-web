"use client"

/**
 * CreateMedicalRecordClient — MongoDB-backed JSON envelope form.
 *
 * Renders the 6 chuẩn ophthalmic record templates (MS21-26) per
 * `benh_an_mat_*.md`. Form data is shipped as raw JSON in `formData`,
 * persisted by the backend to MongoDB (collection: medical_records).
 *
 * After successful creation, a ParaclinicalPanel is shown so the doctor
 * can attach OCT / VisualField / Ultrasound requests and AI suggestions.
 */
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, AlertCircle, CheckCircle2, Printer, Eye } from "lucide-react"

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
import PrescriptionSection from "./medical-record-form/PrescriptionSection"
import { getAccentForRecordType, SectionHeading } from "./medical-record-form/SectionHeading"
import ParaclinicalPanel from "./ParaclinicalPanel"

interface CreateMedicalRecordClientProps {
  appointmentId: string
  patientProfileId?: string
  initialRecordType?: string
}

export default function CreateMedicalRecordClient({
  appointmentId,
  patientProfileId,
  initialRecordType,
}: CreateMedicalRecordClientProps) {
  const router = useRouter()

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

  const methods = useForm<MedicalRecordFormDataPayload>({
    resolver: zodResolver(medicalRecordFormDataSchema) as unknown as Resolver<MedicalRecordFormDataPayload>,
    mode: "onBlur",
    defaultValues: {
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

  // ─── Chọn loại bệnh án ─────────────────────────────────────────────
  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chọn loại bệnh án</h1>
          <p className="mt-1 text-sm text-gray-600">
            Bệnh án sẽ được lưu trữ trên <strong>MongoDB</strong> (raw JSON, encrypted in transit).
            Chọn 1 trong 6 mẫu chuẩn:
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {MEDICAL_RECORD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRecordType(t)}
              className="group flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:shadow"
            >
              <span className="text-sm font-semibold text-indigo-600">
                {t.replace("MS", "MS ")}
              </span>
              <span className="mt-1 text-sm text-gray-700">
                {MEDICAL_RECORD_TYPE_LABELS[t]}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Quay lại
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
            Đã tạo bệnh án thành công
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
          "Thiếu patientProfileId — vui lòng mở form từ trang bệnh nhân hoặc truyền ?patientProfileId=..."
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
        err instanceof Error ? err.message : "Lỗi không xác định khi gọi BE"
      )
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8"
        aria-label={MEDICAL_RECORD_TYPE_LABELS[recordType]}
      >
        {/* Header — cho in ấn */}
        <header className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${accentText(recordType)}`}>
                {recordType.replace("MS", "MS ")}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {MEDICAL_RECORD_TYPE_LABELS[recordType]}
              </h1>
              <p className="mt-1 hidden text-xs text-gray-600 print:block">
                <strong>BỆNH ÁN MẮT — MS {recordType.replace("MS", "")}/BV-01</strong>
              </p>
            </div>
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
        </header>

        {/* Mini TOC — cho phép cuộn nhanh đến section khi form dài */}
        <nav
          aria-label="Mục lục bệnh án"
          className="sticky top-2 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur print:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Mục lục:</span>
            <a href="#hanh-chinh" className="hover:text-indigo-600">
              Hành chính
            </a>
            <a href="#quan-ly-nb" className="hover:text-indigo-600">
              Quản lý NB
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
            <a href="#dieu-tri" className="hover:text-indigo-600">
              Điều trị
            </a>
            <a href="#tinh-trang-ra-vien" className="hover:text-indigo-600">
              Tình trạng ra viện
            </a>
            <a href="#tong-ket" className="hover:text-indigo-600">
              Tổng kết
            </a>
          </div>
        </nav>

        {/* I. HÀNH CHÍNH (mục 1-11) */}
        <section id="hanh-chinh">
          <HanhChinhQuanLyNBSections recordType={recordType} />
        </section>

        {/* II. QUẢN LÝ NGƯỜI BỆNH (mục 12-19) — render bên trong HanhChinhQuanLyNBSections */}
        <section id="quan-ly-nb" />

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

        {/* IV. CHẨN ĐOÁN MÃ ICD (mục 20-25) — luôn render cho mọi mẫu */}
        <section id="chan-doan">
          <ChanDoanTinhTrangRaVienSections />
        </section>

        {/* MS22 Bán phần trước — bảng "Theo dõi điều trị" (trang 8-9 mẫu) */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TheoDoiDieuTriTable />
          </section>
        )}

        {/* MS22 Bán phần trước — Phiếu Phẫu thuật / Thủ thuật (trang 9-10 mẫu) */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <PhieuPhauThuatForm />
          </section>
        )}

        {/* V. TỔNG KẾT BỆNH ÁN (trang cuối) — luôn render */}
        <section id="tong-ket">
          <TongKetBenhAnSections recordType={recordType} />
        </section>

        {/* VI. ĐƠN THUỐC - Prescription */}
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
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-lg ${accentButton(recordType)} px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu vào MongoDB…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Hoàn tất & lưu bệnh án
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